import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  variant: 'centered' | 'compact';
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '', initialFilters = {}, variant }) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, filters);
      setIsFilterOpen(false);
    }
  };

  const hasActiveFilters = filters.startYear || filters.endYear || filters.source;

  const clearFilters = () => {
    setFilters({});
  };

  const isCentered = variant === 'centered';

  return (
    <div className={`relative ${isCentered ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`} ref={filterRef}>
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className={`relative flex items-center transition-all duration-300 ${
          isCentered 
            ? 'shadow-lg hover:shadow-xl' 
            : 'shadow-sm'
        }`}>
          <div className="absolute left-4 text-textMuted pointer-events-none">
            <Search size={isCentered ? 24 : 18} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isCentered ? "Search topics, keywords, or questions..." : "Search research..."}
            className={`w-full bg-surface border rounded-full text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all ${
              isCentered 
                ? 'py-4 pl-14 pr-32 text-lg border-borderSkin' 
                : 'py-2 pl-10 pr-24 text-sm border-borderSkin'
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1 rounded-full transition-colors ${
                isCentered ? 'px-3 py-1.5' : 'px-2 py-1'
              } ${
                hasActiveFilters 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'text-textMuted hover:bg-main'
              }`}
            >
              <SlidersHorizontal size={isCentered ? 18 : 14} />
              <span className={`font-medium ${isCentered ? 'text-sm' : 'text-xs'}`}>Filters</span>
            </button>
            
            {isCentered && (
              <button 
                type="submit"
                className="ml-1 bg-textMain text-main p-2 rounded-full hover:opacity-90 transition-opacity"
              >
                <Search size={20} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Filter Dropdown */}
      {isFilterOpen && (
        <div className={`absolute top-full mt-2 left-0 right-0 bg-surface border border-borderSkin rounded-xl shadow-xl p-4 z-10 animate-fade-in ${
          isCentered ? 'w-full' : 'w-[120%] -left-[10%]'
        }`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-borderSkin">
            <h3 className="font-serif font-bold text-textMain">Search Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-amber-600 hover:underline flex items-center gap-1"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Start Year</label>
              <input 
                type="number" 
                placeholder="e.g. 2020"
                value={filters.startYear || ''}
                onChange={(e) => setFilters({...filters, startYear: e.target.value})}
                className="w-full bg-main border border-borderSkin rounded-lg px-3 py-2 text-sm text-textMain focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">End Year</label>
              <input 
                type="number" 
                placeholder="e.g. 2024"
                value={filters.endYear || ''}
                onChange={(e) => setFilters({...filters, endYear: e.target.value})}
                className="w-full bg-main border border-borderSkin rounded-lg px-3 py-2 text-sm text-textMain focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Journal / Source</label>
            <input 
              type="text" 
              placeholder="e.g. Nature, arXiv, IEEE"
              value={filters.source || ''}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
              className="w-full bg-main border border-borderSkin rounded-lg px-3 py-2 text-sm text-textMain focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => {
                onSearch(query, filters);
                setIsFilterOpen(false);
              }}
              className="bg-textMain text-main px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;