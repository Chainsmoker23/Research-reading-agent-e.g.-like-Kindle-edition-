export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: string;
  description: string;
  source: string;
  status: string; // 'Preprint' | 'Peer Reviewed'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  SEARCH = 'SEARCH',
  LIST = 'LIST',
  READER = 'READER',
}

export interface ReadingState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}

export type Theme = 'sepia' | 'dark' | 'light';

export interface SearchFilters {
  startYear?: string;
  endYear?: string;
  source?: string;
}