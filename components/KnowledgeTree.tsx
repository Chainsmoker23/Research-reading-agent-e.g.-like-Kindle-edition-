import React from 'react';
import { ReadHistoryItem, Paper } from '../types';
import { Sprout, Calendar, ArrowRight, Trophy, Lock } from 'lucide-react';
import RankBadge from './RankBadge';

interface KnowledgeTreeProps {
  history: ReadHistoryItem[];
  onSelectPaper: (paper: Paper) => void;
  onGoHome: () => void;
}

type Rank = {
  threshold: number;
  title: string;
  color: string;
  description: string;
};

// Updated Rank Titles with a Scientific Career Theme
const RANKS: Rank[] = [
  { threshold: 0, title: "Curious Observer", color: "text-emerald-600", description: "Taking the first step into the world of knowledge." },
  { threshold: 10, title: "Lab Assistant", color: "text-stone-600", description: "Getting your hands dirty with real research." },
  { threshold: 50, title: "Field Researcher", color: "text-amber-700", description: "Connecting dots and gathering raw data." },
  { threshold: 100, title: "Associate Scholar", color: "text-orange-600", description: "A published contributor to the collective mind." },
  { threshold: 500, title: "Master Scholar", color: "text-sky-600", description: "Deep expertise in chosen fields." },
  { threshold: 1000, title: "Innovation Pioneer", color: "text-lime-600", description: "Breaking new ground with bright ideas." },
  { threshold: 5000, title: "Lead Scientist", color: "text-blue-600", description: "Directing the path of discovery." },
  { threshold: 10000, title: "Distinguished Fellow", color: "text-indigo-600", description: "Recognized globally for contributions." },
  { threshold: 15000, title: "Quantum Visionary", color: "text-violet-600", description: "Seeing the fundamental fabrics of reality." },
  { threshold: 20000, title: "Neural Architect", color: "text-fuchsia-600", description: "Mapping the complexities of thought itself." },
  { threshold: 30000, title: "Genetic Oracle", color: "text-rose-600", description: "Decoding the building blocks of life." },
  { threshold: 50000, title: "Cosmic Sage", color: "text-purple-600", description: "Wisdom that spans across galaxies." },
  { threshold: 100000, title: "Omniscient Entity", color: "text-yellow-600", description: "One with the infinite library of the universe." },
  { threshold: 150000, title: "Assistant of God", color: "text-amber-500", description: "Helping manage the flow of infinite wisdom." },
  { threshold: 200000, title: "God of Knowledge", color: "text-amber-600", description: "The supreme authority on all that is known." },
  { threshold: 400000, title: "The God", color: "text-yellow-500", description: "Now you are God." },
];

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ history, onSelectPaper, onGoHome }) => {
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

  return (
    <div className="flex-1 overflow-y-auto bg-main p-6 pb-20 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Gamification Dashboard --- */}
        <div className="bg-surface border border-borderSkin rounded-2xl p-6 md:p-8 shadow-sm mb-12 relative overflow-hidden">
          {/* Decorative background glow based on current rank color (using a generic yellow/amber for simplicity in string interp or just static) */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-200/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
            {/* Rank Badge */}
            <div className="relative shrink-0 group">
              <div className="group-hover:scale-105 transition-transform duration-300 transform">
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
            </div>
          </div>
        </div>

        {/* --- Achievement Ladder --- */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-serif font-bold text-xl text-textMain mb-6 flex items-center gap-2 border-b border-borderSkin pb-3">
            <Trophy size={20} className="text-amber-500" />
            Career Ladder
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {RANKS.map((rank, index) => {
              // VISUALIZATION MODE: Always unlocked to see colors
              const isUnlocked = true; 
              
              return (
                <div 
                  key={rank.title} 
                  className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center bg-surface border-borderSkin shadow-sm hover:shadow-md`}
                >
                  <div className="mb-3">
                    <RankBadge rankIndex={index} size="md" locked={false} />
                  </div>
                  
                  <h4 className={`font-serif font-bold text-sm mb-1 text-textMain`}>
                    {rank.title}
                  </h4>
                  
                  <div className="flex flex-col items-center gap-1 text-xs mt-2 w-full">
                    <span className="text-textMuted font-mono">
                      {rank.threshold} reads
                    </span>
                  </div>
                </div>
              );
            })}
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
      </div>
    </div>
  );
};

export default KnowledgeTree;