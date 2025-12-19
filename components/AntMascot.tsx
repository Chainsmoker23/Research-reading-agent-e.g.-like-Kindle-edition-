import React from 'react';

export type AntVariant = 'red' | 'black' | 'fire' | 'weaver' | 'hybrid' | 'green' | 'purple';

interface AntMascotProps {
  className?: string;
  variant?: AntVariant;
  isMoving?: boolean;
}

export const AntMascot: React.FC<AntMascotProps> = ({ className, variant = 'red', isMoving = false }) => {
  // Color Palettes
  const theme = {
    red: {
      primary: '#ef4444', // Bright Red
      secondary: '#dc2626',
      dark: '#b91c1c',
      stroke: '#7f1d1d'
    },
    black: {
      primary: '#374151', // Dark Gray/Black
      secondary: '#1f2937',
      dark: '#111827',
      stroke: '#000000'
    },
    fire: {
      primary: '#fb923c', // Orange/Amber
      secondary: '#f97316',
      dark: '#c2410c',
      stroke: '#7c2d12'
    },
    weaver: {
      primary: '#a3e635', // Lime
      secondary: '#65a30d',
      dark: '#3f6212',
      stroke: '#1a2e05'
    },
    green: {
      primary: '#22c55e', // Emerald Green
      secondary: '#16a34a',
      dark: '#15803d',
      stroke: '#14532d'
    },
    hybrid: {
      primary: '#8b5cf6', // Violet/Dark mix (Mutant/AI Ant)
      secondary: '#1f2937', // Black Thorax
      dark: '#4c1d95',
      stroke: '#2e1065'
    },
    purple: {
      primary: '#a855f7', // Purple
      secondary: '#9333ea',
      dark: '#7e22ce',
      stroke: '#581c87'
    }
  }[variant];

  // Animation classes dependent on movement state
  const legClass1 = isMoving ? "animate-ant-leg-1" : "";
  const legClass2 = isMoving ? "animate-ant-leg-2" : "";

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {/* 
         TRIPOD GAIT ANIMATION:
         Set 1 (legClass1): L1, R2, L3
         Set 2 (legClass2): R1, L2, R3
      */}

      {/* Legs Right */}
      {/* R1 - Front Right (Set 1) */}
      <path 
        d="M60 50 L 85 40" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass1}
        style={{ transformOrigin: '60px 50px' }}
      />
      {/* R2 - Middle Right (Set 2) */}
      <path 
        d="M60 60 L 90 60" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass2}
        style={{ transformOrigin: '60px 60px' }}
      />
      {/* R3 - Back Right (Set 1) */}
      <path 
        d="M60 70 L 85 85" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass1}
        style={{ transformOrigin: '60px 70px' }}
      />

      {/* Legs Left */}
      {/* L1 - Front Left (Set 1) */}
      <path 
        d="M40 50 L 15 40" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass1}
        style={{ transformOrigin: '40px 50px' }}
      />
      {/* L2 - Middle Left (Set 2) */}
      <path 
        d="M40 60 L 10 60" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass2}
        style={{ transformOrigin: '40px 60px' }}
      />
      {/* L3 - Back Left (Set 1) */}
      <path 
        d="M40 70 L 15 85" 
        stroke={theme.stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
        className={legClass1}
        style={{ transformOrigin: '40px 70px' }}
      />

      {/* Abdomen (Rear) */}
      <ellipse cx="50" cy="80" rx="18" ry="22" fill={theme.primary} />
      
      {/* Abdomen Stripes/Segments */}
      <path d="M38 72 Q 50 65 62 72" stroke={theme.dark} strokeWidth="2" opacity="0.4" />
      <path d="M35 82 Q 50 75 65 82" stroke={theme.dark} strokeWidth="2" opacity="0.4" />

      {/* Thorax (Middle) - Hybrid uses secondary color here for bi-color look */}
      <ellipse cx="50" cy="55" rx="12" ry="14" fill={variant === 'hybrid' ? theme.secondary : theme.secondary} />

      {/* Head */}
      <ellipse cx="50" cy="30" rx="14" ry="12" fill={theme.dark} />

      {/* Eyes */}
      <circle cx="42" cy="25" r="3" fill="black" />
      <circle cx="58" cy="25" r="3" fill="black" />
      {/* Eye Shine */}
      <circle cx="43" cy="24" r="1" fill="white" opacity="0.8" />
      <circle cx="57" cy="24" r="1" fill="white" opacity="0.8" />

      {/* Mandibles */}
      <path d="M45 20 L 42 10" stroke={theme.stroke} strokeWidth="2" />
      <path d="M55 20 L 58 10" stroke={theme.stroke} strokeWidth="2" />

      {/* Antennae (Subtle wiggle always active if moving or just generally alive) */}
      <path 
        d="M40 22 Q 20 10 10 20" 
        stroke={theme.stroke} 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        className="animate-wiggle"
        style={{ transformOrigin: '40px 22px', animationDuration: '2s' }}
      />
      <path 
        d="M60 22 Q 80 10 90 20" 
        stroke={theme.stroke} 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        className="animate-wiggle"
        style={{ transformOrigin: '60px 22px', animationDuration: '2.5s' }}
      />
      
      {/* Specular Highlights for 3D effect */}
      <ellipse cx="50" cy="80" rx="10" ry="15" fill="white" opacity="0.1" />
      <circle cx="50" cy="55" r="6" fill="white" opacity="0.1" />
      <circle cx="50" cy="30" r="6" fill="white" opacity="0.1" />
    </svg>
  );
};