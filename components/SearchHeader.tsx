import React from 'react';
import { Theme, SearchFilters } from '../types';
import { Moon, Sun, Coffee } from 'lucide-react';
import SearchBar from './SearchBar';

interface SearchHeaderProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isSearching: boolean;
  currentQuery?: string;
  onGoHome: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  showSearchInput: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  onSearch, 
  isSearching, 
  currentQuery, 
  onGoHome,
  currentTheme,
  onThemeChange,
  showSearchInput
}) => {

  return (
    <header className="sticky top-0 z-10 bg-main/90 backdrop-blur-md border-b border-borderSkin px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div 
          onClick={onGoHome}
          className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-textMain text-main rounded-lg flex items-center justify-center font-serif font-bold text-lg">
            S
          </div>
          <h1 className="font-serif font-bold text-xl tracking-tight text-textMain hidden sm:block">
            ScholarFlow
          </h1>
        </div>

        {/* Header Search - Only shown when not on home screen */}
        <div className={`flex-1 max-w-lg mx-4 transition-opacity duration-300 ${showSearchInput ? 'opacity-100' : 'opacity-0 pointer-events-none hidden md:block'}`}>
           <SearchBar 
             variant="compact" 
             onSearch={onSearch} 
             initialQuery={currentQuery}
           />
        </div>

        <div className="flex items-center gap-1 bg-surface border border-borderSkin rounded-full p-1 shadow-sm shrink-0">
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