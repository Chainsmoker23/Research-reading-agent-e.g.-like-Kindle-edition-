import React, { useState } from 'react';
import { ReadHistoryItem, Paper, Rank } from '../types';
import { Sprout, Calendar, ArrowRight } from 'lucide-react';
import RankBadge from './RankBadge';
import BadgeDetailModal from './BadgeDetailModal';
import { RANKS } from '../data/ranks';

interface KnowledgeTreeProps {
  history: ReadHistoryItem[];
  onSelectPaper: (paper: Paper) => void;
  onGoHome: () => void;
}

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ history, onSelectPaper, onGoHome }) => {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(0);
  
  // Sort history by timestamp (newest first for the list)
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const readCount = history.length;

  // Calculate Rank
  const getRankInfo = (count: number) => {
    let currentIndex = 0;
    
    for (let i = 0; i < RANKS.length; i++) {
      if (count >= RANKS[i].threshold) {
        currentIndex = i;
      } else {
        break;
      }
    }
    
    const current = RANKS[currentIndex];
    const next = RANKS[currentIndex + 1] || null;
    return { current, next, currentIndex };
  };

  const { current, next, currentIndex } = getRankInfo(readCount);

  // Calculate Progress Percentage
  const calculateProgress = () => {
    if (!next) return 100;
    const range = next.threshold - current.threshold;
    const progress = readCount - current.threshold;
    return Math.min(Math.max((progress / range) * 100, 0), 100);
  };

  const progressPercent = calculateProgress();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRankClick = (rank: Rank, index: number) => {
    setSelectedRank(rank);
    setSelectedRankIndex(index);
  };

  return (
    <div className="flex-1 bg-main p-6 pb-20 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Gamification Dashboard --- */}
        <div 
          onClick={() => handleRankClick(current, currentIndex)}
          className="bg-surface border border-borderSkin rounded-2xl p-6 md:p-8 shadow-sm mb-12 relative overflow-hidden cursor-pointer hover:shadow-md transition-all group"
        >
          {/* Decorative background glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-200/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
            {/* Rank Badge */}
            <div className="relative shrink-0">
              <div className="group-hover:scale-110 transition-transform duration-500 transform">
                <RankBadge rankIndex={currentIndex} size="xl" />
              </div>
            </div>

            {/* Stats Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2 justify-center md:justify-start">
                <h2 className={`font-serif text-3xl font-bold ${current.color}`}>
                  {current.title}
                </h2>
                <span className="text-textMuted text-xs font-bold uppercase tracking-widest bg-main px-2 py-0.5 rounded border border-borderSkin">
                  Rank {currentIndex + 1} of {RANKS.length}
                </span>
              </div>
              
              <p className="text-textMuted mb-6 italic text-lg">{current.description}</p>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-xs font-semibold text-textMuted uppercase tracking-wider">
                  <span>{readCount} Papers Read</span>
                  {next ? (
                    <span>Next: {next.title} ({next.threshold})</span>
                  ) : (
                    <span>Absolute Mastery Achieved</span>
                  )}
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-main border border-borderSkin">
                  <div 
                    style={{ width: `${progressPercent}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out bg-gradient-to-r from-amber-300 to-amber-500`}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-textMuted text-center md:text-left mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view details
              </p>
            </div>
          </div>
        </div>

        {/* --- History Tree Header --- */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-textMain mb-2">
            <Sprout size={20} className="text-emerald-600"/>
            <span className="font-serif font-bold text-lg">Your Knowledge Timeline</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-borderSkin rounded-2xl border-dashed">
            <p className="text-xl text-textMuted mb-4 font-serif">Your tree is yet to sprout.</p>
            <button 
              onClick={onGoHome}
              className="bg-textMain text-main px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
            >
              Start Reading
            </button>
          </div>
        ) : (
          <div className="relative pb-12 pl-4 md:pl-0">
            {/* The Trunk */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/20 to-amber-500/20 rounded-full"></div>

            <div className="space-y-8">
              {sortedHistory.map((item, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div key={item.id} className={`relative flex flex-col md:flex-row items-center w-full ${isEven ? '' : 'md:flex-row-reverse'}`}>
                    
                    {/* Date Marker (Desktop Center) */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-4 border-emerald-500 rounded-full z-10 shadow-sm group-hover:scale-125 transition-transform"></div>
                    
                    {/* Spacer for desktop layout */}
                    <div className="hidden md:block w-1/2"></div>

                    {/* Content Card Wrapper */}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div 
                        onClick={() => onSelectPaper(item.paper)}
                        className={`bg-surface border border-borderSkin p-5 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative group text-left`}
                      >
                         {/* Connector Line (Mobile) */}
                         <div className="absolute md:hidden top-1/2 -left-8 w-8 h-0.5 bg-emerald-300"></div>
                         
                         {/* Connector Line (Desktop) */}
                         <div className={`hidden md:block absolute top-1/2 -mt-px w-12 h-0.5 bg-emerald-300 ${isEven ? '-right-12' : '-left-12'}`}></div>

                         <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">
                           <Calendar size={12} />
                           {formatDate(item.timestamp)}
                         </div>

                         <h3 className="font-serif text-lg font-bold text-textMain mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                           {item.paper.title}
                         </h3>
                         
                         <p className="text-textMuted text-sm line-clamp-2 mb-3">
                           {item.paper.description}
                         </p>

                         <div className="flex items-center gap-1 text-xs text-textMain font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                           Re-read <ArrowRight size={12} />
                         </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
            
            {/* Bottom Root */}
            <div className="flex justify-center mt-12 relative z-10">
               <div className="bg-main border border-borderSkin px-4 py-2 rounded-full text-xs text-textMuted font-mono">
                 Genesis
               </div>
            </div>
          </div>
        )}

        {/* --- Badge Detail Modal --- */}
        {selectedRank && (
          <BadgeDetailModal
            rank={selectedRank}
            rankIndex={selectedRankIndex}
            isUnlocked={readCount >= selectedRank.threshold}
            onClose={() => setSelectedRank(null)}
            currentReadCount={readCount}
          />
        )}
      </div>
    </div>
  );
};

export default KnowledgeTree;