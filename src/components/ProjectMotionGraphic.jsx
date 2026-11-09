import React, { useEffect, useRef } from 'react';
import { isActivelyScrolling } from '../lib/scrollIdle';

const ProjectMotionGraphic = ({ title, isHovered }) => {
  const canvasRef = useRef(null);
  // isHovered is read through a ref so the setup effect doesn't tear down and
  // rebuild every particle array + ResizeObserver on each hover in/out.
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;
  const loopControlRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 280);

    // Helper for browser compatibility with roundRect
    const drawRoundRect = (c, x, y, w, h, r) => {
      if (typeof c.roundRect === 'function') {
        c.roundRect(x, y, w, h, r);
      } else {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y,   x + w, y + h, r);
        c.arcTo(x + w, y + h, x,     y + h, r);
        c.arcTo(x,     y + h, x,     y,     r);
        c.arcTo(x,     y,     x + w, y,     r);
        c.closePath();
      }
    };

    // Helper to draw single frame based on category title
    const triggerSingleDraw = () => {
      if (normalizedTitle.includes('portfolio v2')) {
        drawPortfolio();
      } else if (normalizedTitle.includes('e-commerce api')) {
        drawECommerce();
      } else if (normalizedTitle.includes('ui design system')) {
        drawUIDesign();
      } else if (normalizedTitle.includes('air quality')) {
        drawAQI();
      } else if (normalizedTitle.includes('sign language')) {
        drawSignLanguage();
      } else if (normalizedTitle.includes('iot') || normalizedTitle.includes('ai & iot') || normalizedTitle.includes('aiiot')) {
        drawComputerVision();
      } else if (normalizedTitle.includes('prediction dashboard')) {
        drawMLPrediction();
      } else if (normalizedTitle.includes('analytics platform')) {
        drawNeuralNet();
      } else if (normalizedTitle.includes('ar') || normalizedTitle.includes('vr') || normalizedTitle.includes('ar/vr') || normalizedTitle.includes('augmented') || normalizedTitle.includes('virtual reality')) {
        drawARVR();
      } else {
        drawFallback();
      }
    };

    // Re-adjust size if bounds change
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || canvas.offsetWidth || 300;
        height = canvas.height = entry.contentRect.height || canvas.offsetHeight || 280;
      }
      if (!isHoveredRef.current) {
        triggerSingleDraw();
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Keep track of cursor position within the canvas
    const mouse = { x: null, y: null, active: false };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Common setup & states
    let tick = 0;
    const normalizedTitle = title ? title.toLowerCase() : '';

    // ==========================================
    // 1. Portfolio v2: Floating layouts & code snippets
    // ==========================================
    const particlesPortfolio = [];
    const snippets = ['<React />', 'const app = () =>', 'div.flex', 'Framer Motion', 'useState()', 'import', 'CSS/JS', 'flex-col'];
    for (let i = 0; i < 15; i++) {
      particlesPortfolio.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        text: Math.random() > 0.6 ? snippets[Math.floor(Math.random() * snippets.length)] : null,
        color: `rgba(97, 218, 251, ${Math.random() * 0.3 + 0.15})` // Cyan tint
      });
    }

    const drawPortfolio = () => {
      ctx.clearRect(0, 0, width, height);
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw flowing connection lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.beginPath();
      particlesPortfolio.forEach((p, idx) => {
        particlesPortfolio.forEach((p2, idx2) => {
          if (idx !== idx2) {
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 80) {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        });
      });
      ctx.stroke();

      // Render items
      particlesPortfolio.forEach((p) => {
        p.x += p.vx * (isHoveredRef.current ? 2 : 1);
        p.y += p.vy * (isHoveredRef.current ? 2 : 1);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        if (p.text) {
          ctx.font = 'bold 9px monospace';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    // ==========================================
    // 2. E-Commerce API: HTTP Request flow
    // ==========================================
    const requestPackets = [];
    const endpoints = ['GET /api/products', 'POST /api/auth/login', 'GET /api/cart', 'POST /api/checkout', '200 OK', '201 Created'];
    const drawECommerce = () => {
      ctx.clearRect(0, 0, width, height);

      // Node coordinates
      const clientX = width * 0.2;
      const gatewayX = width * 0.5;
      const dbX = width * 0.8;
      const centerY = height * 0.5;

      // Draw Static Infrastructure Nodes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;

      // Client node
      ctx.beginPath();
      ctx.arc(clientX, centerY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Client', clientX, centerY + 4);

      // Gateway / Router Node
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(gatewayX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('API', gatewayX, centerY + 4);

      // DB / Server Node
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(dbX, centerY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.fillText('DB', dbX, centerY + 4);

      // Connecting pipeline lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(clientX + 22, centerY);
      ctx.lineTo(gatewayX - 25, centerY);
      ctx.moveTo(gatewayX + 25, centerY);
      ctx.lineTo(dbX - 22, centerY);
      ctx.stroke();

      // Send a packet periodically
      if (tick % 60 === 0 || (isHoveredRef.current && tick % 30 === 0)) {
        const isResponse = Math.random() > 0.5;
        requestPackets.push({
          progress: 0,
          speed: 0.015 + Math.random() * 0.01,
          endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
          from: isResponse ? dbX : clientX,
          to: isResponse ? clientX : dbX,
          isResponse
        });
      }

      // Draw flying packets
      requestPackets.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          requestPackets.splice(idx, 1);
          return;
        }

        const currentX = p.from + (p.to - p.from) * p.progress;
        // Draw glow
        const glowGrad = ctx.createRadialGradient(currentX, centerY, 0, currentX, centerY, 8);
        glowGrad.addColorStop(0, p.isResponse ? 'rgba(52, 211, 153, 0.6)' : 'rgba(34, 211, 238, 0.6)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(currentX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.isResponse ? '#34d399' : '#22d3ee';
        ctx.beginPath();
        ctx.arc(currentX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Print tiny text on hover/active
        if (isHoveredRef.current) {
          ctx.font = '8px monospace';
          ctx.fillText(p.endpoint, currentX, centerY - 12);
        }
      });
    };

    // ==========================================
    // 3. UI Design System: Morphing layout and interactive grids
    // ==========================================
    const drawUIDesign = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw wireframe grid representation
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 20; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Dynamic rounded rectangles pulsing/morphing
      const pulse = Math.sin(tick * 0.02) * 10;
      const w1 = 70 + pulse;
      const h1 = 30 + pulse / 2;

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)'; // Pink highlight
      ctx.fillStyle = 'rgba(236, 72, 153, 0.03)';
      ctx.lineWidth = 2;

      // Draw card representation
      const cardX = width * 0.15;
      const cardY = height * 0.25;
      ctx.beginPath();
      drawRoundRect(ctx, cardX, cardY, width * 0.7, height * 0.5, 12);
      ctx.fill();
      ctx.stroke();

      // Render dynamic elements inside
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'; // Indigo color
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.beginPath();
      // "Button"
      drawRoundRect(ctx, cardX + 20, cardY + 20, 60, 20, 6);
      ctx.fill();
      ctx.stroke();

      // Sliders moving
      const sliderVal = (Math.sin(tick * 0.03) + 1) / 2;
      const sliderWidth = width * 0.4;
      const sliderX = cardX + 20;
      const sliderY = cardY + 65;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(sliderX, sliderY);
      ctx.lineTo(sliderX + sliderWidth, sliderY);
      ctx.stroke();

      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(sliderX, sliderY);
      ctx.lineTo(sliderX + sliderWidth * sliderVal, sliderY);
      ctx.stroke();

      // Slider handle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sliderX + sliderWidth * sliderVal, sliderY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Color scheme circles in UI design system
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];
      colors.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cardX + 25 + i * 20, cardY + 95, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ==========================================
    // 4. Air Quality System: Flowing vector fields + colored radar warning
    // ==========================================
    const particlesAQI = [];
    for (let i = 0; i < 40; i++) {
      particlesAQI.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 0.6 + 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const drawAQI = () => {
      ctx.clearRect(0, 0, width, height);

      // Background AQI radial gradient lines (Warning radar)
      const centerX = width * 0.7;
      const centerY = height * 0.55;
      const maxRadius = Math.max(0.1, height * 0.45);
      const radarSweep = (tick % 180) / 180;

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.07)'; // safe green
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(0.1, maxRadius * 0.4), 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.05)'; // warning red
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(0.1, maxRadius * 0.8), 0, Math.PI * 2);
      ctx.stroke();

      // Sweeping radar hand
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const angle = radarSweep * Math.PI * 2;
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
      ctx.stroke();

      // Tiny glowing warning hot-spots
      const warningSpots = [
        { x: centerX - 30, y: centerY - 20, aqi: 120, col: '#fb923c' },
        { x: centerX + 40, y: centerY + 15, aqi: 45, col: '#4ade80' },
        { x: centerX - 10, y: centerY + 30, aqi: 180, col: '#f87171' }
      ];

      warningSpots.forEach((spot) => {
        const pulse = Math.sin(tick * 0.05 + spot.aqi) * 3;
        ctx.fillStyle = spot.col;
        ctx.beginPath();
        const rVal = 3 + pulse / 2;
        const safeR = isNaN(rVal) ? 0.1 : Math.max(0.1, rVal);
        ctx.arc(spot.x, spot.y, safeR, 0, Math.PI * 2);
        ctx.fill();

        // Label on hover
        if (isHoveredRef.current) {
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`AQI ${spot.aqi}`, spot.x, spot.y - 8);
        }
      });

      // Air flow dust particles
      particlesAQI.forEach((p) => {
        p.x += p.vx * (isHoveredRef.current ? 2.5 : 1);
        p.y += p.vy;

        if (p.x > width) {
          p.x = 0;
          p.y = Math.random() * height;
        }

        // Determine particle safety color depending on area
        const dist = Math.hypot(p.x - centerX, p.y - centerY);
        let color = '16, 185, 129'; // safe green
        if (dist > maxRadius * 0.6) color = '249, 115, 22'; // moderate orange
        if (dist > maxRadius * 0.9) color = '239, 68, 68'; // danger red

        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ==========================================
    // 5. Sign Language: Wireframe hand tracking skeleton
    // ==========================================
    const handJoints = [
      { id: 0, x: 0.5, y: 0.8 }, // Wrist
      // Thumb
      { id: 1, x: 0.38, y: 0.68 },
      { id: 2, x: 0.3, y: 0.58 },
      { id: 3, x: 0.24, y: 0.52 },
      { id: 4, x: 0.2, y: 0.48 },
      // Index
      { id: 5, x: 0.44, y: 0.52 },
      { id: 6, x: 0.42, y: 0.42 },
      { id: 7, x: 0.41, y: 0.34 },
      { id: 8, x: 0.4, y: 0.26 },
      // Middle
      { id: 9, x: 0.5, y: 0.5 },
      { id: 10, x: 0.5, y: 0.38 },
      { id: 11, x: 0.5, y: 0.28 },
      { id: 12, x: 0.5, y: 0.18 },
      // Ring
      { id: 13, x: 0.56, y: 0.52 },
      { id: 14, x: 0.58, y: 0.42 },
      { id: 15, x: 0.59, y: 0.34 },
      { id: 16, x: 0.6, y: 0.26 },
      // Pinky
      { id: 17, x: 0.62, y: 0.58 },
      { id: 18, x: 0.66, y: 0.52 },
      { id: 19, x: 0.68, y: 0.46 },
      { id: 20, x: 0.7, y: 0.4 }
    ];

    const handBones = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm connections
    ];

    const drawSignLanguage = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle hand shifting motion
      const shiftX = Math.sin(tick * 0.02) * 12;
      const shiftY = Math.cos(tick * 0.03) * 8;

      // Scale calculations
      const scaleX = width * 0.8;
      const scaleY = height * 0.8;
      const offsetX = width * 0.1;
      const offsetY = height * 0.15;

      // Draw skeleton bone lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      handBones.forEach(([b1, b2]) => {
        const j1 = handJoints[b1];
        const j2 = handJoints[b2];
        ctx.moveTo(j1.x * scaleX + offsetX + shiftX, j1.y * scaleY + offsetY + shiftY);
        ctx.lineTo(j2.x * scaleX + offsetX + shiftX, j2.y * scaleY + offsetY + shiftY);
      });
      ctx.stroke();

      // Draw joints (Keypoints)
      handJoints.forEach((j) => {
        const px = j.x * scaleX + offsetX + shiftX;
        const py = j.y * scaleY + offsetY + shiftY;

        ctx.fillStyle = j.id === 8 || j.id === 12 || j.id === 16 || j.id === 20 || j.id === 4 ? '#f43f5e' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Gesture label text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Gesture Detected: "A"', width * 0.5, height - 12);
    };

    // ==========================================
    // 6. Computer Vision Detection System: Scanner radar & tracking box
    // ==========================================
    let cvTargets = [
      { x: 30, y: 40, w: 60, h: 85, label: 'person', score: 0.98, targetX: 30, targetY: 40 },
      { x: 180, y: 90, w: 90, h: 70, label: 'car', score: 0.94, targetX: 180, targetY: 90 }
    ];

    const drawComputerVision = () => {
      ctx.clearRect(0, 0, width, height);

      // Scanning horizontal laser sweep
      const scanY = height > 0 ? (tick * 1.5) % height : 0;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Laser tail glow
      const laserGlow = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      laserGlow.addColorStop(0, 'transparent');
      laserGlow.addColorStop(1, 'rgba(34, 211, 238, 0.06)');
      ctx.fillStyle = laserGlow;
      ctx.fillRect(0, scanY - 30, width, 30);

      // Update detection boxes coordinates occasionally
      if (tick % 120 === 0) {
        cvTargets.forEach((target) => {
          target.targetX = Math.random() * (width - 120) + 10;
          target.targetY = Math.random() * (height - 110) + 10;
          target.score = +(0.85 + Math.random() * 0.14).toFixed(2);
        });
      }

      // Smooth coordinate movement
      cvTargets.forEach((t) => {
        t.x += (t.targetX - t.x) * 0.05;
        t.y += (t.targetY - t.y) * 0.05;

        // Draw bounding box
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)'; // Emerald green detection box
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        drawRoundRect(ctx, t.x, t.y, t.w, t.h, 4);
        ctx.stroke();

        // Corner tick marks for tech design
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        const offset = 8;
        // Top Left
        ctx.beginPath(); ctx.moveTo(t.x, t.y + offset); ctx.lineTo(t.x, t.y); ctx.lineTo(t.x + offset, t.y); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(t.x + t.w, t.y + offset); ctx.lineTo(t.x + t.w, t.y); ctx.lineTo(t.x + t.w - offset, t.y); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(t.x, t.y + t.h - offset); ctx.lineTo(t.x, t.y + t.h); ctx.lineTo(t.x + offset, t.y + t.h); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(t.x + t.w, t.y + t.h - offset); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.lineTo(t.x + t.w - offset, t.y + t.h); ctx.stroke();

        // Detection Tag
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = 'bold 8px sans-serif';
        const labelText = `${t.label} ${(t.score * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(t.x, t.y - 12, textWidth + 8, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, t.x + 4, t.y - 3);
      });
    };

    // ==========================================
    // 7. ML Prediction: Real-time charts, cluster nodes & regression line
    // ==========================================
    const chartPoints = [];
    for (let i = 0; i < 20; i++) {
      const rx = 30 + Math.random() * (width - 60);
      chartPoints.push({
        x: rx,
        y: height - 40 - (rx * 0.5 + (Math.random() - 0.5) * 45), // Linear trend
        r: Math.random() * 3 + 1.5
      });
    }

    const drawMLPrediction = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw grid axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Y axis
      ctx.moveTo(30, 20); ctx.lineTo(30, height - 30);
      // X axis
      ctx.moveTo(30, height - 30); ctx.lineTo(width - 20, height - 30);
      ctx.stroke();

      // Scatter Points
      ctx.fillStyle = 'rgba(129, 140, 248, 0.5)'; // Indigo points
      chartPoints.forEach((p) => {
        ctx.beginPath();
        const rVal = isNaN(p.r) || p.r < 0.1 ? 0.1 : p.r;
        ctx.arc(p.x, p.y, Math.max(0, rVal), 0, Math.PI * 2);
        ctx.fill();
      });

      // Regression Fitting Line (Pulsing slope representation)
      const x1 = 30;
      const y1 = height - 40 - (x1 * 0.5 + Math.sin(tick * 0.02) * 5);
      const x2 = width - 20;
      const y2 = height - 40 - (x2 * 0.5 + Math.sin(tick * 0.02) * 5);

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)'; // Crimson regression line
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Text status
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`R² = 0.94`, width - 25, 25);
    };

    // ==========================================
    // 8. Smart AI: Neural Network node synapse
    // ==========================================
    const nodesNet = [];
    const numNodes = 18;
    for (let i = 0; i < numNodes; i++) {
      nodesNet.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2.5 + 1.5,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        pulseOffset: Math.random() * 10
      });
    }

    const drawNeuralNet = () => {
      ctx.clearRect(0, 0, width, height);

      // Move & Pulse Nodes
      nodesNet.forEach((n) => {
        n.x += n.vx * (isHoveredRef.current ? 2.5 : 1);
        n.y += n.vy * (isHoveredRef.current ? 2.5 : 1);

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;
      });

      // Render Synapses
      ctx.lineWidth = 0.8;
      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          const n1 = nodesNet[i];
          const n2 = nodesNet[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.16;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // Violet/Purple synapse
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Synapse Signal impulse pulse
            if (tick % 100 === 0 || isHoveredRef.current) {
              const signalProgress = (tick % 60) / 60;
              const sx = n1.x + (n2.x - n1.x) * signalProgress;
              const sy = n1.y + (n2.y - n1.y) * signalProgress;
              ctx.fillStyle = 'rgba(216, 180, 254, 0.4)';
              ctx.beginPath();
              ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw actual Web nodes
      nodesNet.forEach((n) => {
        const pulse = Math.sin(tick * n.pulseSpeed + n.pulseOffset) * 2;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.beginPath();
        const rVal1 = n.size + pulse / 2;
        const safeR1 = isNaN(rVal1) ? 0.1 : Math.max(0.1, rVal1);
        ctx.arc(n.x, n.y, safeR1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.beginPath();
        const rVal2 = (n.size + pulse) * 2.2;
        const safeR2 = isNaN(rVal2) ? 0.1 : Math.max(0.1, rVal2);
        ctx.arc(n.x, n.y, safeR2, 0, Math.PI * 2);
        ctx.stroke();
      });
    };

    // ==========================================
    // 9. AR / VR: Holographic grid, floating cube wireframe, spatial anchors
    // ==========================================
    const arAnchors = [];
    const numAnchors = 6;
    for (let i = 0; i < numAnchors; i++) {
      arAnchors.push({
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        label: ['[AR Anchor]', '[Plane Detected]', '[Object: Table]', '[Depth: 1.2m]', '[Mesh Active]', '[Tracked]'][i % 6],
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.006,
      });
    }

    // Cube vertices (normalized -1 to 1)
    const cubeVerts = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1],
    ];
    const cubeEdges = [
      [0,1],[1,2],[2,3],[3,0], // back face
      [4,5],[5,6],[6,7],[7,4], // front face
      [0,4],[1,5],[2,6],[3,7], // connecting edges
    ];

    const project3D = (x3, y3, z3, rotX, rotY, cx, cy, scale) => {
      // Rotate around Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      let rx = x3 * cosY + z3 * sinY;
      let ry = y3;
      let rz = -x3 * sinY + z3 * cosY;
      // Rotate around X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      let ry2 = ry * cosX - rz * sinX;
      let rz2 = ry * sinX + rz * cosX;
      // Perspective divide
      const fov = 3.5;
      const pz = fov + rz2;
      const px = (rx / pz) * scale + cx;
      const py = (ry2 / pz) * scale + cy;
      return { px, py, alpha: Math.max(0, Math.min(1, (rz2 + 2) / 4)) };
    };

    const drawARVR = () => {
      ctx.clearRect(0, 0, width, height);

      // --- Holographic Ground Grid ---
      const gridColor = 'rgba(0, 220, 255, 0.07)';
      const gridHighlight = 'rgba(0, 220, 255, 0.18)';
      const cols = 10, rows = 8;
      const gx0 = width * 0.05, gx1 = width * 0.95;
      const gy0 = height * 0.55, gy1 = height * 0.95;
      const stepX = (gx1 - gx0) / cols;
      const stepY = (gy1 - gy0) / rows;

      for (let c = 0; c <= cols; c++) {
        const x = gx0 + c * stepX;
        ctx.strokeStyle = c % 5 === 0 ? gridHighlight : gridColor;
        ctx.lineWidth = c % 5 === 0 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(x, gy0);
        ctx.lineTo(x, gy1);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        const y = gy0 + r * stepY;
        ctx.strokeStyle = r === 0 ? gridHighlight : gridColor;
        ctx.lineWidth = r === 0 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(gx0, y);
        ctx.lineTo(gx1, y);
        ctx.stroke();
      }

      // --- Floating 3D Wireframe Cube ---
      const rotY = tick * 0.012;
      const rotX = Math.sin(tick * 0.007) * 0.4 + 0.3;
      const cubeScale = Math.min(width, height) * 0.16;
      const cx = width * 0.5;
      const cy = height * 0.38;

      const projected = cubeVerts.map(([x, y, z]) => project3D(x, y, z, rotX, rotY, cx, cy, cubeScale));

      // Draw edges
      cubeEdges.forEach(([a, b]) => {
        const va = projected[a];
        const vb = projected[b];
        const alpha = (va.alpha + vb.alpha) / 2;
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.75})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(va.px, va.py);
        ctx.lineTo(vb.px, vb.py);
        ctx.stroke();
      });

      // Draw vertices
      projected.forEach(({ px, py, alpha }) => {
        ctx.fillStyle = `rgba(120, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cube glow shadow
      ctx.save();
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.06 + Math.sin(tick * 0.04) * 0.04})`;
      ctx.lineWidth = 12;
      cubeEdges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a].px, projected[a].py);
        ctx.lineTo(projected[b].px, projected[b].py);
        ctx.stroke();
      });
      ctx.restore();

      // --- HMD (Head-Mounted Display) outline in top-left corner ---
      const hx = width * 0.12, hy = height * 0.1;
      const hw = width * 0.2, hh = height * 0.14;
      ctx.save();
      ctx.strokeStyle = `rgba(160, 80, 255, ${0.4 + Math.sin(tick * 0.03) * 0.15})`;
      ctx.lineWidth = 1.5;
      // Visor shape
      ctx.beginPath();
      ctx.moveTo(hx, hy + hh * 0.3);
      ctx.bezierCurveTo(hx, hy, hx + hw, hy, hx + hw, hy + hh * 0.3);
      ctx.lineTo(hx + hw, hy + hh * 0.7);
      ctx.bezierCurveTo(hx + hw, hy + hh, hx, hy + hh, hx, hy + hh * 0.7);
      ctx.closePath();
      ctx.stroke();
      // Left lens
      ctx.beginPath();
      ctx.ellipse(hx + hw * 0.28, hy + hh * 0.5, hw * 0.16, hh * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 120, 255, ${0.5 + Math.sin(tick * 0.04) * 0.2})`;
      ctx.stroke();
      // Right lens
      ctx.beginPath();
      ctx.ellipse(hx + hw * 0.72, hy + hh * 0.5, hw * 0.16, hh * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Label
      ctx.fillStyle = 'rgba(200,160,255,0.5)';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HMD', hx + hw * 0.5, hy + hh + 10);
      ctx.restore();

      // --- Spatial AR Anchors ---
      arAnchors.forEach((a) => {
        const ax = a.x * width;
        const ay = a.y * height * 0.5 + height * 0.05; // keep in top half
        const pulse = Math.sin(tick * a.speed + a.phase) * 4;

        // Cross-hair reticle
        ctx.strokeStyle = `rgba(0, 255, 200, ${0.5 + Math.sin(tick * a.speed + a.phase) * 0.25})`;
        ctx.lineWidth = 1;
        const rs = 8 + pulse;
        ctx.beginPath();
        ctx.moveTo(ax - rs, ay); ctx.lineTo(ax + rs, ay);
        ctx.moveTo(ax, ay - rs); ctx.lineTo(ax, ay + rs);
        ctx.stroke();

        // Outer ring
        ctx.strokeStyle = `rgba(0, 255, 200, 0.2)`;
        ctx.beginPath();
        ctx.arc(ax, ay, rs * 1.6, 0, Math.PI * 2);
        ctx.stroke();

        // Tag label
        if (isHoveredRef.current) {
          ctx.fillStyle = 'rgba(0, 255, 200, 0.7)';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(a.label, ax + rs + 4, ay + 3);
        }
      });

      // --- Scan line overlay ---
      const scanY2 = height > 0 ? (tick * 0.8) % height : 0;
      const scanGrad = ctx.createLinearGradient(0, scanY2 - 20, 0, scanY2 + 4);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(1, 'rgba(0, 220, 255, 0.04)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY2 - 20, width, 24);

      // Lens flare / scatter glint particles
      const numGlints = 5;
      for (let g = 0; g < numGlints; g++) {
        const gAngle = (tick * 0.01 + g * (Math.PI * 2 / numGlints));
        const gDist = 28 + Math.sin(tick * 0.02 + g) * 8;
        const gx = cx + Math.cos(gAngle) * gDist;
        const gy2 = cy + Math.sin(gAngle) * gDist * 0.55;
        ctx.fillStyle = `rgba(180, 255, 255, ${0.15 + Math.sin(tick * 0.03 + g) * 0.1})`;
        ctx.beginPath();
        ctx.arc(gx, gy2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      ctx.fillStyle = `rgba(0, 220, 255, ${0.25 + Math.sin(tick * 0.025) * 0.1})`;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AR/VR SPATIAL SYSTEM', width * 0.5, height - 10);
    };

    // ==========================================
    // FALLBACK: Interactive Particle Grid (if custom title not matched)
    // ==========================================
    const fallbackParticles = [];
    for (let i = 0; i < 20; i++) {
      fallbackParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        color: `rgba(6, 182, 212, ${Math.random() * 0.2 + 0.1})`
      });
    }

    const drawFallback = () => {
      ctx.clearRect(0, 0, width, height);

      // Connected stars
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      fallbackParticles.forEach((p, idx) => {
        fallbackParticles.forEach((p2, idx2) => {
          if (idx !== idx2) {
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 70) {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        });
      });
      ctx.stroke();

      fallbackParticles.forEach((p) => {
        p.x += p.vx * (isHoveredRef.current ? 2.2 : 1);
        p.y += p.vy * (isHoveredRef.current ? 2.2 : 1);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Main animation loop routing
    let lastFrame = 0;
    const FPS_CAP = 30; // Throttle to 30fps max when hovered
    const FRAME_MS = 1000 / FPS_CAP;

    const animate = (timestamp) => {
      // Pausing mid-scroll keeps these canvases from competing with the scroll
      // itself, which is what the old (never-set) window.isScrolling check
      // was meant to do.
      if (isActivelyScrolling()) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Throttle frame rate
      if (timestamp - lastFrame < FRAME_MS) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp;

      tick++;
      triggerSingleDraw();

      // Only keep looping while hovered
      if (isHoveredRef.current) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Draw once on mount/prop-change (static frame)
    triggerSingleDraw();

    // Expose loop control so hover can start/stop it without re-running this
    // whole setup effect (which would rebuild every particle array).
    loopControlRef.current = {
      start: () => {
        if (animationFrameId == null) {
          lastFrame = 0;
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      stop: () => {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      },
    };
    if (isHoveredRef.current) loopControlRef.current.start();

    return () => {
      loopControlRef.current = null;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [title]);

  useEffect(() => {
    const control = loopControlRef.current;
    if (!control) return;
    if (isHovered) control.start();
    else control.stop();
  }, [isHovered]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 bg-[#070913]/30 z-0"
    />
  );
};

export default ProjectMotionGraphic;
