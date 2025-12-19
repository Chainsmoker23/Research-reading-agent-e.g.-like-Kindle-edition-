
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, Paper, Theme, SearchFilters, ReadHistoryItem } from './types';
import { generatePaperExplanation } from './services/geminiService';
import { searchPapersFast } from './services/parallelSearchService';
import { supabase } from './backend/supabaseClient';
import { saveReadPaper, getReadingHistory } from './backend/dataService';
import SearchHeader from './components/SearchHeader';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import ReaderView from './components/ReaderView';
import ChatPanel from './components/ChatPanel';
import KnowledgeTree from './components/KnowledgeTree';
import BadgeGallery from './components/BadgeGallery';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [paperContent, setPaperContent] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  
  // Auth & Data State
  const [user, setUser] = useState<any>(null);
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  // 1. Check for User Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHistory(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHistory(session.user.id);
      } else {
        setReadHistory([]); // Clear history on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch History Helper
  const fetchHistory = async (userId: string) => {
    const history = await getReadingHistory(userId);
    setReadHistory(history);
  };

  const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    setSearchQuery(query);
    setActiveFilters(filters);
    setView(AppView.LIST);
    setPapers([]); // Clear previous results immediately
    
    try {
      // Use the new parallel fast search service
      const results = await searchPapersFast(query, filters);
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

  const handleStart = useCallback(() => {
    setView(AppView.SEARCH);
  }, []);

  const handleLoginClick = useCallback(() => {
    setView(AppView.AUTH);
  }, []);

  const handleMarkAsRead = useCallback(async (paper: Paper) => {
    // If logged in, save to Supabase
    if (user) {
      // Optimistic Update
      const tempId = `temp-${Date.now()}`;
      setReadHistory(prev => [
        { id: tempId, paper, timestamp: Date.now() },
        ...prev
      ]);

      const savedItem = await saveReadPaper(user.id, paper);
      
      // Replace temp item with real item from DB if successful
      if (savedItem) {
        setReadHistory(prev => prev.map(item => item.id === tempId ? savedItem : item));
      }
    } else {
      // Fallback for guest (local state only)
      if (!readHistory.some(item => item.paper.id === paper.id)) {
        setReadHistory(prev => [
          {
            id: `history-${Date.now()}`,
            paper: paper,
            timestamp: Date.now()
          },
          ...prev
        ]);
        alert("Sign in to save your knowledge tree permanently!");
      }
    }
  }, [readHistory, user]);

  const handleViewTree = useCallback(() => {
    setView(AppView.TREE);
    setIsChatOpen(false);
  }, []);

  const handleViewBadges = useCallback(() => {
    setView(AppView.BADGES);
    setIsChatOpen(false);
  }, []);

  const isCurrentPaperRead = selectedPaper 
    ? readHistory.some(item => item.paper.title === selectedPaper.title) 
    : false;

  const isReader = view === AppView.READER;

  // Layout calculations
  const appLayoutClass = isReader 
    ? 'h-screen overflow-hidden' 
    : 'min-h-screen overflow-x-hidden';

  const mainClass = isReader
    ? 'flex-1 relative flex flex-col min-h-0 overflow-hidden'
    : 'flex-1 relative flex flex-col';

  return (
    <div className={`flex flex-col bg-main selection:bg-purple-200 transition-colors duration-300 theme-${theme} ${appLayoutClass}`}>
      {/* Universal Search Header */}
      {view !== AppView.AUTH && (
        <SearchHeader 
          onSearch={handleSearch} 
          isSearching={isSearching} 
          currentQuery={searchQuery}
          onGoHome={() => setView(AppView.LANDING)}
          currentTheme={theme}
          onThemeChange={setTheme}
          showSearchInput={view !== AppView.SEARCH && view !== AppView.LANDING}
          onViewTree={handleViewTree}
          onViewBadges={handleViewBadges}
          isLandingPage={view === AppView.LANDING}
          user={user}
          onLoginClick={handleLoginClick}
        />
      )}

      {/* Main Content Area */}
      <main className={mainClass}>
        
        {view === AppView.LANDING && (
          <LandingPage onStart={handleStart} theme={theme} />
        )}

        {view === AppView.AUTH && (
          <AuthPage onBack={() => setView(AppView.LANDING)} />
        )}

        {view === AppView.SEARCH && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 text-center animate-fade-in py-12">
             <h2 className="font-serif text-4xl md:text-6xl font-bold text-textMain mb-6 tracking-tight leading-tight">
              Unlock the World of Research.
             </h2>
             <div className="max-w-3xl space-y-4 mb-12">
               <p className="text-lg md:text-xl text-textMuted leading-relaxed">
                 OpenParallax bridges the gap between complex data and clear understanding. 
                 Search sources like <strong>Nature</strong>, <strong>IEEE</strong>, and <strong>arXiv</strong> instantly.
               </p>
               {!user && (
                 <button onClick={handleLoginClick} className="text-sm text-amber-600 font-medium bg-amber-50 inline-block px-4 py-2 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer">
                   Tip: Sign in to track your reading history and earn ranks!
                 </button>
               )}
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

        {view === AppView.BADGES && (
          <BadgeGallery currentReadCount={readHistory.length} />
        )}
      </main>
    </div>
  );
};

export default App;
