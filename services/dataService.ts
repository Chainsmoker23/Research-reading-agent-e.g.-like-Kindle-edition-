
import { Paper, ReadHistoryItem } from '../types';
import { Pool } from '@neondatabase/serverless';

export interface UserProfile {
  id: string;
  score: number;
  rank: string;
  joinedAt: number;
}

const HISTORY_KEY = 'parallax_history';
const PROFILES_KEY = 'parallax_profiles';

// --- CONFIGURATION ---
// Default connection string for the app instance.
// In a public production app, this should be an environment variable to avoid exposure.
const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_C2gOYZeQ6WwR@ep-silent-pond-abyorp16-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// --- DB CONNECTION ---

const getDbPool = () => {
  if (typeof window === 'undefined') return null;
  // Use user-provided string from settings, or fall back to the built-in default
  const connectionString = localStorage.getItem('neon_db_url') || DEFAULT_NEON_URL;
  if (!connectionString) return null;
  
  return new Pool({ connectionString });
};

// --- HELPER METHODS ---

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return 'guest';
  try {
    const userJson = localStorage.getItem('parallax_user_session');
    return userJson ? JSON.parse(userJson).id : 'guest';
  } catch (e) {
    return 'guest';
  }
};

/**
 * Logs an action to NeonDB 'activity_log' table.
 */
export const logActivity = async (action: string, details: string) => {
  const userId = getCurrentUserId();
  const pool = getDbPool();
  
  if (userId === 'guest') return;

  console.log(`[Activity] ${userId} - ${action}: ${details}`);

  if (pool) {
    try {
      // 1. Log the specific activity
      await pool.query(
        `INSERT INTO activity_log (user_id, action_type, details) VALUES ($1, $2, $3)`,
        [userId, action, details]
      );
      
      // 2. Update the user's last_active timestamp
      // We use INSERT ... ON CONFLICT to handle cases where user might not exist in DB yet
      await pool.query(
        `INSERT INTO user_profiles (user_id, last_active) VALUES ($1, NOW()) 
         ON CONFLICT (user_id) DO UPDATE SET last_active = NOW()`,
        [userId]
      );
    } catch (e) {
      console.warn("Failed to log activity to NeonDB. Check connection.", e);
    }
  }
};

// --- CORE DATA METHODS ---

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  const userId = getCurrentUserId();
  let history: ReadHistoryItem[] = [];

  // 1. Try Loading from LocalStorage (Fastest)
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    history = allHistory[userId] || [];
  } catch (error) {
    console.warn("LocalStorage corrupted", error);
  }

  // 2. Background Sync with NeonDB
  const pool = getDbPool();
  if (pool && userId !== 'guest') {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM reading_history WHERE user_id = $1 ORDER BY read_at DESC`,
        [userId]
      );
      
      // Map DB rows to app type
      const dbHistory: ReadHistoryItem[] = rows.map((row: any) => ({
        id: row.id.toString(),
        timestamp: new Date(row.read_at).getTime(),
        paper: {
          id: row.id.toString(),
          title: row.paper_title,
          authors: row.paper_authors,
          year: row.paper_year,
          description: row.paper_description,
          source: row.paper_source,
          status: 'Peer Reviewed' // Default if not stored
        }
      }));

      // Simple sync strategy: if DB has more, trust DB.
      if (dbHistory.length >= history.length) {
        history = dbHistory;
        // Update local cache to match DB
        const raw = localStorage.getItem(HISTORY_KEY);
        const allHistory = raw ? JSON.parse(raw) : {};
        allHistory[userId] = history;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
      }
    } catch (e) {
      console.warn("NeonDB History Sync Failed", e);
    }
  }

  return history;
};

export const saveReadPaper = async (paper: Paper): Promise<ReadHistoryItem> => {
  const userId = getCurrentUserId();

  // 1. Save to LocalStorage immediately for UI responsiveness
  let newItem: ReadHistoryItem;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    const userHistory: ReadHistoryItem[] = allHistory[userId] || [];

    const existing = userHistory.find(h => h.paper.title === paper.title);
    if (existing) return existing;

    newItem = {
      id: Date.now().toString(),
      paper,
      timestamp: Date.now()
    };

    allHistory[userId] = [newItem, ...userHistory];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    throw new Error("Could not save to local storage.");
  }

  // 2. Save to NeonDB (Async)
  const pool = getDbPool();
  if (pool && userId !== 'guest') {
    // We don't await this so the UI doesn't block
    pool.query(
      `INSERT INTO reading_history (user_id, paper_title, paper_authors, paper_year, paper_description, paper_source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, paper_title) DO NOTHING`,
      [userId, paper.title, paper.authors, paper.year, paper.description, paper.source]
    ).then(async () => {
      await logActivity('READ_PAPER', paper.title);
      await updateUserScore(100); 
    }).catch(err => console.error("NeonDB Save Error", err));
  } else {
    // Fallback: just update local score if no DB
    await updateUserScore(100);
  }

  return newItem;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const userId = getCurrentUserId();
  
  // Default Profile
  let profile: UserProfile = {
    id: userId,
    score: 0,
    rank: 'Curious Observer',
    joinedAt: Date.now()
  };

  // 1. Load Local
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const allProfiles = raw ? JSON.parse(raw) : {};
    if (allProfiles[userId]) {
      profile = allProfiles[userId];
    }
  } catch (e) {}

  // 2. Sync with DB
  const pool = getDbPool();
  if (pool && userId !== 'guest') {
    try {
      // Ensure user exists
      await pool.query(
        `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, 
        [userId]
      );

      const { rows } = await pool.query(
        `SELECT score, rank FROM user_profiles WHERE user_id = $1`, 
        [userId]
      );
      
      if (rows.length > 0) {
        // Trust DB score if it exists
        profile.score = rows[0].score;
        profile.rank = rows[0].rank || profile.rank;
          
        // Update local cache
        const raw = localStorage.getItem(PROFILES_KEY);
        const all = raw ? JSON.parse(raw) : {};
        all[userId] = profile;
        localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.warn("NeonDB Profile Sync Failed", e);
    }
  }

  return profile;
};

const updateUserScore = async (points: number) => {
  const userId = getCurrentUserId();
  
  // 1. Local Update
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const allProfiles = raw ? JSON.parse(raw) : {};
    if (allProfiles[userId]) {
      allProfiles[userId].score += points;
      localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
    }
  } catch (e) {}

  // 2. DB Update
  const pool = getDbPool();
  if (pool && userId !== 'guest') {
    try {
      await pool.query(
        `UPDATE user_profiles SET score = score + $1, last_active = NOW() WHERE user_id = $2`,
        [points, userId]
      );
    } catch (e) {
      console.error("Failed to update score in DB", e);
    }
  }
};

// --- BACKUP UTILS ---
export const createBackupBlob = (): Blob => {
  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    data: {
      history: localStorage.getItem(HISTORY_KEY) ? JSON.parse(localStorage.getItem(HISTORY_KEY)!) : {},
      profiles: localStorage.getItem(PROFILES_KEY) ? JSON.parse(localStorage.getItem(PROFILES_KEY)!) : {}
    }
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
};

export const restoreFromBackup = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        if (backup.data.history) localStorage.setItem(HISTORY_KEY, JSON.stringify(backup.data.history));
        if (backup.data.profiles) localStorage.setItem(PROFILES_KEY, JSON.stringify(backup.data.profiles));
        resolve(true);
      } catch (err) { reject(err); }
    };
    reader.readAsText(file);
  });
};
