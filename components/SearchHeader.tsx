import React from 'react';
import { Theme, SearchFilters } from '../types';
import { Moon, Sun, Coffee, Sprout, Trophy } from 'lucide-react';
import SearchBar from './SearchBar';

interface SearchHeaderProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isSearching: boolean;
  currentQuery?: string;
  onGoHome: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  showSearchInput: boolean;
  onViewTree: () => void;
  onViewBadges: () => void;
  isLandingPage?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  onSearch, 
  isSearching, 
  currentQuery, 
  onGoHome,
  currentTheme,
  onThemeChange,
  showSearchInput,
  onViewTree,
  onViewBadges,
  isLandingPage = false
}) => {

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${isLandingPage ? 'bg-transparent absolute w-full border-none' : 'bg-main/90 backdrop-blur-md border-b border-borderSkin'} px-4 md:px-6 py-3 md:py-4`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4">
        
        {/* Logo Area */}
        <div 
          onClick={onGoHome}
          className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 bg-textMain text-main rounded-lg flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            O
          </div>
          <h1 className="font-serif font-bold text-xl tracking-tight text-textMain hidden sm:block">
            OpenParallax
          </h1>
        </div>

        {/* Header Search - Hidden on mobile if not needed, or adapts width. ALSO HIDDEN ON LANDING PAGE */}
        <div className={`flex-1 max-w-lg mx-2 md:mx-4 transition-opacity duration-300 ${showSearchInput && !isLandingPage ? 'opacity-100' : 'opacity-0 pointer-events-none hidden md:block'}`}>
           <SearchBar 
             variant="compact" 
             onSearch={onSearch} 
             initialQuery={currentQuery}
           />
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {/* Navigation Buttons - Hidden on Landing Page */}
          {!isLandingPage && (
            <>
              {/* Achievements Button - Icon on Mobile, Text on Desktop */}
              <button
                onClick={onViewBadges}
                className="flex items-center gap-2 px-2.5 py-2 md:px-3 md:py-1.5 rounded-full bg-surface border border-borderSkin text-textMain hover:bg-amber-50 hover:border-amber-200 transition-colors text-sm font-medium shadow-sm"
                title="Achievements"
                aria-label="View Achievements"
              >
                <Trophy size={18} className="text-amber-600"/>
                <span className="hidden md:inline">Achievements</span>
              </button>

              {/* Tree Button - Icon on Mobile, Text on Desktop */}
              <button
                onClick={onViewTree}
                className="flex items-center gap-2 px-2.5 py-2 md:px-3 md:py-1.5 rounded-full bg-surface border border-borderSkin text-textMain hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-sm font-medium shadow-sm"
                title="My Knowledge Tree"
                aria-label="View Knowledge Tree"
              >
                <Sprout size={18} className="text-emerald-600"/>
                <span className="hidden md:inline">My Tree</span>
              </button>
            </>
          )}

          {/* Theme Toggle - Collapsed on very small screens if needed, but fits mostly */}
          <div className={`hidden sm:flex items-center gap-1 rounded-full p-1 shrink-0 ${isLandingPage ? 'bg-transparent' : 'bg-surface border border-borderSkin shadow-sm'}`}>
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
          
          {/* Mobile Theme Toggle (Simple Cycler) - Visible only on XS screens */}
          <button 
             onClick={() => {
               if (currentTheme === 'sepia') onThemeChange('light');
               else if (currentTheme === 'light') onThemeChange('dark');
               else onThemeChange('sepia');
             }}
             className={`sm:hidden p-2 rounded-full border text-textMain shadow-sm ${isLandingPage ? 'bg-main/50 border-transparent' : 'bg-surface border-borderSkin'}`}
          >
            {currentTheme === 'sepia' ? <Coffee size={18} /> : currentTheme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

        </div>
      </div>
    </header>
  );
};

export default SearchHeader;