
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, Paper, Theme, SearchFilters, ReadHistoryItem } from './types';
import { generatePaperExplanation } from './services/geminiService';
import { searchPapersFast } from './services/parallelSearchService';
import { getCurrentUser, signOut } from './backend/authService';
import { saveReadPaper, getReadingHistory, getUserProfile, UserProfile } from './backend/dataService';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  // Initialize Session from Local Storage
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      syncUserData();
    }
  }, []);

  // Sync User Profile and History
  const syncUserData = async () => {
    const [history, userProfile] = await Promise.all([
      getReadingHistory(),
      getUserProfile()
    ]);
    setReadHistory(history);
    setProfile(userProfile);
  };

  const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    setSearchQuery(query);
    setActiveFilters(filters);
    setView(AppView.LIST);
    setPapers([]);
    
    try {
      const results = await searchPapersFast(query, filters);
      setPapers(results);
    } catch (error) {
      console.error(error);
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
      setPaperContent("Failed to generate content.");
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

  const handleAuthSuccess = useCallback(() => {
    const activeUser = getCurrentUser();
    setUser(activeUser);
    syncUserData();
    setView(AppView.SEARCH);
  }, []);

  const handleLogout = useCallback(() => {
    signOut();
    setUser(null);
    setProfile(null);
    setReadHistory([]);
    setView(AppView.LANDING);
  }, []);

  const handleMarkAsRead = useCallback(async (paper: Paper) => {
    if (user) {
      if (readHistory.some(h => h.paper.id === paper.id || h.paper.title === paper.title)) return;

      const savedItem = await saveReadPaper(paper);
      if (savedItem) {
        setReadHistory(prev => [savedItem, ...prev]);
        const updatedProfile = await getUserProfile();
        setProfile(updatedProfile);
      }
    } else {
      alert("Sign in to track your reading history and score Knowledge Points!");
      setView(AppView.AUTH);
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

  const appLayoutClass = isReader 
    ? 'h-screen overflow-hidden' 
    : 'min-h-screen overflow-x-hidden';

  const mainClass = isReader
    ? 'flex-1 relative flex flex-col min-h-0 overflow-hidden'
    : 'flex-1 relative flex flex-col';

  return (
    <div className={`flex flex-col bg-main transition-colors duration-300 theme-${theme} ${appLayoutClass}`}>
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
          onLogout={handleLogout}
        />
      )}

      <main className={mainClass}>
        {view === AppView.LANDING && <LandingPage onStart={handleStart} theme={theme} />}
        {view === AppView.AUTH && <AuthPage onBack={() => setView(AppView.LANDING)} onSuccess={handleAuthSuccess} />}
        
        {view === AppView.SEARCH && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 text-center animate-fade-in py-12">
             <h2 className="font-serif text-4xl md:text-6xl font-bold text-textMain mb-6 tracking-tight leading-tight">
              Unlock the World of Research.
             </h2>
             <div className="max-w-3xl space-y-4 mb-12">
               <p className="text-lg md:text-xl text-textMuted leading-relaxed">
                 OpenParallax bridges the gap between complex data and clear understanding. 
               </p>
               {profile && (
                 <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center gap-4 animate-fade-in-up shadow-sm">
                    <div className="text-left">
                      <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Your Knowledge Points</p>
                      <p className="text-2xl font-serif font-black text-violet-900">{profile.score} KP</p>
                    </div>
                    <div className="h-10 w-[1px] bg-violet-200"></div>
                    <div className="text-left">
                      <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Papers Mastered</p>
                      <p className="text-2xl font-serif font-black text-violet-900">{readHistory.length}</p>
                    </div>
                 </div>
               )}
               {!user && (
                 <button onClick={handleLoginClick} className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-4 py-2 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors uppercase tracking-widest">
                   Join the Rank of Scholars
                 </button>
               )}
             </div>
             <SearchBar variant="centered" onSearch={handleSearch} />
          </div>
        )}

        {view === AppView.LIST && (
          isSearching ? (
            <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
              <div className="w-12 h-12 border-4 border-borderSkin border-t-textMain rounded-full animate-spin mb-4"></div>
              <p className="font-serif text-xl text-textMuted">Searching for research papers...</p>
            </div>
          ) : <PaperList papers={papers} onSelect={handleSelectPaper} />
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
            <ChatPanel paper={selectedPaper} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
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
