import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import bangzenLogo from '../assets/images/BGZENBGIJObulat.png';
import CountUp from './CountUp';

const SHOW_MS = 500;
const FADE_MS = 300;
// Social icons appear smoothly alongside progress bar
const SOCIAL_DELAY_S = 0.2;

// ─── All keyframes – GPU composited, zero JS per frame ──────────────────────
const styles = `
  @keyframes spin-cw  { to { transform: rotate(360deg);  } }
  @keyframes spin-ccw { to { transform: rotate(-360deg); } }

  /* Orbiting dots – sized for the 224px (w-56) container */
  @keyframes orbit-outer {
    from { transform: rotate(0deg)   translateY(-106px) rotate(0deg);   }
    to   { transform: rotate(360deg) translateY(-106px) rotate(-360deg);}
  }
  @keyframes orbit-mid {
    from { transform: rotate(180deg) translateY(-80px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateY(-80px) rotate(-540deg); }
  }

  @keyframes bar-fill {
    0%   { width: 0%;   }
    60%  { width: 75%;  }
    85%  { width: 90%;  }
    100% { width: 100%; }
  }
  @keyframes bar-shimmer {
    0%   { left: -15%; opacity: 0; }
    20%  { opacity: 1;             }
    80%  { opacity: 1;             }
    100% { left: 110%; opacity: 0; }
  }
  @keyframes logo-glow {
    0%, 100% { box-shadow: 0 0 0   0  rgba(200,210,220,0.0); }
    50%       { box-shadow: 0 0 22px 8px rgba(200,210,220,0.22); }
  }
`;

// ─── Big logo circle with spinning rings INSIDE ──────────────────────────────
const LogoWithRings = () => (
  // 224 × 224 px outer wrapper — no overflow-hidden so rings render fully
  <div className="relative w-56 h-56 flex items-center justify-center">

    {/* Ring 1 — outer, slow CW */}
    <div className="absolute inset-0 rounded-full border-[2.5px]"
      style={{
        borderColor: 'transparent',
        borderTopColor:   'rgba(148,163,184,0.80)',
        borderRightColor: 'rgba(148,163,184,0.15)',
        animation: 'spin-cw 2.8s linear infinite',
      }}
    />

    {/* Ring 2 — mid, CCW */}
    <div className="absolute inset-[14px] rounded-full border-[2px]"
      style={{
        borderColor: 'transparent',
        borderBottomColor: 'rgba(203,213,225,0.80)',
        borderLeftColor:   'rgba(203,213,225,0.15)',
        animation: 'spin-ccw 1.8s linear infinite',
      }}
    />

    {/* Ring 3 — inner, fast CW */}
    <div className="absolute inset-[28px] rounded-full border-[1.5px]"
      style={{
        borderColor: 'transparent',
        borderTopColor:  'rgba(255,255,255,0.40)',
        borderLeftColor: 'rgba(255,255,255,0.10)',
        animation: 'spin-cw 1.0s linear infinite',
      }}
    />

    {/* Orbiting dot — outer ring */}
    <div className="absolute w-[10px] h-[10px] rounded-full bg-slate-300"
      style={{
        top: '50%', left: '50%',
        marginTop: '-5px', marginLeft: '-5px',
        boxShadow: '0 0 10px 4px rgba(148,163,184,0.65)',
        animation: 'orbit-outer 2.4s linear infinite',
        transformOrigin: '50% 50%',
      }}
    />

    {/* Orbiting dot — mid ring */}
    <div className="absolute w-[7px] h-[7px] rounded-full bg-slate-400"
      style={{
        top: '50%', left: '50%',
        marginTop: '-3.5px', marginLeft: '-3.5px',
        boxShadow: '0 0 7px 3px rgba(203,213,225,0.50)',
        animation: 'orbit-mid 1.5s linear infinite',
        transformOrigin: '50% 50%',
      }}
    />

    {/* Logo center — perfectly centered inside the spinning rings */}
    <div
      className="absolute inset-[40px] rounded-full bg-zinc-800 border border-slate-600/40 overflow-hidden"
      style={{ animation: 'logo-glow 2.5s ease-in-out infinite' }}
    >
      <img
        src={bangzenLogo}
        alt="Logo"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '78%',
          height: '78%',
          objectFit: 'contain',
          objectPosition: 'center center',
          filter: 'brightness(0) invert(1)',
        }}
      />
    </div>
  </div>
);

// ─── Progress bar + counter ──────────────────────────────────────────────────
const LoadingBar = ({ duration }) => {
  const DURATION_S = (duration / 1000).toFixed(2);


  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Track */}
      <div className="relative w-full h-[4px] rounded-full overflow-hidden bg-slate-800/60 dark:bg-slate-700">
        {/* Fill */}
        <div className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #475569, #cbd5e1, #475569)',
            animation: `bar-fill ${DURATION_S}s cubic-bezier(0.3,0,0.6,1) forwards`,
          }}
        />
        {/* Shimmer */}
        <div className="absolute top-0 h-full w-16 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: `bar-shimmer ${DURATION_S}s ease-in-out forwards`,
          }}
        />
      </div>

      {/* Counter + label */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase">
          Loading Application...
        </span>
      </div>
    </div>
  );
};

// ─── Main Preloader ──────────────────────────────────────────────────────────
const Preloader = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleCountEnd = () => {
    // Quick delay so the user sees "100%" before fading
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinished, FADE_MS);
    }, 100);
  };

  return (
    <>
      <style>{styles}</style>

      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            exit={{ opacity: 0, transition: { duration: FADE_MS / 1000, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 flex items-center justify-center dark:bg-[#0a0a0a] bg-zinc-50"
          >
            {/* Wide centred column — max-w-sm gives breathing room */}
            <div className="flex flex-col items-center gap-10 w-full max-w-sm px-8">

              {/* Massive Count Up as the main preloader element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center py-10"
              >
                <CountUp
                  from={0}
                  to={100}
                  duration={(SHOW_MS - FADE_MS) / 1000}
                  className="text-8xl font-mono font-bold text-slate-200 tabular-nums text-center tracking-tighter"
                  onEnd={handleCountEnd}
                />
                <span className="text-8xl font-mono font-bold text-slate-200 tabular-nums text-center tracking-tighter">%</span>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full"
              >
                <LoadingBar duration={SHOW_MS - FADE_MS} />
              </motion.div>

              {/* Social icons — appear exactly at 70 % progress */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: SOCIAL_DELAY_S }}
                className="flex justify-center gap-8"
              >
                <a href="https://github.com/Liyakhad190" target="_blank" rel="noopener noreferrer"
                  className="dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 hover:scale-125">
                  <Github size={32} />
                </a>
                <a href="https://www.linkedin.com/in/liyakhad-ali-780a3132a" target="_blank" rel="noopener noreferrer"
                  className="dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 hover:scale-125">
                  <Linkedin size={32} />
                </a>
                <a href="https://www.instagram.com/zainahmadf" target="_blank" rel="noopener noreferrer"
                  className="dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 hover:scale-125">
                  <Instagram size={32} />
                </a>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Preloader;