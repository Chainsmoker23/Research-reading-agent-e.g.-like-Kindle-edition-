
import { Paper, ReadHistoryItem } from '../types';
import { Client } from '@neondatabase/serverless';

export interface UserProfile {
  id: string;
  score: number;
  rank: string;
  joinedAt: number;
}

const HISTORY_KEY = 'parallax_history';
const PROFILES_KEY = 'parallax_profiles';

// --- CONFIGURATION ---
const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_C2gOYZeQ6WwR@ep-silent-pond-abyorp16-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

// --- DB CONNECTION HELPER ---

/**
 * Executes a single SQL query using an atomic Client connection.
 * This is preferred over Pool for browser environments to avoid WebSocket/EventListener issues.
 */
const executeSql = async (text: string, params?: any[]) => {
  const client = new Client({ connectionString: DEFAULT_NEON_URL });
  try {
    await client.connect();
    const result = await client.query(text, params);
    return result;
  } finally {
    // Always close the connection immediately to prevent lingering socket issues
    await client.end();
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

/**
 * Ensures necessary tables exist.
 * Uses a single multi-statement block if possible, or sequential execution.
 */
const ensureTablesExist = async () => {
  try {
    await executeSql(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key_name TEXT PRIMARY KEY,
        key_value TEXT
      );
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        score INTEGER DEFAULT 0,
        rank TEXT,
        last_active TIMESTAMP DEFAULT NOW(),
        joined_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS reading_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        paper_title TEXT,
        paper_authors TEXT,
        paper_year TEXT,
        paper_description TEXT,
        paper_source TEXT,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, paper_title)
      );
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        action_type TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (e) {
    console.error("Error initializing tables:", e);
  }
};

// --- SHARED API KEY MANAGEMENT ---

export const getGlobalApiKeys = async (): Promise<string[]> => {
  try {
    const { rows } = await executeSql(`SELECT key_value FROM system_settings WHERE key_name = 'shared_api_keys'`);
    if (rows.length > 0) {
      return JSON.parse(rows[0].key_value);
    }
  } catch (e: any) {
    // If table doesn't exist, try to create it
    if (e.message?.includes('does not exist')) {
       await ensureTablesExist();
    }
  }
  return ['', '', '', '', ''];
};

export const saveGlobalApiKeys = async (keys: string[]): Promise<void> => {
  // Ensure tables exist before writing
  await ensureTablesExist();
  
  try {
    await executeSql(`
      INSERT INTO system_settings (key_name, key_value) 
      VALUES ('shared_api_keys', $1)
      ON CONFLICT (key_name) 
      DO UPDATE SET key_value = $1
    `, [JSON.stringify(keys)]);
  } catch (e: any) {
    console.error("DB Save Error:", e);
    throw new Error(e.message || "Database write failed");
  }
};

// --- LOGGING ---

export const logActivity = async (action: string, details: string) => {
  const userId = getCurrentUserId();
  
  if (userId === 'guest') return;

  try {
    // We execute these blindly without waiting for response to keep UI snappy
    // Note: In strict 'Client' mode, we must await the connect/end cycle, 
    // so we wrap it in a non-blocking promise chain if we don't want to await it.
    executeSql(
      `INSERT INTO activity_log (user_id, action_type, details) VALUES ($1, $2, $3)`,
      [userId, action, details]
    ).catch(console.warn);
    
    executeSql(
      `INSERT INTO user_profiles (user_id, last_active) VALUES ($1, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET last_active = NOW()`,
      [userId]
    ).catch(console.warn);
  } catch (e) {
    console.warn("Log activity failed", e);
  }
};

// --- CORE DATA METHODS ---

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  const userId = getCurrentUserId();
  let history: ReadHistoryItem[] = [];

  // Local Fallback first
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    history = allHistory[userId] || [];
  } catch (e) {}

  if (userId !== 'guest') {
    try {
      const { rows } = await executeSql(
        `SELECT * FROM reading_history WHERE user_id = $1 ORDER BY read_at DESC`,
        [userId]
      );
      
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
          status: 'Peer Reviewed'
        }
      }));

      if (dbHistory.length >= history.length) {
        history = dbHistory;
      }
    } catch (e) {
       console.warn("Fetch history failed", e);
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

  // Local Save
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    const userHistory: ReadHistoryItem[] = allHistory[userId] || [];
    if (!userHistory.find(h => h.paper.title === paper.title)) {
      allHistory[userId] = [newItem, ...userHistory];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
    }
  } catch (e) {}

  // DB Save
  if (userId !== 'guest') {
    try {
      await ensureTablesExist();
      await executeSql(
        `INSERT INTO reading_history (user_id, paper_title, paper_authors, paper_year, paper_description, paper_source)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, paper_title) DO NOTHING`,
        [userId, paper.title, paper.authors, paper.year, paper.description, paper.source]
      );
      await logActivity('READ_PAPER', paper.title);
      await updateUserScore(100); 
    } catch (err) {
      console.error("NeonDB Save Error", err);
    }
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
    try {
      await ensureTablesExist();
      // Create if not exists
      await executeSql(
        `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, 
        [userId]
      );

      const { rows } = await executeSql(
        `SELECT score, rank FROM user_profiles WHERE user_id = $1`, 
        [userId]
      );
      
      if (rows.length > 0) {
        profile.score = rows[0].score;
        profile.rank = rows[0].rank || profile.rank;
      }
    } catch (e) {}
  }

  return profile;
};

const updateUserScore = async (points: number) => {
  const userId = getCurrentUserId();
  if (userId !== 'guest') {
    try {
      await executeSql(
        `UPDATE user_profiles SET score = score + $1, last_active = NOW() WHERE user_id = $2`,
        [points, userId]
      );
    } catch (e) {}
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
