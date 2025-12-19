import React, { useState } from 'react';
import { Trophy, Lock, Star, Crown } from 'lucide-react';
import RankBadge from './RankBadge';
import BadgeDetailModal from './BadgeDetailModal';
import { RANKS } from '../data/ranks';
import { Rank } from '../types';

interface BadgeGalleryProps {
  currentReadCount: number;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ currentReadCount }) => {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(0);

  const handleRankClick = (rank: Rank, index: number) => {
    setSelectedRank(rank);
    setSelectedRankIndex(index);
  };

  return (
    <div className="flex-1 bg-main p-4 md:p-6 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 pt-4 md:pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4 shadow-sm">
             <Trophy size={32} className="text-amber-600" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-textMain mb-4">
            Hall of Wisdom
          </h1>
          <p className="text-textMuted text-base md:text-lg max-w-2xl mx-auto px-4">
            Your journey from a curious observer to the ultimate architect of reality. 
            Each badge represents a fundamental shift in your cognitive capabilities.
          </p>
        </div>

        {/* Badges Grid - 2 cols on mobile, 3 on tablet, 4-5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mb-16">
          {RANKS.map((rank, index) => {
            const isUnlocked = currentReadCount >= rank.threshold;
            const isGodTier = index >= 13;
            
            return (
              <div 
                key={rank.title} 
                onClick={() => handleRankClick(rank, index)}
                className={`
                  relative p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-300 flex flex-col items-center text-center cursor-pointer group touch-manipulation
                  ${isUnlocked 
                    ? 'bg-surface border-borderSkin shadow-sm md:shadow-md hover:shadow-xl hover:-translate-y-1' 
                    : 'bg-surface/50 border-borderSkin/50 opacity-70 grayscale'
                  }
                  ${isGodTier && isUnlocked ? 'border-amber-300 shadow-amber-100/50' : ''}
                `}
              >
                {/* Badge Visual */}
                <div className="mb-3 md:mb-4 mt-2 transition-transform duration-500 group-hover:scale-110 relative">
                  {/* Slightly smaller badges on mobile via scaling container if needed, but RankBadge handles sizes well. passing 'lg' for visual impact */}
                  <div className="scale-90 md:scale-100">
                    <RankBadge rankIndex={index} size="lg" locked={!isUnlocked} />
                  </div>
                  
                  {isGodTier && isUnlocked && (
                    <div className="absolute -inset-4 bg-amber-400/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                  )}
                </div>
                
                {/* Title */}
                <h4 className={`font-serif font-bold text-xs md:text-sm mb-2 leading-tight ${isUnlocked ? 'text-textMain' : 'text-textMuted'}`}>
                  {rank.title}
                </h4>
                
                {/* Subtext */}
                <div className="flex flex-col items-center gap-1 text-xs w-full mt-auto pt-2">
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] md:text-xs ${isUnlocked ? 'bg-main text-textMuted' : 'bg-transparent text-textMuted/70'}`}>
                    {rank.threshold.toLocaleString()} Reads
                  </span>
                  
                  {!isUnlocked ? (
                     <span className="text-amber-600/70 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider text-[10px]">
                       <Lock size={10} /> Locked
                     </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider text-[10px]">
                       <Star size={10} fill="currentColor" /> Unlocked
                     </span>
                  )}
                </div>

                {/* Hover Reveal Tip (Desktop Only) */}
                <div className="hidden md:flex absolute inset-0 bg-black/80 rounded-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-white backdrop-blur-sm z-20 pointer-events-none">
                  <p className="text-xs font-medium">Click to view details</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legendary Footer */}
        <div className="text-center bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 p-6 md:p-8 rounded-3xl border border-amber-200/50 mx-4 md:mx-0">
           <div className="flex items-center justify-center gap-2 mb-2 text-amber-700 font-bold uppercase tracking-widest text-sm">
             <Crown size={16} />
             Ultimate Goal
           </div>
           <p className="font-serif text-lg md:text-xl italic text-textMain max-w-xl mx-auto leading-relaxed">
             "To read is to fly: it is to soar to a point of vantage which gives a view over wide terrains of history, human variety, ideas, shared experience and the fruits of many inquiries."
           </p>
        </div>

        {/* Modal */}
        {selectedRank && (
          <BadgeDetailModal
            rank={selectedRank}
            rankIndex={selectedRankIndex}
            isUnlocked={currentReadCount >= selectedRank.threshold}
            onClose={() => setSelectedRank(null)}
            currentReadCount={currentReadCount}
          />
        )}
      </div>
    </div>
  );
};

export default BadgeGallery;