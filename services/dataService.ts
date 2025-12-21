
import { Paper, ReadHistoryItem } from '../types';

export interface UserProfile {
  id: string;
  score: number;
  rank: string;
  joinedAt: number;
}

const HISTORY_KEY = 'parallax_history';
const PROFILES_KEY = 'parallax_profiles';

// Helper to get current user ID
const getCurrentUserId = () => {
  const userJson = localStorage.getItem('parallax_user_session');
  return userJson ? JSON.parse(userJson).id : 'guest';
};

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  const userId = getCurrentUserId();
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  return allHistory[userId] || [];
};

export const saveReadPaper = async (paper: Paper): Promise<ReadHistoryItem> => {
  const userId = getCurrentUserId();
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
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
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const userId = getCurrentUserId();
  const allProfiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
  
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
};

const updateUserScore = async (points: number) => {
  const userId = getCurrentUserId();
  const allProfiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
  
  if (allProfiles[userId]) {
    allProfiles[userId].score += points;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
  }
};
