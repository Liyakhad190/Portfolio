import React, { useRef, useEffect } from 'react';
import { isActivelyScrolling } from '../lib/scrollIdle';

const HexagonBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Offscreen canvas for the static background grid
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    let width, height;
    let animationFrameId = null;
    let running = false;

    // Hexagon settings
    const hexRadius = 35;
    const hexHeight = hexRadius * Math.sqrt(3);
    const hexWidth = hexRadius * 2;
    const horizSpacing = hexWidth * 0.75;
    const vertSpacing = hexHeight;

    let hexagons = [];
    // Grid geometry, kept so the frame loop can visit only the cells near the
    // pointer instead of all ~2k of them.
    let perRow = 0;
    let colSpan = 0;
    let rowSpan = 0;

    let mouse = { x: -1000, y: -1000 };
    // Indices that are still lit, so they can fade out after the pointer leaves
    const lit = [];

    const interactionRadius = 180;
    const interactionRadiusSq = interactionRadius * interactionRadius;
    const colWindow = Math.ceil(interactionRadius / horizSpacing) + 1;
    const rowWindow = Math.ceil(interactionRadius / vertSpacing) + 1;

    // Create a Path2D for a single hexagon to optimize drawing
    const createHexagonPath = (radius) => {
      const path = new Path2D();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        const px = radius * Math.cos(angle);
        const py = radius * Math.sin(angle);
        if (i === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }
      path.closePath();
      return path;
    };

    const hexPath = createHexagonPath(hexRadius - 2);

    const drawStaticBackground = () => {
      // Clear offscreen canvas
      offscreenCtx.fillStyle = '#050505';
      offscreenCtx.fillRect(0, 0, width, height);

      // Draw all hexagons with base alpha
      offscreenCtx.strokeStyle = `rgba(160, 160, 160, 0.08)`;
      offscreenCtx.lineWidth = 1;

      for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];
        offscreenCtx.save();
        offscreenCtx.translate(hex.x, hex.y);
        offscreenCtx.stroke(hexPath);
        offscreenCtx.restore();
      }
    };

    const drawHexagonGlow = (alpha) => {
      // #e84e44 = rgb(232, 78, 68)
      ctx.strokeStyle = `rgba(232, 78, 68, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke(hexPath);
    };

    const initHexagons = () => {
      hexagons = [];
      const cols = Math.ceil(width / horizSpacing) + 2;
      const rows = Math.ceil(height / vertSpacing) + 2;
      // Loop below runs col from -1 to cols-1 and row from -1 to rows-1
      perRow = cols + 1;
      colSpan = cols + 1;
      rowSpan = rows + 1;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * horizSpacing;
          const y = row * vertSpacing + (col % 2 === 1 ? vertSpacing / 2 : 0);
          // Add a phase offset for each hexagon based on distance from center to create a nice wave
          const phase = Math.sqrt(x * x + y * y) * 0.005;
          hexagons.push({ x, y, phase, alpha: 0, targetAlpha: 0, inLit: false });
        }
      }
      lit.length = 0;
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      initHexagons();
      drawStaticBackground();
      // Repaint the visible canvas too, otherwise a resize while idle would
      // leave the old frame on screen until the pointer wakes the loop up.
      ctx.drawImage(offscreenCanvas, 0, 0);
    };

    let lastTime = 0;
    let lastDrawWasActive = true;

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    };

    const animate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > 16) { // Target ~60fps
        lastTime = timestamp;

        // A full-screen canvas blit per frame is the most expensive thing in the
        // page, and it is always on screen — so it must not compete with the
        // scroll. It repaints itself the moment scrolling stops.
        if (isActivelyScrolling()) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        let needsDraw = false;

        // Row/col window of cells that can be within the interaction radius.
        // Odd columns are nudged down by half a row, so pad by one row.
        const minCol = Math.max(-1, Math.floor(mouse.x / horizSpacing) - colWindow);
        const maxCol = Math.min(colSpan - 1, Math.floor(mouse.x / horizSpacing) + colWindow);
        const minRow = Math.max(-1, Math.floor(mouse.y / vertSpacing) - rowWindow - 1);
        const maxRow = Math.min(rowSpan - 1, Math.floor(mouse.y / vertSpacing) + rowWindow + 1);

        // Fade out anything still glowing from a previous pointer position that
        // has now fallen outside the window.
        for (let i = lit.length - 1; i >= 0; i--) {
          const index = lit[i];
          const row = Math.floor(index / perRow);
          const col = index - row * perRow;
          if (col >= minCol && col <= maxCol && row >= minRow && row <= maxRow) continue;

          const hex = hexagons[index];
          hex.targetAlpha = 0;
          hex.alpha += (hex.targetAlpha - hex.alpha) * 0.15;
          if (hex.alpha > 0.005 || hex.targetAlpha > 0.005) {
            needsDraw = true;
          } else {
            lit.splice(i, 1);
            hex.inLit = false;
          }
        }

        // Update only the cells the pointer can actually reach
        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            const hex = hexagons[row * perRow + col];
            if (!hex) continue;

            // Distance squared to mouse (avoids Math.sqrt)
            const dx = mouse.x - hex.x;
            const dy = mouse.y - hex.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < interactionRadiusSq) {
              const dist = Math.sqrt(distSq);
              hex.targetAlpha = 1 - (dist / interactionRadius);
            } else {
              hex.targetAlpha = 0;
            }

            // Smooth transition for glowing effect
            hex.alpha += (hex.targetAlpha - hex.alpha) * 0.15;

            if (hex.alpha > 0.005 || hex.targetAlpha > 0.005) {
              needsDraw = true;
              // `inLit` guards against a cell sitting right on the edge of the
              // radius being appended on consecutive frames.
              if (!hex.inLit) {
                hex.inLit = true;
                lit.push(row * perRow + col);
              }
            }
          }
        }

        if (needsDraw) {
          // Draw static background from offscreen canvas
          ctx.drawImage(offscreenCanvas, 0, 0);

          // Second pass: only draw active hexagons
          for (let i = 0; i < lit.length; i++) {
            const hex = hexagons[lit[i]];
            if (hex.alpha <= 0.01) continue;

            ctx.save();
            ctx.translate(hex.x, hex.y);

            const wave = Math.sin(timestamp * 0.0015 + hex.phase);
            const waveScale = 0.7 + wave * 0.3;
            const scale = 1.0 - (1.0 - waveScale) * hex.alpha;

            ctx.scale(scale, scale);

            ctx.fillStyle = '#050505';
            ctx.fill(hexPath);

            ctx.strokeStyle = `rgba(160, 160, 160, 0.08)`;
            ctx.lineWidth = 1;
            ctx.stroke(hexPath);

            drawHexagonGlow(hex.alpha);

            ctx.restore();
          }
          lastDrawWasActive = true;
        } else if (lastDrawWasActive) {
          // Draw one final frame of the static background when everything has settled
          ctx.drawImage(offscreenCanvas, 0, 0);
          lastDrawWasActive = false;
        } else {
          // Fully settled: idle out instead of spinning an empty rAF forever.
          stop();
          return;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // The pointer can revive a fully settled grid
      if (mouse.x < 0 || mouse.y < 0 || mouse.x > width || mouse.y > height) return;
      if (isActivelyScrolling()) return;
      start();
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        if (isActivelyScrolling()) return;
        start();
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      // Loop keeps running just long enough to fade the glow out, then idles.
      start();
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibility);

    resize();
    // One static paint up front; the loop only starts on interaction.
    ctx.drawImage(offscreenCanvas, 0, 0);
    lastDrawWasActive = false;
    start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default HexagonBackground;
