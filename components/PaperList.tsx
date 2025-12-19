import React from 'react';
import { Paper } from '../types';
import { ChevronRight, FileText, Calendar, User, CheckCircle2, FileClock } from 'lucide-react';

interface PaperListProps {
  papers: Paper[];
  onSelect: (paper: Paper) => void;
}

const PaperList: React.FC<PaperListProps> = ({ papers, onSelect }) => {
  if (papers.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-fade-in-up">
      <h2 className="font-serif text-xl md:text-2xl font-bold text-textMain mb-4 md:mb-6 border-b border-borderSkin pb-3 md:pb-4">
        Search Results
      </h2>
      <div className="space-y-3 md:space-y-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => onSelect(paper)}
            className="group relative bg-surface border border-borderSkin rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md hover:border-textMuted transition-all cursor-pointer touch-manipulation"
          >
            <div className="flex justify-between items-start gap-3 md:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-textMuted">
                  <span className="bg-main px-2 py-0.5 rounded text-textMuted border border-borderSkin truncate max-w-[100px]">
                    {paper.source}
                  </span>
                  
                  {paper.status === 'Preprint' ? (
                    <span className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-amber-600 border border-amber-500/20 whitespace-nowrap">
                       <FileClock size={12} /> <span className="hidden xs:inline">Preprint</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                       <CheckCircle2 size={12} /> <span className="hidden xs:inline">Peer Reviewed</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1 ml-1 text-textMuted whitespace-nowrap">
                    <Calendar size={12} /> {paper.year}
                  </span>
                </div>
                
                <h3 className="font-serif text-lg md:text-xl font-bold text-textMain mb-2 group-hover:text-amber-700 transition-colors leading-tight">
                  {paper.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs md:text-sm text-textMuted mb-2 md:mb-3 italic">
                  <User size={14} className="shrink-0" />
                  <span className="truncate">{paper.authors}</span>
                </div>
                
                <p className="text-textMuted text-sm leading-relaxed line-clamp-2">
                  {paper.description}
                </p>
              </div>
              <div className="self-center hidden md:block opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300 text-textMuted">
                <ChevronRight size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaperList;