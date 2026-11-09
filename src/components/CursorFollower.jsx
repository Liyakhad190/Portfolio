import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], [role="link"], [onclick]';

const REST_SIZE = 34;
const HOVER_SIZE = 62;
// Trailing weight per frame. Lower = longer, smoother trail.
const EASE = 0.18;
const SETTLED_PX = 0.15;

const CursorFollower = () => {
  const { theme } = useTheme();
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    // Pointers with no hover (touch) get nothing to follow.
    if (typeof window === 'undefined') return;
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: target.x, y: target.y };
    let frameId = null;
    let visible = false;
    let hovering = false;

    const paint = () => {
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;

      if (Math.abs(dx) < SETTLED_PX && Math.abs(dy) < SETTLED_PX) {
        pos.x = target.x;
        pos.y = target.y;
        paint();
        // Settled: stop the loop rather than spinning it for the whole session.
        frameId = null;
        return;
      }

      pos.x += dx * EASE;
      pos.y += dy * EASE;
      paint();
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameId == null) frameId = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        // Snap on first appearance so the circle doesn't fly in from centre
        pos.x = e.clientX;
        pos.y = e.clientY;
        paint();
      }
      start();
    };

    const onOver = (e) => {
      const el = e.target instanceof Element ? e.target : null;
      const next = !!el && !!el.closest(INTERACTIVE);
      if (next === hovering) return;
      hovering = next;
      ring.style.width = `${next ? HOVER_SIZE : REST_SIZE}px`;
      ring.style.height = `${next ? HOVER_SIZE : REST_SIZE}px`;
      dot.style.opacity = next ? '0' : '1';
    };

    const onLeave = () => {
      visible = false;
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    };

    const onEnter = (e) => {
      ring.style.opacity = '1';
      onMove(e);
    };

    paint();

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  // With reduced motion the circle tracks the pointer exactly, no trailing.
  const instant = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[100] rounded-full border pointer-events-none select-none will-change-transform"
        style={{
          width: REST_SIZE,
          height: REST_SIZE,
          opacity: 0,
          transition: instant
            ? 'width 0.2s, height 0.2s, opacity 0.2s'
            : 'width 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.55)',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[101] rounded-full pointer-events-none select-none will-change-transform"
        style={{
          width: 6,
          height: 6,
          opacity: 0,
          backgroundColor: '#e84e44',
          transition: 'opacity 0.25s, width 0.3s, height 0.3s',
        }}
      />
    </>
  );
};

export default CursorFollower;
