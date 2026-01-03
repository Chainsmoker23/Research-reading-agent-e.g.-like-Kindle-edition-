
import React, { useEffect, useRef, useState } from 'react';
import { Paper } from '../types';
import { ArrowLeft, MessageSquare, Loader2, CheckCircle, BookOpenCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ReaderViewProps {
  paper: Paper;
  content: string | null;
  isLoading: boolean;
  onBack: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onMarkAsRead: (paper: Paper) => void;
  isRead: boolean;
}

const ReaderView: React.FC<ReaderViewProps> = ({ 
  paper, 
  content, 
  isLoading, 
  onBack, 
  onToggleChat, 
  isChatOpen,
  onMarkAsRead,
  isRead
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    // Reset scroll when content changes
    if (content && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [content]);

  // Cycle through loading messages to give user feedback on the process
  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      "Locating full research content...",
      `Analyzing "${paper.title}"...`,
      "Identifying core concepts and methodology...",
      "Simplifying technical jargon...",
      "Structuring for easy reading...",
      "Finalizing your conceptual summary..."
    ];
    
    let index = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      index++;
      if (index < messages.length) {
        setLoadingMessage(messages[index]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading, paper.title]);

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${isChatOpen ? 'mr-0 lg:mr-[450px]' : ''}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-main border-b border-borderSkin px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-textMuted hover:text-textMain transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          Back to Results
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-serif text-textMuted hidden sm:block truncate max-w-[200px]">
            {paper.title}
          </span>
          <button 
            onClick={onToggleChat}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isChatOpen ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-surface border-borderSkin text-textMain hover:border-textMuted'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">{isChatOpen ? 'Close Chat' : 'Ask Questions'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto bg-main p-6 md:p-12 lg:px-24 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto bg-surface shadow-sm border border-borderSkin rounded-lg p-8 md:p-16 min-h-full">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-fade-in">
               <div className="relative">
                 <div className="w-20 h-20 border-4 border-borderSkin border-t-amber-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-amber-600">
                    <Loader2 size={24} className="animate-pulse" />
                 </div>
               </div>
               
               <div className="text-center space-y-3 max-w-md">
                 <h3 className="text-2xl font-serif font-bold text-textMain animate-pulse">
                   {loadingMessage}
                 </h3>
                 <p className="text-textMuted text-sm">
                   This usually takes 10-20 seconds as we analyze the full paper.
                 </p>
               </div>

               {/* Decorative textual skeleton */}
               <div className="w-full max-w-lg space-y-4 opacity-20 mt-8 select-none pointer-events-none">
                 <div className="h-4 bg-textMain rounded w-3/4 mx-auto"></div>
                 <div className="h-4 bg-textMain rounded w-full"></div>
                 <div className="h-4 bg-textMain rounded w-5/6 mx-auto"></div>
                 <div className="h-4 bg-textMain rounded w-full"></div>
                 <div className="h-4 bg-textMain rounded w-4/5 mx-auto"></div>
               </div>
             </div>
          ) : content ? (
            <article className="animate-fade-in pb-10">
              <div className="mb-12 text-center border-b-2 border-textMain pb-8">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-textMain mb-4 leading-tight">
                  {paper.title}
                </h1>
                <p className="text-textMuted italic font-serif text-lg">
                  {paper.authors}
                </p>
                <p className="text-textMuted text-sm mt-2 uppercase tracking-widest font-sans">
                  {paper.source} • {paper.year}
                </p>
              </div>
              
              <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:text-justify max-w-none text-textMain">
                <ReactMarkdown 
                   remarkPlugins={[remarkGfm, remarkMath]} 
                   rehypePlugins={[rehypeKatex]}
                >
                  {content}
                </ReactMarkdown>
              </div>
              
              {/* Mark as Completed Button */}
              <div className="mt-16 pt-12 border-t border-borderSkin flex flex-col items-center gap-4">
                <p className="text-textMuted text-sm italic">
                  Have you finished reading this paper?
                </p>
                <button
                  onClick={() => onMarkAsRead(paper)}
                  disabled={isRead}
                  className={`group relative flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                    isRead 
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 cursor-default' 
                      : 'bg-textMain text-main hover:bg-amber-600 border-2 border-transparent'
                  }`}
                >
                  {isRead ? (
                    <>
                      <CheckCircle size={24} />
                      <span className="font-bold text-lg">Read & Added to Tree</span>
                    </>
                  ) : (
                    <>
                      <BookOpenCheck size={24} />
                      <span className="font-bold text-lg">Mark as Completed</span>
                    </>
                  )}
                </button>
                {isRead && (
                  <p className="text-emerald-600 text-sm animate-fade-in-up">
                    Added to your Knowledge Tree
                  </p>
                )}
              </div>
            </article>
          ) : (
            <div className="text-center py-20 text-textMuted">
              <p>Failed to load content. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
