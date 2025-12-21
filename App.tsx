
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, Paper, Theme, SearchFilters, ReadHistoryItem } from './types';
import { generatePaperExplanation } from './services/geminiService';
import { searchPapersFast } from './services/parallelSearchService';
import { getCurrentUser, signOut } from './services/authService';
import { saveReadPaper, getReadingHistory, getUserProfile, UserProfile } from './services/dataService';
import SearchHeader from './components/SearchHeader';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import ReaderView from './components/ReaderView';
import ChatPanel from './components/ChatPanel';
import KnowledgeTree from './components/KnowledgeTree';
import BadgeGallery from './components/BadgeGallery';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ApiKeyModal from './components/ApiKeyModal';
import { AlertTriangle, X } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  
  // Auth & Data State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  
  // Admin/Private Mode State
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

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
    setError(null);
    
    try {
      const results = await searchPapersFast(query, filters);
      setPapers(results);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to search papers. Please try again.");
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
    setError(null);

    try {
      const content = await generatePaperExplanation(paper);
      setPaperContent(content);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate content. Please check your API quota.");
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
    // If private app, home should redirect to search only if logged in, else Landing
    const activeUser = getCurrentUser();
    if (activeUser) {
      setView(AppView.SEARCH);
      setPapers([]);
      setSearchQuery('');
      setSelectedPaper(null);
      setActiveFilters({});
    } else {
      setView(AppView.LANDING);
    }
  }, []);

  const handleStart = useCallback(() => {
    // STRICT PRIVATE MODE: Must login to proceed
    const activeUser = getCurrentUser();
    if (activeUser) {
      setView(AppView.SEARCH);
    } else {
      setView(AppView.AUTH);
    }
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
      // Should technically not happen in private mode, but safety fallback
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
          onGoHome={handleGoHome}
          currentTheme={theme}
          onThemeChange={setTheme}
          showSearchInput={view !== AppView.SEARCH && view !== AppView.LANDING}
          onViewTree={handleViewTree}
          onViewBadges={handleViewBadges}
          isLandingPage={view === AppView.LANDING}
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onOpenKeySettings={() => setIsKeyModalOpen(true)}
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

        {isKeyModalOpen && (
          <ApiKeyModal onClose={() => setIsKeyModalOpen(false)} />
        )}

        {/* Global Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg z-[100] animate-fade-in-up flex items-center gap-3">
            <AlertTriangle className="shrink-0" size={20} />
            <div className="flex-1">
               <p className="text-sm font-bold">Error</p>
               <p className="text-xs opacity-90">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded"><X size={16} /></button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
