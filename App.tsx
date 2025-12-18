import React, { useState, useCallback } from 'react';
import { AppView, Paper, Theme } from './types';
import { searchPapers, generatePaperExplanation } from './services/geminiService';
import SearchHeader from './components/SearchHeader';
import PaperList from './components/PaperList';
import ReaderView from './components/ReaderView';
import ChatPanel from './components/ChatPanel';

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

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setView(AppView.LIST);
    setPapers([]); // Clear previous results immediately
    try {
      const results = await searchPapers(query);
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
  }, []);

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
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {view === AppView.SEARCH && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] px-6 text-center animate-fade-in">
             <h2 className="font-serif text-4xl md:text-5xl font-bold text-textMain mb-6 tracking-tight">
              Discover. Read. Understand.
             </h2>
             <p className="text-lg md:text-xl text-textMuted max-w-2xl leading-relaxed">
               Your intelligent research assistant. Search for any topic to get high-quality papers rewritten in simple language for easy reading.
             </p>
          </div>
        )}

        {view === AppView.LIST && (
          isSearching ? (
            <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
              <p className="font-serif text-xl text-textMuted animate-pulse">Searching for research papers...</p>
            </div>
          ) : (
             papers.length > 0 ? (
               <PaperList papers={papers} onSelect={handleSelectPaper} />
             ) : (
               <div className="flex flex-col items-center justify-center pt-32 text-textMuted animate-fade-in">
                  <p>No papers found. Try a different search term.</p>
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
            />
            <ChatPanel 
              paper={selectedPaper}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;