import React from 'react';

export type SpiderVariant = 'black' | 'garden' | 'tarantula' | 'robot';

interface SpiderMascotProps {
  className?: string;
  variant?: SpiderVariant;
}

export const SpiderMascot: React.FC<SpiderMascotProps> = ({ className, variant = 'black' }) => {
  const theme = {
    black: { 
      body: '#1f2937', // Dark Gray
      head: '#111827',
      legs: '#000000', 
      highlight: '#ef4444', // Red hourglass
      eyes: '#ffffff'
    },
    garden: { 
      body: '#fbbf24', // Amber/Yellow
      head: '#000000',
      legs: '#4b5563', 
      highlight: '#000000', // Black stripes
      eyes: '#ef4444'
    },
    tarantula: { 
      body: '#78350f', // Brown
      head: '#451a03',
      legs: '#5c2b0b', 
      highlight: '#fb923c', // Orange hairs
      eyes: '#000000'
    },
    robot: { 
      body: '#3b82f6', // Blue
      head: '#1e3a8a',
      legs: '#60a5fa', 
      highlight: '#ffffff', // LED
      eyes: '#bef264' // Lime glow
    }
  }[variant];

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {/* Web thread connector (invisible by default, handled by parent usually, but spinneret is at bottom) */}
      
      {/* Legs Right (4) */}
      <path d="M60 45 Q 85 20 95 40" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 50 Q 90 40 98 60" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 55 Q 85 70 90 85" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M58 60 Q 75 80 80 95" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Legs Left (4) */}
      <path d="M40 45 Q 15 20 5 40" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 50 Q 10 40 2 60" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 55 Q 15 70 10 85" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M42 60 Q 25 80 20 95" stroke={theme.legs} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Abdomen (Back) */}
      <ellipse cx="50" cy="65" rx="16" ry="22" fill={theme.body} />
      
      {/* Variant Details on Abdomen */}
      {variant === 'black' && (
        <path d="M50 58 L 54 64 L 50 70 L 46 64 Z" fill={theme.highlight} opacity="0.9" />
      )}
      {variant === 'garden' && (
        <path d="M36 60 Q 50 75 64 60" stroke={theme.highlight} strokeWidth="3" fill="none" opacity="0.6" />
      )}
      {variant === 'tarantula' && (
        <g stroke={theme.highlight} strokeWidth="0.5" opacity="0.5">
           <path d="M40 60 L 35 55" /> <path d="M60 60 L 65 55" />
           <path d="M40 70 L 35 75" /> <path d="M60 70 L 65 75" />
           <path d="M50 50 L 50 45" /> <path d="M50 80 L 50 85" />
        </g>
      )}
      {variant === 'robot' && (
        <circle cx="50" cy="65" r="8" fill={theme.highlight} opacity="0.5" className="animate-pulse" />
      )}

      {/* Cephalothorax (Head/Front) */}
      <circle cx="50" cy="40" r="14" fill={theme.head} />
      
      {/* Eyes (Cluster) */}
      <circle cx="45" cy="36" r="2.5" fill={theme.eyes} />
      <circle cx="55" cy="36" r="2.5" fill={theme.eyes} />
      <circle cx="48" cy="40" r="2" fill={theme.eyes} />
      <circle cx="52" cy="40" r="2" fill={theme.eyes} />
      <circle cx="42" cy="38" r="1.5" fill={theme.eyes} />
      <circle cx="58" cy="38" r="1.5" fill={theme.eyes} />

      {/* Mandibles/Fangs */}
      <path d="M46 48 L 45 54" stroke={theme.legs} strokeWidth="2" />
      <path d="M54 48 L 55 54" stroke={theme.legs} strokeWidth="2" />
    </svg>
  );
};