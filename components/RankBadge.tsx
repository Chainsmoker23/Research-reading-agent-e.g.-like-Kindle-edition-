import React from 'react';
import { 
  Feather, FlaskConical, ScrollText, BookOpen, 
  GraduationCap, Lightbulb, Microscope, Medal, 
  Atom, Brain, Dna, Orbit, Infinity, Star,
  ChevronUp, Zap, Sun, Crown, Sparkles
} from 'lucide-react';

interface RankBadgeProps {
  rankIndex: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  locked?: boolean;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rankIndex, size = 'md', locked = false }) => {
  // Dimensions
  const sizeMap = {
    sm: { w: 48, icon: 14 },
    md: { w: 80, icon: 24 },
    lg: { w: 120, icon: 36 },
    xl: { w: 160, icon: 48 }
  };
  const { w, icon } = sizeMap[size];
  const half = w / 2;
  const uniqueId = `badge-${rankIndex}-${size}`;

  // Colors & Themes
  const getTheme = () => {
    if (locked) return { 
      main: "#e5e7eb", dark: "#9ca3af", light: "#f3f4f6", 
      accent: "#d1d5db", text: "text-gray-400", glow: "transparent" 
    };
    
    switch (true) {
      case rankIndex <= 1: // Recruits (Field Green)
        return { 
          main: "#15803d", dark: "#14532d", light: "#4ade80", 
          accent: "#22c55e", text: "text-white", glow: "rgba(34, 197, 94, 0.5)" 
        }; 
      case rankIndex <= 4: // Officers (Royal Navy Blue)
        return { 
          main: "#1d4ed8", dark: "#1e3a8a", light: "#60a5fa", 
          accent: "#bfdbfe", text: "text-white", glow: "rgba(59, 130, 246, 0.5)" 
        };
      case rankIndex <= 7: // Spec Ops (Cyber Slate/Cyan)
        return { 
          main: "#334155", dark: "#0f172a", light: "#22d3ee", 
          accent: "#0891b2", text: "text-cyan-300", glow: "rgba(34, 211, 238, 0.6)" 
        };
      case rankIndex <= 10: // Commanders (Imperial Red/Gold)
        return { 
          main: "#b91c1c", dark: "#450a0a", light: "#fcd34d", 
          accent: "#fbbf24", text: "text-yellow-300", glow: "rgba(251, 191, 36, 0.5)" 
        };
      case rankIndex <= 12: // Legends (Void Violet)
        return { 
          main: "#7c3aed", dark: "#2e1065", light: "#e879f9", 
          accent: "#c084fc", text: "text-fuchsia-100", glow: "rgba(192, 132, 252, 0.6)" 
        };
      case rankIndex === 13: // Assistant of God (Divine Spark)
        return {
          main: "#f59e0b", dark: "#78350f", light: "#fef3c7",
          accent: "#fbbf24", text: "text-amber-100", glow: "rgba(245, 158, 11, 0.8)"
        };
      case rankIndex === 14: // God of Knowledge (Solar Flare)
        return {
          main: "#ea580c", dark: "#7c2d12", light: "#fdba74",
          accent: "#fed7aa", text: "text-orange-50", glow: "rgba(234, 88, 12, 0.8)"
        };
      default: // The God (Celestial Platinum/Gold/Infinity)
        return {
          main: "#fbbf24", dark: "#b45309", light: "#ffffff",
          accent: "#fffbeb", text: "text-yellow-900", glow: "rgba(255, 255, 255, 0.9)"
        };
    }
  };

  const theme = getTheme();
  
  // --- BACKGROUND RENDERERS ---

  // 1. Recruit: Reinforced Shield
  const renderRecruit = () => (
    <g>
      <defs>
        <linearGradient id={`${uniqueId}-recruit`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.light} stopOpacity="0.8" />
          <stop offset="100%" stopColor={theme.dark} />
        </linearGradient>
      </defs>
      <path 
        d={`M ${w*0.5},${w} C ${w*0.1},${w*0.85} ${w*0.15},${w*0.5} ${w*0.15},${w*0.2} L ${w*0.5},0 L ${w*0.85},${w*0.2} C ${w*0.85},${w*0.5} ${w*0.9},${w*0.85} ${w*0.5},${w} Z`} 
        fill={`url(#${uniqueId}-recruit)`} 
        stroke={theme.dark} 
        strokeWidth="1.5"
      />
      {/* Inner Detail */}
      <path 
        d={`M ${w*0.5},${w*0.9} C ${w*0.25},${w*0.8} ${w*0.25},${w*0.5} ${w*0.25},${w*0.25} L ${w*0.5},${w*0.1} L ${w*0.75},${w*0.25} C ${w*0.75},${w*0.5} ${w*0.75},${w*0.8} ${w*0.5},${w*0.9} Z`} 
        fill="none" 
        stroke={theme.dark} 
        strokeWidth="1" 
        opacity="0.3"
      />
    </g>
  );

  // 2. Officer: Heraldic Shield with Stripe
  const renderOfficer = () => (
    <g>
      <defs>
        <linearGradient id={`${uniqueId}-officer`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.light} />
          <stop offset="100%" stopColor={theme.main} />
        </linearGradient>
      </defs>
      <path 
        d={`M ${w*0.1},${w*0.1} H ${w*0.9} V ${w*0.4} C ${w*0.9},${w*0.8} ${w*0.5},${w} ${w*0.5},${w} C ${w*0.5},${w} ${w*0.1},${w*0.8} ${w*0.1},${w*0.4} Z`}
        fill={`url(#${uniqueId}-officer)`}
        stroke={theme.dark}
        strokeWidth="2"
      />
      {/* Chevron Stripe */}
      <path 
        d={`M ${w*0.1},${w*0.1} L ${w*0.5},${w*0.5} L ${w*0.9},${w*0.1} V ${w*0.25} L ${w*0.5},${w*0.65} L ${w*0.1},${w*0.25} Z`}
        fill={theme.dark}
        opacity="0.2"
      />
      {/* Border Rivets */}
      <circle cx={w*0.15} cy={w*0.15} r={2} fill={theme.light} />
      <circle cx={w*0.85} cy={w*0.15} r={2} fill={theme.light} />
      <circle cx={w*0.5} cy={w*0.92} r={2} fill={theme.light} />
    </g>
  );

  // 3. Spec Ops: Tech Octagon
  const renderSpecOps = () => {
    const inset = w * 0.15;
    return (
      <g>
        <defs>
          <linearGradient id={`${uniqueId}-specops`} x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor={theme.dark} />
             <stop offset="50%" stopColor={theme.main} />
             <stop offset="100%" stopColor={theme.dark} />
          </linearGradient>
          <pattern id={`${uniqueId}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke={theme.light} strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <polygon 
          points={`${half},0 ${w},${inset} ${w},${w-inset} ${half},${w} 0,${w-inset} 0,${inset}`}
          fill={`url(#${uniqueId}-specops)`}
          stroke={theme.light} 
          strokeWidth="2"
        />
        {/* Grid Overlay */}
        <polygon 
          points={`${half},0 ${w},${inset} ${w},${w-inset} ${half},${w} 0,${w-inset} 0,${inset}`}
          fill={`url(#${uniqueId}-grid)`}
        />
        {/* Tech Corners */}
        <path d={`M ${w*0.1},${inset} L 0,${inset} L 0,${inset*2}`} stroke={theme.light} strokeWidth="2" fill="none" />
        <path d={`M ${w*0.9},${inset} L ${w},${inset} L ${w},${inset*2}`} stroke={theme.light} strokeWidth="2" fill="none" />
        <path d={`M ${w*0.1},${w-inset} L 0,${w-inset} L 0,${w-inset*2}`} stroke={theme.light} strokeWidth="2" fill="none" />
        <path d={`M ${w*0.9},${w-inset} L ${w},${w-inset} L ${w},${w-inset*2}`} stroke={theme.light} strokeWidth="2" fill="none" />
      </g>
    );
  };

  // 4. Commander: Laurel Wreath Circle
  const renderCommander = () => (
    <g>
      <defs>
        <radialGradient id={`${uniqueId}-commander`} cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor={theme.main} />
          <stop offset="100%" stopColor={theme.dark} />
        </radialGradient>
      </defs>
      {/* Back Ribbon/Star */}
      <polygon 
        points={`${half},0 ${w*0.85},${w*0.15} ${w},${half} ${w*0.85},${w*0.85} ${half},${w} ${w*0.15},${w*0.85} 0,${half} ${w*0.15},${w*0.15}`}
        fill={theme.dark} 
      />
      {/* Main Circle */}
      <circle cx={half} cy={half} r={w*0.38} fill={`url(#${uniqueId}-commander)`} stroke={theme.light} strokeWidth="1" />
      
      {/* Wreath Details (Simplified Leaves) */}
      <path 
        d={`
          M ${w*0.2},${w*0.75} Q ${w*0.05},${half} ${w*0.3},${w*0.2} 
          M ${w*0.8},${w*0.75} Q ${w*0.95},${half} ${w*0.7},${w*0.2}
        `} 
        stroke={theme.light} 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round" 
        strokeDasharray="4 4"
      />
      
      {/* Bottom Ribbon */}
      <path 
        d={`M ${w*0.2},${w*0.8} Q ${half},${w} ${w*0.8},${w*0.8} L ${w*0.8},${w*0.9} L ${half},${w*1.1} L ${w*0.2},${w*0.9} Z`} 
        fill={theme.light}
      />
    </g>
  );

  // 5. Legend: Cosmic Wings
  const renderLegend = () => (
    <g>
      <defs>
        <linearGradient id={`${uniqueId}-legend`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.light} />
          <stop offset="50%" stopColor={theme.main} />
          <stop offset="100%" stopColor={theme.dark} />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path 
        d={`
          M ${half},${w*0.8} 
          Q ${w*0.2},${w*0.9} 0,${w*0.4} 
          Q 0,${w*0.1} ${w*0.2},${0} 
          L ${half},${w*0.3} 
          L ${w*0.8},${0} 
          Q ${w},${w*0.1} ${w},${w*0.4} 
          Q ${w*0.8},${w*0.9} ${half},${w*0.8}
        `}
        fill={theme.dark}
      />
      {/* Inner Wing Feathers */}
      <path 
        d={`
          M ${half},${w*0.7}
          Q ${w*0.3},${w*0.8} ${w*0.1},${w*0.4}
          Q ${w*0.1},${w*0.2} ${w*0.3},${w*0.1}
          L ${half},${w*0.3}
          L ${w*0.7},${w*0.1}
          Q ${w*0.9},${w*0.2} ${w*0.9},${w*0.4}
          Q ${w*0.7},${w*0.8} ${half},${w*0.7}
        `}
        fill={`url(#${uniqueId}-legend)`}
      />
      {/* Central Gem */}
      <rect 
        x={w*0.35} y={w*0.35} width={w*0.3} height={w*0.3} 
        transform={`rotate(45 ${half} ${half})`}
        fill={theme.light} 
        stroke={theme.dark} 
        strokeWidth="1" 
      />
    </g>
  );

  // 6. GOD TIER 1: Assistant of God (Seraphic Guardian)
  const renderAssistantOfGod = () => (
    <g>
      <defs>
        <radialGradient id={`${uniqueId}-god1`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" /> {/* Amber-400 */}
          <stop offset="100%" stopColor="#78350f" /> {/* Amber-900 */}
        </radialGradient>
        <filter id={`${uniqueId}-glow1`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id={`${uniqueId}-wings1`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Back Aureola */}
      <circle cx={half} cy={half} r={w*0.48} stroke={theme.dark} strokeWidth="1" fill="none" strokeDasharray="2 4" opacity="0.5" />
      
      {/* Seraphic Wings (6 wings concept simplified to 4 vertical sharp wings) */}
      <path 
        d={`M ${half},${w*0.1} Q ${w*0.9},${w*0.1} ${w*0.85},${w*0.5} Q ${w*0.9},${w*0.9} ${half},${w*0.9} Q ${w*0.1},${w*0.9} ${w*0.15},${w*0.5} Q ${w*0.1},${w*0.1} ${half},${w*0.1}`}
        fill={theme.dark}
        opacity="0.8"
      />
      <path 
        d={`
           M ${half},${w*0.2} 
           Q ${w*0.8},${w*0.0} ${w*0.9},${w*0.4} L ${half},${half} L ${w*0.1},${w*0.4} Q ${w*0.2},${w*0.0} ${half},${w*0.2}
        `}
        fill={`url(#${uniqueId}-wings1)`}
      />
      <path 
        d={`
           M ${half},${w*0.8} 
           Q ${w*0.8},${w} ${w*0.9},${w*0.6} L ${half},${half} L ${w*0.1},${w*0.6} Q ${w*0.2},${w} ${half},${w*0.8}
        `}
        fill={`url(#${uniqueId}-wings1)`}
      />

      {/* Central Electric Core */}
      <polygon 
        points={`${half},${w*0.3} ${w*0.7},${half} ${half},${w*0.7} ${w*0.3},${half}`}
        fill={`url(#${uniqueId}-god1)`}
        stroke={theme.light}
        strokeWidth="1.5"
        filter={`url(#${uniqueId}-glow1)`}
      />
      
      {/* Floating Orbs */}
      <circle cx={w*0.2} cy={w*0.3} r={w*0.04} fill="#fef3c7" filter={`url(#${uniqueId}-glow1)`} />
      <circle cx={w*0.8} cy={w*0.3} r={w*0.04} fill="#fef3c7" filter={`url(#${uniqueId}-glow1)`} />
      <circle cx={w*0.5} cy={w*0.9} r={w*0.04} fill="#fef3c7" filter={`url(#${uniqueId}-glow1)`} />
    </g>
  );

  // 7. GOD TIER 2: God of Knowledge (Cosmic Solar Mandala)
  const renderGodOfKnowledge = () => {
    return (
      <g>
        <defs>
          <radialGradient id={`${uniqueId}-god2`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#fff" />
            <stop offset="60%" stopColor="#fb923c" /> {/* Orange-400 */}
            <stop offset="100%" stopColor="#7c2d12" /> {/* Orange-900 */}
          </radialGradient>
          <filter id={`${uniqueId}-sunGlow`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over" />
          </filter>
        </defs>

        {/* Outer Solar Flares */}
        <g transform={`translate(${half}, ${half})`}>
          {[...Array(8)].map((_, i) => (
             <path 
               key={`flare-${i}`}
               d={`M -${w*0.08},-${w*0.25} Q 0,-${w*0.6} ${w*0.08},-${w*0.25} L 0,0 Z`}
               fill={i % 2 === 0 ? theme.dark : theme.main}
               transform={`rotate(${i * 45})`}
               opacity="0.8"
             />
          ))}
        </g>

        {/* Orbiting Electron Rings representing Knowledge */}
        <ellipse cx={half} cy={half} rx={w*0.45} ry={w*0.15} stroke={theme.light} strokeWidth="1" fill="none" transform={`rotate(45 ${half} ${half})`} opacity="0.6" />
        <ellipse cx={half} cy={half} rx={w*0.45} ry={w*0.15} stroke={theme.light} strokeWidth="1" fill="none" transform={`rotate(-45 ${half} ${half})`} opacity="0.6" />

        {/* Sacred Geometry Inner Circle */}
        <circle cx={half} cy={half} r={w*0.3} stroke={theme.light} strokeWidth="1" fill="none" strokeDasharray="1 3" />
        
        {/* Central Burning Core */}
        <circle cx={half} cy={half} r={w*0.22} fill={`url(#${uniqueId}-god2)`} filter={`url(#${uniqueId}-sunGlow)`} stroke={theme.light} strokeWidth="1.5" />
      </g>
    );
  };

  // 8. GOD TIER 3: THE GOD (Supreme Celestial Radiance)
  const renderGod = () => {
    const cp = w * 0.35; 
    const infW = w * 0.8; 
    const startX = half;
    const startY = half;
    
    const infinityPath = `
      M ${startX},${startY}
      C ${startX + cp},${startY - cp} ${startX + infW/2},${startY - cp} ${startX + infW/2},${startY}
      C ${startX + infW/2},${startY + cp} ${startX + cp},${startY + cp} ${startX},${startY}
      C ${startX - cp},${startY - cp} ${startX - infW/2},${startY - cp} ${startX - infW/2},${startY}
      C ${startX - infW/2},${startY + cp} ${startX - cp},${startY + cp} ${startX},${startY}
      Z
    `;

    return (
      <g>
        <defs>
          <linearGradient id={`${uniqueId}-godWings`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" /> {/* Amber-100 */}
            <stop offset="50%" stopColor="#ffffff" /> 
            <stop offset="100%" stopColor="#fef3c7" /> 
          </linearGradient>
          <linearGradient id={`${uniqueId}-goldMetal`} x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#fcd34d" />
             <stop offset="50%" stopColor="#fff" />
             <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <radialGradient id={`${uniqueId}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </radialGradient>
          <filter id={`${uniqueId}-divineGlow`}>
             <feGaussianBlur stdDeviation="4" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Divine Halo Aura */}
        <circle cx={half} cy={half} r={w*0.48} fill={`url(#${uniqueId}-halo)`} filter={`url(#${uniqueId}-divineGlow)`} />

        {/* Massive Archangel Wings (Layered) */}
        <g transform={`translate(${half}, ${half})`}>
          {/* Back Wings (Darker) */}
          <path 
            d={`M 0,0 Q -${w*0.4},-${w*0.6} -${w*0.9},-${w*0.3} Q -${w*0.8},0 -${w*0.5},${w*0.1} Z`} 
            fill="#b45309" transform="scale(1)" opacity="0.8" 
          />
          <path 
            d={`M 0,0 Q ${w*0.4},-${w*0.6} ${w*0.9},-${w*0.3} Q ${w*0.8},0 ${w*0.5},${w*0.1} Z`} 
            fill="#b45309" transform="scale(1)" opacity="0.8" 
          />
          
          {/* Main Wings (Bright) */}
          <path 
            d={`
              M 0,${w*0.1} 
              C -${w*0.3},-${w*0.3} -${w*0.7},-${w*0.5} -${w*0.9},-${w*0.1} 
              C -${w*0.8},${w*0.1} -${w*0.6},${w*0.3} 0,${w*0.4}
              Z
            `}
            fill={`url(#${uniqueId}-godWings)`}
            filter={`url(#${uniqueId}-divineGlow)`}
          />
          <path 
            d={`
              M 0,${w*0.1} 
              C ${w*0.3},-${w*0.3} ${w*0.7},-${w*0.5} ${w*0.9},-${w*0.1} 
              C ${w*0.8},${w*0.1} ${w*0.6},${w*0.3} 0,${w*0.4}
              Z
            `}
            fill={`url(#${uniqueId}-godWings)`}
            filter={`url(#${uniqueId}-divineGlow)`}
          />
        </g>

        {/* Knowledge Radio Waves */}
        <circle cx={half} cy={half} r={w*0.42} stroke="#fcd34d" strokeWidth="0.5" fill="none" opacity="0.4" />
        <circle cx={half} cy={half} r={w*0.38} stroke="#fcd34d" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="1 2" />

        {/* The Infinity Symbol (Interwoven) */}
        <path 
          d={infinityPath} 
          fill="none" 
          stroke={`url(#${uniqueId}-goldMetal)`} 
          strokeWidth="4" 
          strokeLinecap="round"
          filter={`url(#${uniqueId}-divineGlow)`}
        />
        <path 
          d={infinityPath} 
          fill="none" 
          stroke="#fff" 
          strokeWidth="1" 
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Crown of Light (Top) */}
        <path 
          d={`M ${half},${w*0.05} L ${half},${w*0.15}`} 
          stroke="#fff" strokeWidth="2" filter={`url(#${uniqueId}-divineGlow)`} 
        />
        <circle cx={half} cy={w*0.05} r={2} fill="#fff" />
      </g>
    );
  };

  const getBadgeRenderer = () => {
    switch (true) {
      case rankIndex <= 1: return renderRecruit();
      case rankIndex <= 4: return renderOfficer();
      case rankIndex <= 7: return renderSpecOps();
      case rankIndex <= 10: return renderCommander();
      case rankIndex <= 12: return renderLegend();
      case rankIndex === 13: return renderAssistantOfGod();
      case rankIndex === 14: return renderGodOfKnowledge();
      default: return renderGod();
    }
  };

  const renderIcon = () => {
    const props = { size: icon, strokeWidth: 2, className: locked ? "opacity-50" : "" };
    // For God tier, use 'text-white' mixed with specific fill
    if (rankIndex >= 13) props.className += " drop-shadow-md";

    switch (rankIndex) {
      case 0: return <Feather {...props} />;
      case 1: return <FlaskConical {...props} />;
      case 2: return <ScrollText {...props} />;
      case 3: return <BookOpen {...props} />;
      case 4: return <GraduationCap {...props} />;
      case 5: return <Lightbulb {...props} />;
      case 6: return <Microscope {...props} />;
      case 7: return <Medal {...props} />;
      case 8: return <Atom {...props} />;
      case 9: return <Brain {...props} />;
      case 10: return <Dna {...props} />;
      case 11: return <Orbit {...props} />;
      case 12: return <Infinity {...props} strokeWidth={3} />;
      case 13: return <Zap {...props} fill="#fff" className="text-amber-600" />;
      case 14: return <Sun {...props} fill="#fff" className="text-orange-600" />;
      case 15: return <Crown {...props} fill="#fbbf24" className="text-yellow-700" />;
      default: return <Sparkles {...props} />;
    }
  };

  // --- RANK INDICATORS (Chevrons / Stars) ---
  const renderRankIndicators = () => {
    if (locked) return null;

    // 1. Recruits: Chevrons (Rank 0-1)
    if (rankIndex <= 1) { 
      const count = rankIndex + 1;
      return (
        <div className="absolute bottom-2 flex flex-col items-center -space-y-1 text-white/90 drop-shadow-md">
           {[...Array(count)].map((_, i) => <ChevronUp key={i} size={w*0.2} strokeWidth={4} />)}
        </div>
      );
    }

    // 2. Officers: Top Stars (Rank 2-4)
    if (rankIndex <= 4) { 
      const count = rankIndex - 1; 
      return (
        <div className="absolute top-1 flex gap-0.5 filter drop-shadow-sm">
          {[...Array(count)].map((_, i) => <Star key={i} size={w*0.14} fill={theme.light} className="text-transparent" />)}
        </div>
      );
    }

    // 3. Spec Ops: Bottom Bars (Rank 5-7)
    if (rankIndex <= 7) { 
      const count = rankIndex - 4; 
      return (
         <div className="absolute bottom-4 flex gap-1">
           {[...Array(count)].map((_, i) => (
             <div key={i} className="bg-cyan-200 shadow-[0_0_5px_rgba(34,211,238,0.8)]" style={{ width: w*0.06, height: w*0.15 }}></div>
           ))}
         </div>
      );
    }

    // 4. Commanders & Legends: Progressive Stars at Bottom (Rank 8-10, 11-12)
    // Note: User requested specifically: Quantum(8)->1, Neural(9)->2, Genetic(10)->3. 
    // This logic groups Rank 8-10 into a 1-2-3 star progression.
    if (rankIndex <= 10) { 
       const count = rankIndex - 7; // 8->1, 9->2, 10->3
       return (
        <div className="absolute bottom-2 flex gap-0.5 filter drop-shadow-md">
           {[...Array(count)].map((_, i) => (
              <Star key={i} size={w*0.18} fill={theme.light} className="text-transparent" />
           ))}
        </div>
      );
    }

    // Legends (Rank 11-12) - Cosmic Sage etc. Let's give them a central glow instead of stars as they are distinct.
    // Or if the user meant "same all of them" implies everything after Commanders follows 1,2,3 logic?
    // Given 11,12 are a different tier (Legends), I'll stick to a high-tier glowing orb for now unless specified.
    return null;
  };

  return (
    <div 
      className={`relative flex items-center justify-center select-none transition-transform duration-300 ${!locked ? 'hover:scale-110' : ''}`}
      style={{ width: w, height: w }}
    >
      {/* SVG Background */}
      <svg width={w} height={w} className="absolute inset-0 drop-shadow-lg overflow-visible">
        {getBadgeRenderer()}
      </svg>
      
      {/* Rank Indicators */}
      {renderRankIndicators()}

      {/* Main Icon */}
      <div 
        className={`relative z-10 flex items-center justify-center ${theme.text} ${locked ? 'grayscale opacity-50' : ''} drop-shadow-lg mb-1`}
        style={{ textShadow: rankIndex >= 13 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none' }}
      >
        {renderIcon()}
      </div>

      {/* Gloss Effect - Subtle top shine */}
      {!locked && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" 
          style={{ clipPath: 'ellipse(60% 40% at 50% 20%)' }}
        ></div>
      )}
    </div>
  );
};

export default RankBadge;