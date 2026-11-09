import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHOW_AFTER = 400;

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let scrollable = 0;
    let ticking = false;

    // scrollHeight forces a layout, so it is measured on resize and on content
    // growth — NOT on every scroll event. The scroll handler then only reads
    // window.scrollY, which is free.
    const measure = () => {
      scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    const update = () => {
      ticking = false;
      const progress = scrollable > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollable))
        : 0;

      // Write straight to the DOM: no React state, so no re-render per frame.
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
      }
      if (trackRef.current) {
        trackRef.current.style.opacity = String(0.35 + progress * 0.65);
      }

      // Visibility changes rarely, so React bails out of the rest of the frames.
      setIsVisible(window.scrollY > SHOW_AFTER);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    measure();
    update();

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      observer = new ResizeObserver(() => {
        measure();
        onScroll();
      });
      observer.observe(document.body);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          // No backdrop-blur here: this is a fixed element that exists for the
          // whole scrolled page, and a backdrop-filter re-blurs on every frame
          // the content behind it moves. 95% opacity looks the same for 48px.
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full dark:bg-[#111111]/95 bg-white/95 border dark:border-white/10 border-slate-200 shadow-2xl dark:shadow-white/5 shadow-slate-400/20 outline-none cursor-pointer group"
          aria-label="Scroll to top"
        >
          {/* Progress ring — strokeDashoffset is driven imperatively above */}
          <svg className="absolute w-full h-full -rotate-90 origin-center pointer-events-none">
            <circle
              ref={trackRef}
              cx="24"
              cy="24"
              r={RADIUS}
              className="dark:stroke-white/10 stroke-slate-200"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              ref={progressRef}
              cx="24"
              cy="24"
              r={RADIUS}
              className="dark:stroke-white stroke-white/60"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              strokeLinecap="round"
            />
          </svg>

          <ArrowUp className="w-5 h-5 dark:text-white text-slate-600 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
