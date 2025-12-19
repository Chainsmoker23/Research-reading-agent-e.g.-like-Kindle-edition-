
import { supabase } from './supabaseClient';
import { Paper, ReadHistoryItem } from '../types';

export const saveReadPaper = async (userId: string, paper: Paper): Promise<ReadHistoryItem | null> => {
  const { data, error } = await supabase
    .from('reading_history')
    .insert([
      {
        user_id: userId,
        paper_id: paper.id,
        paper_data: paper
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving paper:', error);
    return null;
  }

  return {
    id: data.id,
    paper: data.paper_data as Paper,
    timestamp: new Date(data.created_at).getTime()
  };
};

export const getReadingHistory = async (userId: string): Promise<ReadHistoryItem[]> => {
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    paper: item.paper_data as Paper,
    timestamp: new Date(item.created_at).getTime()
  }));
};
