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
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in-up">
      <h2 className="font-serif text-2xl font-bold text-textMain mb-6 border-b border-borderSkin pb-4">
        Search Results
      </h2>
      <div className="space-y-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => onSelect(paper)}
            className="group relative bg-surface border border-borderSkin rounded-xl p-6 shadow-sm hover:shadow-md hover:border-textMuted transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-textMuted">
                  <span className="bg-main px-2 py-0.5 rounded text-textMuted border border-borderSkin">
                    {paper.source}
                  </span>
                  
                  {paper.status === 'Preprint' ? (
                    <span className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-amber-600 border border-amber-500/20">
                       <FileClock size={12} /> Preprint
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-600 border border-emerald-500/20">
                       <CheckCircle2 size={12} /> Peer Reviewed
                    </span>
                  )}

                  <span className="flex items-center gap-1 ml-1 text-textMuted">
                    <Calendar size={12} /> {paper.year}
                  </span>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-textMain mb-2 group-hover:text-amber-700 transition-colors">
                  {paper.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-textMuted mb-3 italic">
                  <User size={14} />
                  <span>{paper.authors}</span>
                </div>
                
                <p className="text-textMuted text-sm leading-relaxed line-clamp-2">
                  {paper.description}
                </p>
              </div>
              <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300 text-textMuted">
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