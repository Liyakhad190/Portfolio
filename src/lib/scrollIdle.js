/**
 * Tracks whether the user is actively scrolling.
 *
 * ProjectMotionGraphic's render loops already had a guard for this, but they
 * read `window.isScrolling` — a flag nothing ever set, so the guard never
 * fired and the canvases kept painting through every scroll gesture.
 */

let isScrolling = false;
let idleTimer = null;
let attached = false;

const listeners = new Set();

function setScrolling(next) {
  if (isScrolling === next) return;
  isScrolling = next;
  listeners.forEach((fn) => fn(next));
}

function handleScroll() {
  setScrolling(true);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => setScrolling(false), 140);
}

export function attachScrollTracking() {
  if (attached || typeof window === 'undefined') return;
  attached = true;
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });
}

/** Read the current state. */
export function isActivelyScrolling() {
  return isScrolling;
}

/**
 * Subscribe to scroll start/stop transitions. The callback fires only on an
 * actual change, never per frame, so it is safe to drive React state from it.
 * Returns an unsubscribe function.
 */
export function onScrollStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
