import React, { useState, useEffect, useRef } from 'react';
import { AntMascot, AntVariant } from './AntMascot';

interface WanderingAntProps {
  variant?: AntVariant;
  className?: string;
  boundsRef: React.RefObject<HTMLElement>;
  startPos?: { x: number, y: number };
}

export const WanderingAnt: React.FC<WanderingAntProps> = ({ variant = 'black', className, boundsRef, startPos }) => {
  // We use refs to track the logical state to avoid dependency loops in useEffect
  // Initial position is random 10-90%
  const posRef = useRef(startPos || { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
  const rotRef = useRef(Math.random() * 360);
  
  // State for rendering
  const [renderState, setRenderState] = useState({
    x: posRef.current.x,
    y: posRef.current.y,
    rotation: rotRef.current,
    duration: 0,
    isMoving: false
  });

  useEffect(() => {
    let isMounted = true;
    let mainTimeout: ReturnType<typeof setTimeout>;
    let moveTimeout: ReturnType<typeof setTimeout>;
    let finishTimeout: ReturnType<typeof setTimeout>;

    const loop = () => {
      if (!isMounted) return;
      
      if (!boundsRef.current) {
        mainTimeout = setTimeout(loop, 500);
        return;
      }

      const { clientWidth: w, clientHeight: h } = boundsRef.current;
      
      // Current pos in pixels
      const currentX = (posRef.current.x / 100) * w;
      const currentY = (posRef.current.y / 100) * h;

      // Pick new target (padding 5% to keep away from extreme edges)
      const targetXPerc = 5 + Math.random() * 90;
      const targetYPerc = 5 + Math.random() * 90;
      
      const targetX = (targetXPerc / 100) * w;
      const targetY = (targetYPerc / 100) * h;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Speed: 40-80 px per second (slightly faster for responsiveness)
      const speed = 40 + Math.random() * 40; 
      const duration = dist / speed; // seconds

      // Calculate angle
      // atan2(dy, dx) returns angle from X-axis (Right is 0, Down is 90, Up is -90)
      // Ant visual faces UP (Negative Y).
      // So if we want to go Right (0 deg), Ant needs to rotate 90 deg.
      // If we want to go Up (-90 deg), Ant needs to rotate 0 deg.
      // Formula: CSS Angle = MathAngle + 90
      let targetAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;

      // Normalize rotation for shortest path turn
      const currentRot = rotRef.current;
      const currentRotNormalized = currentRot % 360;
      let diff = targetAngle - currentRotNormalized;
      
      // Keep diff between -180 and 180
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const newRotation = currentRot + diff;
      rotRef.current = newRotation;
      posRef.current = { x: targetXPerc, y: targetYPerc };

      // STEP 1: Rotate towards target
      setRenderState(prev => ({
        ...prev,
        rotation: newRotation,
        duration: 0.4, // Fast rotation
        isMoving: true // Start legs moving while turning
      }));

      // STEP 2: Move to target (after rotation finishes)
      moveTimeout = setTimeout(() => {
        if (!isMounted) return;

        setRenderState(prev => ({
          ...prev,
          x: targetXPerc,
          y: targetYPerc,
          duration: duration, // Actual movement time
          isMoving: true
        }));

        // STEP 3: Stop and Plan Next Move
        finishTimeout = setTimeout(() => {
          if (!isMounted) return;

          setRenderState(prev => ({
            ...prev,
            isMoving: false
          }));

          // Wait a bit before next move
          mainTimeout = setTimeout(loop, 1000 + Math.random() * 2000);

        }, duration * 1000);

      }, 400); // Wait slightly longer than rotation duration
    };

    // Start the loop
    const startDelay = Math.random() * 1000;
    mainTimeout = setTimeout(loop, startDelay);

    return () => {
      isMounted = false;
      clearTimeout(mainTimeout);
      clearTimeout(moveTimeout);
      clearTimeout(finishTimeout);
    };
  }, []); // Empty dependency array ensures this runs once on mount and manages its own loop

  return (
    <div 
      className="absolute z-0 pointer-events-none"
      style={{
        left: `${renderState.x}%`,
        top: `${renderState.y}%`,
        transform: `translate(-50%, -50%) rotate(${renderState.rotation}deg)`,
        transitionProperty: 'left, top, transform',
        transitionDuration: `${renderState.duration}s`,
        transitionTimingFunction: renderState.duration > 0.5 ? 'linear' : 'ease-out'
      }}
    >
      <AntMascot variant={variant} className={className} isMoving={renderState.isMoving} />
    </div>
  );
};