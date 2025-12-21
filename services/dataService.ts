
import { Paper, ReadHistoryItem } from '../types';
import { neon } from '@neondatabase/serverless';

export interface UserProfile {
  id: string;
  score: number;
  rank: string;
  joinedAt: number;
}

const HISTORY_KEY = 'parallax_history';
const PROFILES_KEY = 'parallax_profiles';

// --- CONFIGURATION ---
const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_C2gOYZeQ6WwR@ep-silent-pond-abyorp16-pooler.eu-west-2.aws.neon.tech/neondb';

// --- DB CONNECTION HELPER ---

/**
 * Executes a single SQL query using the Neon HTTP driver.
 * Returns { rows: [] } on success, or null on failure (graceful degradation).
 */
const executeSql = async (text: string, params?: any[]) => {
  try {
    const sql = neon(DEFAULT_NEON_URL);
    // Cast to any to bypass potential TS/TemplateStringsArray mismatches
    const result = await (sql as any)(text, params || []);
    return { rows: result };
  } catch (err: any) {
    // Log warning but do not throw, allowing app to degrade to local storage
    console.warn("NeonDB Ops Error:", err.message);
    return null;
  }
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

// --- SHARED API KEY MANAGEMENT ---

export const getGlobalApiKeys = async (): Promise<string[]> => {
  // Try DB first
  const result = await executeSql(`SELECT key_value FROM system_settings WHERE key_name = 'shared_api_keys'`);
  if (result && result.rows.length > 0) {
    try {
      return JSON.parse(result.rows[0].key_value);
    } catch (e) { console.error(e); }
  }
  return ['', '', '', '', ''];
};

export const saveGlobalApiKeys = async (keys: string[]): Promise<boolean> => {
  // Try DB
  const result = await executeSql(`
    INSERT INTO system_settings (key_name, key_value) 
    VALUES ('shared_api_keys', $1)
    ON CONFLICT (key_name) 
    DO UPDATE SET key_value = $1
  `, [JSON.stringify(keys)]);

  // Return true if DB save succeeded, false otherwise
  return !!result;
};

// --- LOGGING ---

export const logActivity = async (action: string, details: string) => {
  const userId = getCurrentUserId();
  if (userId === 'guest') return;

  // Fire and forget
  executeSql(
    `INSERT INTO activity_log (user_id, action_type, details) VALUES ($1, $2, $3)`,
    [userId, action, details]
  ).catch(() => {});
  
  executeSql(
    `INSERT INTO user_profiles (user_id, last_active) VALUES ($1, NOW()) 
     ON CONFLICT (user_id) DO UPDATE SET last_active = NOW()`,
    [userId]
  ).catch(() => {});
};

// --- CORE DATA METHODS ---

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  const userId = getCurrentUserId();
  let history: ReadHistoryItem[] = [];

  // 1. Load Local Storage (Fastest)
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    history = allHistory[userId] || [];
  } catch (e) {}

  // 2. Try to merge from DB if logged in
  if (userId !== 'guest') {
    const result = await executeSql(
      `SELECT * FROM reading_history WHERE user_id = $1 ORDER BY read_at DESC`,
      [userId]
    );
    
    if (result && result.rows) {
      const dbHistory: ReadHistoryItem[] = result.rows.map((row: any) => ({
        id: row.id.toString(),
        timestamp: new Date(row.read_at).getTime(),
        paper: {
          id: row.id.toString(),
          title: row.paper_title,
          authors: row.paper_authors,
          year: row.paper_year,
          description: row.paper_description,
          source: row.paper_source,
          status: 'Peer Reviewed'
        }
      }));

      if (dbHistory.length > history.length) {
        history = dbHistory;
      }
    }
  }

  return history;
};

export const saveReadPaper = async (paper: Paper): Promise<ReadHistoryItem> => {
  const userId = getCurrentUserId();
  
  const newItem: ReadHistoryItem = {
    id: Date.now().toString(),
    paper,
    timestamp: Date.now()
  };

  // 1. Save to Local Storage
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    const userHistory: ReadHistoryItem[] = allHistory[userId] || [];
    if (!userHistory.find(h => h.paper.title === paper.title)) {
      allHistory[userId] = [newItem, ...userHistory];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
    }
  } catch (e) {}

  // 2. Save to DB (Background)
  if (userId !== 'guest') {
    executeSql(
      `INSERT INTO reading_history (user_id, paper_title, paper_authors, paper_year, paper_description, paper_source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, paper_title) DO NOTHING`,
      [userId, paper.title, paper.authors, paper.year, paper.description, paper.source]
    ).then(() => {
        logActivity('READ_PAPER', paper.title);
        updateUserScore(100); 
    }).catch(() => {});
  } else {
     await updateUserScore(100);
  }

  return newItem;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const userId = getCurrentUserId();
  
  let profile: UserProfile = {
    id: userId,
    score: 0,
    rank: 'Curious Observer',
    joinedAt: Date.now()
  };

  if (userId !== 'guest') {
    // Create profile if not exists
    await executeSql(
      `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, 
      [userId]
    );

    const result = await executeSql(
      `SELECT score, rank FROM user_profiles WHERE user_id = $1`, 
      [userId]
    );
    
    if (result && result.rows.length > 0) {
      profile.score = result.rows[0].score;
      profile.rank = result.rows[0].rank || profile.rank;
    }
  }

  return profile;
};

const updateUserScore = async (points: number) => {
  const userId = getCurrentUserId();
  if (userId !== 'guest') {
    await executeSql(
      `UPDATE user_profiles SET score = score + $1, last_active = NOW() WHERE user_id = $2`,
      [points, userId]
    );
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
