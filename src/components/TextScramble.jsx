import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const TextScramble = ({ text, className, delay = 0 }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;

    let interval;
    let timeout;
    let startTimeout;

    const runAnimation = () => {
      let iteration = 0;
      interval = setInterval(() => {
        setDisplayText(prev => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        });
        
        if (iteration >= text.length) {
          clearInterval(interval);
          timeout = setTimeout(runAnimation, 4000);
        }
        
        iteration += 1 / 3;
      }, 30);
    };

    if (delay > 0) {
      startTimeout = setTimeout(runAnimation, delay);
    } else {
      runAnimation();
    }
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [text, isInView, delay]);

  return <span ref={ref} className={className}>{displayText}</span>;
};

export default TextScramble;
