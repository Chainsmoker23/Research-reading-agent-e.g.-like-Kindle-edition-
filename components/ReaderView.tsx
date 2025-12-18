import React, { useEffect, useRef } from 'react';
import { Paper } from '../types';
import { ArrowLeft, MessageSquare, Info } from 'lucide-react';

interface ReaderViewProps {
  paper: Paper;
  content: string | null;
  isLoading: boolean;
  onBack: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

const ReaderView: React.FC<ReaderViewProps> = ({ paper, content, isLoading, onBack, onToggleChat, isChatOpen }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [content]);

  // Simple Markdown Parser for the specific format we requested
  const renderContent = (markdown: string) => {
    const lines = markdown.split('\n');
    let elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const key = `line-${index}`;
      
      // Headers
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key} className="font-serif text-2xl font-bold text-textMain mt-10 mb-4 border-b border-borderSkin pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } 
      // Sub-headers
      else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key} className="font-serif text-xl font-semibold text-textMain mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // List items
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        elements.push(
          <li key={key} className="ml-6 list-disc text-textMain mb-2 leading-relaxed">
             {parseInline(line.replace(/^[\*\-]\s/, ''))}
          </li>
        );
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={key} className="h-4" />);
      } 
      // Paragraphs
      else {
        elements.push(
          <p key={key} className="text-lg leading-relaxed text-textMain mb-4 font-serif text-justify">
            {parseInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  // Helper for bold/italic
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-textMain">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] transition-all duration-300 ${isChatOpen ? 'mr-0 lg:mr-[400px]' : ''}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-main border-b border-borderSkin px-6 py-3 flex justify-between items-center shadow-sm">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isChatOpen ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-surface border-borderSkin text-textMain hover:border-textMuted'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">{isChatOpen ? 'Close Chat' : 'Ask Questions'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-main p-6 md:p-12 lg:px-24 scroll-smooth">
        <div className="max-w-3xl mx-auto bg-surface shadow-sm border border-borderSkin rounded-lg p-8 md:p-16 min-h-full">
          {isLoading ? (
             <div className="space-y-8 animate-pulse">
               <div className="h-8 bg-borderSkin rounded w-3/4 mb-8"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-borderSkin rounded w-full"></div>
                 <div className="h-4 bg-borderSkin rounded w-full"></div>
                 <div className="h-4 bg-borderSkin rounded w-5/6"></div>
               </div>
               <div className="h-32 bg-main rounded flex items-center justify-center text-textMuted">
                  <span className="flex items-center gap-2">
                    <Info size={20} /> Generating reader-friendly explanation...
                  </span>
               </div>
               <div className="space-y-3">
                 <div className="h-4 bg-borderSkin rounded w-full"></div>
                 <div className="h-4 bg-borderSkin rounded w-full"></div>
                 <div className="h-4 bg-borderSkin rounded w-4/5"></div>
               </div>
             </div>
          ) : content ? (
            <article className="animate-fade-in">
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
              <div className="prose prose-stone prose-lg max-w-none text-textMain">
                {renderContent(content)}
              </div>
              <div className="mt-16 pt-8 border-t border-borderSkin text-center">
                <p className="text-textMuted text-sm">
                  End of simplified summary.
                </p>
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