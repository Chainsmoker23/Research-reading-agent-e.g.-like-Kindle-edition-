import React, { useState } from 'react';
import { Theme } from '../types';
import { Moon, Sun, Coffee } from 'lucide-react';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  currentQuery?: string;
  onGoHome: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  onSearch, 
  isSearching, 
  currentQuery, 
  onGoHome,
  currentTheme,
  onThemeChange
}) => {
  const [query, setQuery] = useState(currentQuery || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-main/90 backdrop-blur-md border-b border-borderSkin px-6 py-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div 
          onClick={onGoHome}
          className="cursor-pointer hover:opacity-70 transition-opacity"
        >
          <h1 className="font-serif font-bold text-xl tracking-tight text-textMain">
            ScholarFlow
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-lg relative mx-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for research topics..."
            className="w-full bg-surface border border-borderSkin rounded-full px-5 py-2.5 text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent shadow-sm transition-all font-medium text-sm"
          />
        </form>

        <div className="flex items-center gap-1 bg-surface border border-borderSkin rounded-full p-1 shadow-sm">
          <button
            onClick={() => onThemeChange('sepia')}
            className={`p-1.5 rounded-full transition-all ${currentTheme === 'sepia' ? 'bg-amber-200 text-stone-900 shadow-sm' : 'text-textMuted hover:bg-main'}`}
            title="Sepia Mode"
          >
            <Coffee size={16} />
          </button>
          <button
            onClick={() => onThemeChange('light')}
            className={`p-1.5 rounded-full transition-all ${currentTheme === 'light' ? 'bg-stone-200 text-stone-900 shadow-sm' : 'text-textMuted hover:bg-main'}`}
            title="Light Mode"
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`p-1.5 rounded-full transition-all ${currentTheme === 'dark' ? 'bg-stone-700 text-stone-100 shadow-sm' : 'text-textMuted hover:bg-main'}`}
            title="Dark Mode"
          >
            <Moon size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;