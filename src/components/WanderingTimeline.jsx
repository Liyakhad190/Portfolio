import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

const WanderingTimeline = () => {
  const pathRef = useRef(null);
  const [dotPos, setDotPos] = useState({ x: 50, y: 0 });

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(latest * length);
      setDotPos({ x: point.x, y: point.y });
    }
  });

  // Re-calculate on mount to ensure dot is placed correctly if page is loaded scrolled down
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(smoothProgress.get() * length);
      setDotPos({ x: point.x, y: point.y });
    }
  }, [smoothProgress]);

  // A smooth double S-curve path
  const pathString = "M 50 0 C 90 20, 10 30, 50 50 C 90 70, 10 80, 50 100";

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      
      {/* Container for SVG and Dot to ensure they align perfectly */}
      <div className="relative w-full h-full max-w-7xl mx-auto">
        
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          {/* Background Track */}
          <path
            d={pathString}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-gray-300 dark:text-gray-800/50"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Animated Filled Line */}
          <motion.path
            ref={pathRef}
            d={pathString}
            fill="none"
            stroke="url(#timelineGradient)"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: smoothProgress }}
          />

          <defs>
            <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan 400 */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* Blue 500 */}
            </linearGradient>
          </defs>
        </svg>

        {/* The Traveling Dot */}
        <div
          className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_3px_rgba(34,211,238,0.6)] border-2 border-white dark:border-[#0a0a0a] z-10 transition-all duration-75 ease-linear"
          style={{
            left: `${dotPos.x}%`,
            top: `${dotPos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
      </div>
    </div>
  );
};

export default WanderingTimeline;
