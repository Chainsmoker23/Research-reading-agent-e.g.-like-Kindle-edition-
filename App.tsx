import React, { useState, useCallback } from 'react';
import { AppView, Paper, Theme, SearchFilters, ReadHistoryItem } from './types';
import { searchPapers, generatePaperExplanation } from './services/geminiService';
import SearchHeader from './components/SearchHeader';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import ReaderView from './components/ReaderView';
import ChatPanel from './components/ChatPanel';
import KnowledgeTree from './components/KnowledgeTree';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SEARCH);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [paperContent, setPaperContent] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('sepia');
  
  // History state
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);

  // New state for filters
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    setSearchQuery(query);
    setActiveFilters(filters);
    setView(AppView.LIST);
    setPapers([]); // Clear previous results immediately
    
    try {
      const results = await searchPapers(query, filters);
      setPapers(results);
    } catch (error) {
      console.error(error);
      // Could add error toast here
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectPaper = useCallback(async (paper: Paper) => {
    setSelectedPaper(paper);
    setView(AppView.READER);
    
    // Only generate content if we haven't already generated it for this specific session interaction
    // Or simpler: always regenerate or check a cache. For now, basic behavior:
    setPaperContent(null);
    setIsLoadingContent(true);
    setIsChatOpen(false);

    try {
      const content = await generatePaperExplanation(paper);
      setPaperContent(content);
    } catch (error) {
      console.error(error);
      setPaperContent("Failed to generate content. Please try again.");
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const handleBackToResults = useCallback(() => {
    setView(AppView.LIST);
    setSelectedPaper(null);
    setIsChatOpen(false);
  }, []);

  const handleGoHome = useCallback(() => {
    setView(AppView.SEARCH);
    setPapers([]);
    setSearchQuery('');
    setSelectedPaper(null);
    setActiveFilters({});
  }, []);

  const handleMarkAsRead = useCallback((paper: Paper) => {
    // Check if already in history
    if (!readHistory.some(item => item.paper.id === paper.id)) {
      setReadHistory(prev => [
        {
          id: `history-${Date.now()}`,
          paper: paper,
          timestamp: Date.now()
        },
        ...prev
      ]);
    }
  }, [readHistory]);

  const handleViewTree = useCallback(() => {
    setView(AppView.TREE);
    setIsChatOpen(false);
  }, []);

  const isCurrentPaperRead = selectedPaper 
    ? readHistory.some(item => item.paper.title === selectedPaper.title) // Use title as ID might vary in search results vs history
    : false;

  return (
    <div className={`min-h-screen flex flex-col bg-main selection:bg-amber-200 transition-colors duration-300 theme-${theme}`}>
      {/* Universal Search Header */}
      <SearchHeader 
        onSearch={handleSearch} 
        isSearching={isSearching} 
        currentQuery={searchQuery}
        onGoHome={handleGoHome}
        currentTheme={theme}
        onThemeChange={setTheme}
        showSearchInput={view !== AppView.SEARCH}
        onViewTree={handleViewTree}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {view === AppView.SEARCH && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 text-center animate-fade-in py-12">
             <h2 className="font-serif text-4xl md:text-6xl font-bold text-textMain mb-6 tracking-tight leading-tight">
              Unlock the World of Research.
             </h2>
             <div className="max-w-3xl space-y-4 mb-12">
               <p className="text-lg md:text-xl text-textMuted leading-relaxed">
                 ScholarFlow is your bridge to scientific understanding. We aggregate papers from trusted global sources like <strong>Nature</strong>, <strong>IEEE</strong>, and <strong>arXiv</strong>, transforming complex academic texts into clear, readable narratives.
               </p>
               <p className="text-lg md:text-xl text-textMuted leading-relaxed">
                 Experience research like never before with our <strong>distraction-free reader</strong>, <strong>intelligent conceptual simplification</strong>, and an always-available <strong>AI mentor</strong> to answer your questions.
               </p>
             </div>
             
             {/* Center Search Bar */}
             <SearchBar 
               variant="centered" 
               onSearch={handleSearch}
             />
             
             <div className="mt-8 flex gap-4 text-sm text-textMuted">
               <span className="px-3 py-1 bg-surface border border-borderSkin rounded-full">arXiv</span>
               <span className="px-3 py-1 bg-surface border border-borderSkin rounded-full">Nature</span>
               <span className="px-3 py-1 bg-surface border border-borderSkin rounded-full">IEEE</span>
               <span className="px-3 py-1 bg-surface border border-borderSkin rounded-full">PubMed</span>
             </div>
          </div>
        )}

        {view === AppView.LIST && (
          isSearching ? (
            <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
              <div className="w-12 h-12 border-4 border-borderSkin border-t-textMain rounded-full animate-spin mb-4"></div>
              <p className="font-serif text-xl text-textMuted animate-pulse">Searching for research papers...</p>
              {activeFilters.source && <p className="text-sm text-textMuted mt-2">Source: {activeFilters.source}</p>}
            </div>
          ) : (
             papers.length > 0 ? (
               <PaperList papers={papers} onSelect={handleSelectPaper} />
             ) : (
               <div className="flex flex-col items-center justify-center pt-32 text-textMuted animate-fade-in">
                  <p>No papers found. Try a different search term or adjust your filters.</p>
                  <button onClick={() => setView(AppView.SEARCH)} className="mt-4 text-textMain underline">Go back home</button>
               </div>
             )
          )
        )}

        {view === AppView.READER && selectedPaper && (
          <>
            <ReaderView 
              paper={selectedPaper}
              content={paperContent}
              isLoading={isLoadingContent}
              onBack={handleBackToResults}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              isChatOpen={isChatOpen}
              onMarkAsRead={handleMarkAsRead}
              isRead={isCurrentPaperRead}
            />
            <ChatPanel 
              paper={selectedPaper}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </>
        )}

        {view === AppView.TREE && (
          <KnowledgeTree 
            history={readHistory} 
            onSelectPaper={handleSelectPaper}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
};

export default App;