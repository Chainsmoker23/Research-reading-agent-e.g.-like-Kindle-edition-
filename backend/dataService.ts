
import { Paper, ReadHistoryItem } from '../types';
import { getAuthToken } from './authService';

const API_BASE = 'http://localhost:3001/api';

export interface UserProfile {
  id: string;
  score: number;
  achievements: string[];
}

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_BASE}/profile`, { headers: getHeaders() });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
};

export const saveReadPaper = async (paper: Paper): Promise<ReadHistoryItem | null> => {
  try {
    const response = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paper })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    return {
      id: data.id,
      paper: data.paper_data as Paper,
      timestamp: new Date(data.created_at).getTime()
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getReadingHistory = async (): Promise<ReadHistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/history`, { headers: getHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id,
      paper: item.paper_data as Paper,
      timestamp: new Date(item.created_at).getTime()
    }));
  } catch (e) {
    return [];
  }
};
