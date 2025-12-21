
import { Paper, ReadHistoryItem } from '../types';

export interface UserProfile {
  id: string;
  score: number;
  rank: string;
  joinedAt: number;
}

const HISTORY_KEY = 'parallax_history';
const PROFILES_KEY = 'parallax_profiles';

// Helper to get current user ID safely
const getCurrentUserId = () => {
  if (typeof window === 'undefined') return 'guest';
  try {
    const userJson = localStorage.getItem('parallax_user_session');
    return userJson ? JSON.parse(userJson).id : 'guest';
  } catch (e) {
    return 'guest';
  }
};

// --- DATA ACCESS METHODS ---

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  try {
    const userId = getCurrentUserId();
    const raw = localStorage.getItem(HISTORY_KEY);
    // Parse safely
    const allHistory = raw ? JSON.parse(raw) : {};
    return allHistory[userId] || [];
  } catch (error) {
    console.warn("Failed to load history, storage might be corrupted:", error);
    return [];
  }
};

export const saveReadPaper = async (paper: Paper): Promise<ReadHistoryItem> => {
  try {
    const userId = getCurrentUserId();
    const raw = localStorage.getItem(HISTORY_KEY);
    const allHistory = raw ? JSON.parse(raw) : {};
    const userHistory: ReadHistoryItem[] = allHistory[userId] || [];

    // Check if already exists to prevent duplicates
    const existing = userHistory.find(h => h.paper.title === paper.title);
    if (existing) {
      return existing;
    }

    const newItem: ReadHistoryItem = {
      id: Date.now().toString(),
      paper,
      timestamp: Date.now()
    };

    // Add to start of list
    allHistory[userId] = [newItem, ...userHistory];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
    
    // Award points
    await updateUserScore(100);

    return newItem;
  } catch (error) {
    console.error("Failed to save paper:", error);
    throw new Error("Could not save progress due to storage error.");
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const userId = getCurrentUserId();
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const allProfiles = raw ? JSON.parse(raw) : {};
    
    if (!allProfiles[userId]) {
      // Initialize profile if not exists
      allProfiles[userId] = {
        id: userId,
        score: 0,
        rank: 'Novice',
        joinedAt: Date.now()
      };
      localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
    }
    
    return allProfiles[userId];
  } catch (error) {
    console.error("Profile load error:", error);
    // Return default temporary profile on error
    return { id: userId, score: 0, rank: 'Novice', joinedAt: Date.now() };
  }
};

const updateUserScore = async (points: number) => {
  const userId = getCurrentUserId();
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const allProfiles = raw ? JSON.parse(raw) : {};
    
    if (allProfiles[userId]) {
      allProfiles[userId].score += points;
      localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
    }
  } catch (error) {
    console.error("Score update failed:", error);
  }
};

// --- BACKUP & SECURITY METHODS ---

/**
 * Creates a JSON blob containing all user history and profiles.
 * Used for manual backups to ensure data security.
 */
export const createBackupBlob = (): Blob => {
  try {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      generatedBy: 'OpenParallax',
      data: {
        history: localStorage.getItem(HISTORY_KEY) ? JSON.parse(localStorage.getItem(HISTORY_KEY)!) : {},
        profiles: localStorage.getItem(PROFILES_KEY) ? JSON.parse(localStorage.getItem(PROFILES_KEY)!) : {}
      }
    };
    return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  } catch (e) {
    console.error("Backup generation failed", e);
    throw new Error("Failed to generate backup.");
  }
};

/**
 * Restores data from a JSON string.
 * Validates format before writing to localStorage.
 */
export const restoreFromBackup = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        // Basic validation
        if (!backup.data || !backup.version) {
          throw new Error("Invalid backup file format. Missing data or version.");
        }

        // Restore Data
        if (backup.data.history) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(backup.data.history));
        }
        if (backup.data.profiles) {
          localStorage.setItem(PROFILES_KEY, JSON.stringify(backup.data.profiles));
        }
        
        resolve(true);
      } catch (err) {
        console.error("Restore failed", err);
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
