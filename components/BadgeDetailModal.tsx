import React from 'react';
import { X, Brain, Zap, Sparkles, ScrollText, Lock, Unlock } from 'lucide-react';
import RankBadge from './RankBadge';
import { Rank } from '../types';

interface BadgeDetailModalProps {
  rank: Rank;
  rankIndex: number;
  isUnlocked: boolean;
  onClose: () => void;
  currentReadCount: number;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ 
  rank, 
  rankIndex, 
  isUnlocked, 
  onClose,
  currentReadCount
}) => {
  // Prevent click propagation to close modal when clicking inside content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const progressToUnlock = Math.max(0, rank.threshold - currentReadCount);

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full md:max-w-lg bg-surface border-t md:border border-borderSkin rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-slide-up md:animate-scale-up"
        onClick={handleContentClick}
      >
        {/* Header Background / Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-main to-surface z-0"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-surface/50 hover:bg-surface rounded-full text-textMuted hover:text-textMain transition-colors border border-borderSkin"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto z-10 p-5 md:p-6 pt-10 no-scrollbar">
          
          {/* Badge Display */}
          <div className="flex flex-col items-center mb-6">
            <div className={`relative transition-transform duration-700 ${isUnlocked ? 'scale-100' : 'scale-100'}`}>
              {/* We always show the full colored badge in the detail view so users can see what they are aiming for */}
              <RankBadge rankIndex={rankIndex} size="xl" locked={false} />
              
              {/* Status Indicator */}
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm flex items-center gap-1 whitespace-nowrap ${
                isUnlocked 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-stone-100 text-stone-500 border-stone-200'
              }`}>
                {isUnlocked ? (
                  <><Unlock size={10} /> Unlocked</>
                ) : (
                  <><Lock size={10} /> Locked</>
                )}
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className={`font-serif text-2xl md:text-3xl font-bold mb-2 ${isUnlocked ? rank.color : 'text-textMain'}`}>
              {rank.title}
            </h2>
            <p className="text-textMuted text-xs md:text-sm font-mono uppercase tracking-wider">
              Rank {rankIndex + 1} • {rank.threshold.toLocaleString()} Papers Required
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            
            {/* 1. The Significance */}
            <div className="bg-main border border-borderSkin rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold text-xs md:text-sm uppercase tracking-wide">
                <ScrollText size={16} />
                <h3>Why this matters</h3>
              </div>
              <p className="text-textMain text-sm leading-relaxed">
                {rank.significance}
              </p>
            </div>

            {/* 2. Cognitive Upgrade */}
            <div className="bg-main border border-borderSkin rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs md:text-sm uppercase tracking-wide">
                <Brain size={16} />
                <h3>Neuro-Evolution Stats</h3>
              </div>
              <p className="text-textMain text-sm leading-relaxed italic">
                "{rank.cognitiveUpgrade}"
              </p>
            </div>

            {/* 3. Cosmic Lore */}
            <div className="bg-main border border-borderSkin rounded-xl p-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Sparkles size={64} />
               </div>
              <div className="flex items-center gap-2 mb-2 text-fuchsia-600 font-bold text-xs md:text-sm uppercase tracking-wide">
                <Zap size={16} />
                <h3>Universal Status</h3>
              </div>
              <p className="text-textMain text-sm leading-relaxed font-serif">
                {rank.lore}
              </p>
            </div>
          </div>

          {/* Footer Action */}
          {!isUnlocked && (
             <div className="text-center bg-stone-100 dark:bg-stone-800 rounded-lg p-3 border border-borderSkin mb-4">
               <p className="text-textMuted text-xs">
                 Read <span className="font-bold text-textMain">{progressToUnlock.toLocaleString()}</span> more papers to unlock this badge.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeDetailModal;