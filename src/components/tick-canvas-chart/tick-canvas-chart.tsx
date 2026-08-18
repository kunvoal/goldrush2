'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface StreakRun {
  startTime: number;
  endTime: number;
  length: number;
  direction: number; // 1 = up, -1 = down
}

export interface TickCanvasChartProps {
  /** Price history array */
  history: number[];
  /** Timestamp history (parallel to history) */
  timeHistory: number[];
  /** Currently selected tick duration (3, 4, or 5) */
  selectedDuration?: number;
  /** Streak run events for overlay rendering */
  streakRuns?: StreakRun[];
  /** Pip size for price formatting */
  pipSize?: number;
  /** Epoch timestamps of ticks that are part of winning prediction runs */
  winningTicks?: number[];
}

export function TickCanvasChart({
  history,
  timeHistory,
  selectedDuration = 5,
  streakRuns = [],
  pipSize = 2,
  winningTicks,
}: TickCanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1.0);
  const offsetRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // Round winning tick timestamps to nearest second for reliable matching
  const winningTicksSet = React.useMemo(() => {
    const s = new Set<number>();
    (winningTicks || []).forEach(t => s.add(Math.round(t / 1000)));
    return s;
  }, [winningTicks]);

  const [timeframe, setTimeframe] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  const handleResetView = () => {
    zoomRef.current = 1.0;
    offsetRef.current = 0;
    redraw();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, W, H);

    // Dark sleek background
    ctx.fillStyle = '#020204';
    ctx.fillRect(0, 0, W, H);

    // Logical dimensions
    const lW = W / dpr;
    const lH = H / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    if (history.length < 2) {
      ctx.fillStyle = '#444b55';
      ctx.font = '11px monospace';
      ctx.fillText('Waiting for tick data stream...', 20, lH / 2);
      ctx.restore();
      return;
    }

    let quotes = history;
    let times = timeHistory;

    if (timeHistory.length > 1 && timeframe !== 'all') {
      const latestTime = timeHistory[timeHistory.length - 1];
      const earliestTime = timeHistory[0];
      const totalSpanMs = latestTime - earliestTime;

      let limitMs = 420000;
      if (timeframe === '1m') limitMs = 60000;
      else if (timeframe === '2m') limitMs = 120000;
      else if (timeframe === '5m') limitMs = 300000;
      else if (timeframe === '7m') limitMs = 420000;
      else if (timeframe === '10m') limitMs = 600000;
      else if (timeframe === '13m') limitMs = 780000;

      if (totalSpanMs > limitMs) {
        const cutoff = latestTime - limitMs;
        const startIndex = timeHistory.findIndex(t => t >= cutoff);
        if (startIndex !== -1) {
          quotes = history.slice(startIndex);
          times = timeHistory.slice(startIndex);
        }
      }
    }

    const len = quotes.length;

    // Calculate Min & Max Price with a generous 15% Vertical Padding Buffer
    const rawMinQ = Math.min(...quotes);
    const rawMaxQ = Math.max(...quotes);
    const deltaQ = (rawMaxQ - rawMinQ) || 0.01;
    const padQ = deltaQ * 0.15; // 15% safety buffer top & bottom

    const minQ = rawMinQ - padQ;
    const maxQ = rawMaxQ + padQ;
    const rangeQ = maxQ - minQ;

    let minT = times[0];
    let rangeT = (times[len - 1] - times[0]) || 1;

    if (timeHistory.length > 1 && timeframe !== 'all') {
      const latestTime = timeHistory[timeHistory.length - 1];
      const earliestTime = timeHistory[0];
      const totalSpanMs = latestTime - earliestTime;

      let limitMs = 420000;
      if (timeframe === '1m') limitMs = 60000;
      else if (timeframe === '2m') limitMs = 120000;
      else if (timeframe === '5m') limitMs = 300000;
      else if (timeframe === '7m') limitMs = 420000;
      else if (timeframe === '10m') limitMs = 600000;
      else if (timeframe === '13m') limitMs = 780000;

      if (totalSpanMs <= limitMs) {
        minT = earliestTime;
        rangeT = limitMs;
      } else {
        minT = latestTime - limitMs;
        rangeT = limitMs;
      }
    }

    // Adapt Padding Margins for Mobile Screens
    const isMobile = lW < 500;
    const padLeft = isMobile ? 48 : 65;   // Y-axis price labels
    const padRight = isMobile ? 58 : 75;  // Latest price tag badge & right padding
    const padTop = 22;                    // Top price level margin
    const padBottom = isMobile ? 38 : 46; // Bottom X-axis timeline margin

    const usableW = Math.max(10, lW - padLeft - padRight);
    const usableH = Math.max(10, lH - padTop - padBottom);

    const zoom = zoomRef.current;
    const offset = offsetRef.current;

    const getX = (t: number) => padLeft + ((t - minT) / rangeT) * usableW * zoom + offset;
    const getY = (q: number) => padTop + usableH - ((q - minQ) / rangeQ) * usableH;

    // Draw Grid Lines & Y-Axis Scale
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = isMobile ? '8px monospace' : '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const numYGrid = 5;
    for (let i = 0; i < numYGrid; i++) {
      const ratio = i / (numYGrid - 1);
      const y = padTop + ratio * usableH;
      const val = maxQ - ratio * rangeQ;

      // Horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + usableW, y);
      ctx.stroke();

      // Y-axis price label on the left
      ctx.fillText(val.toFixed(pipSize), padLeft - 4, y);
    }

    // Y-Axis Vertical Line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop - 5);
    ctx.lineTo(padLeft, padTop + usableH);
    ctx.stroke();

    // X-Axis Horizontal Line
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + usableH);
    ctx.lineTo(padLeft + usableW + 5, padTop + usableH);
    ctx.stroke();

    // Draw X-Axis Time Ticks along the bottom
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#64748b';
    const numXTicks = isMobile ? 3 : 5;
    for (let i = 0; i < numXTicks; i++) {
      const ratio = i / (numXTicks - 1);
      const tVal = minT + ratio * rangeT;
      const x = padLeft + ratio * usableW;

      const dateObj = new Date(tVal);
      const timeStr = dateObj.toTimeString().slice(0, 8);

      ctx.beginPath();
      ctx.moveTo(x, padTop + usableH);
      ctx.lineTo(x, padTop + usableH + 4);
      ctx.stroke();

      ctx.fillText(timeStr, x, padTop + usableH + 4);
    }

    // Clean Streak Run Overlay
    if (timeframe !== 'all' || len <= 120) {
      const activeRuns: StreakRun[] = [];
      if (quotes.length >= 2) {
        let currentStreak = 1;
        let lastDir = 0;
        for (let i = 1; i < quotes.length; i++) {
          const delta = quotes[i] - quotes[i - 1];
          const dir = delta > 0 ? 1 : delta < 0 ? -1 : 0;
          if (dir !== 0 && dir === lastDir) {
            currentStreak++;
            if (currentStreak === selectedDuration) {
              const run = {
                startTime: times[i - (selectedDuration - 1)],
                endTime: times[i],
                length: selectedDuration,
                direction: dir
              };
              
              let include = true;
              if (directionFilter === 'up' && dir !== 1) include = false;
              if (directionFilter === 'down' && dir !== -1) include = false;
              
              if (include) {
                activeRuns.push(run);
              }
            }
          } else {
            lastDir = dir;
            currentStreak = 1;
          }
        }
      }

      for (let i = 0; i < activeRuns.length; i++) {
        const run = activeRuns[i];
        const xStart = getX(run.startTime);
        const xEnd = getX(run.endTime);

        if (xEnd >= padLeft && xStart <= padLeft + usableW) {
          ctx.fillStyle = run.direction === 1
            ? 'rgba(0, 230, 153, 0.08)'
            : 'rgba(255, 51, 85, 0.08)';
          ctx.fillRect(xStart, padTop, Math.max(xEnd - xStart, 2), usableH);

          ctx.strokeStyle = run.direction === 1
            ? 'rgba(0, 230, 153, 0.25)'
            : 'rgba(255, 51, 85, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(xStart, padTop); ctx.lineTo(xStart, padTop + usableH);
          ctx.moveTo(xEnd, padTop); ctx.lineTo(xEnd, padTop + usableH);
          ctx.stroke();
        }
      }
    }

    // Price line segments — white base layer
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    for (let i = 0; i < len; i++) {
      const px = getX(times[i]);
      const py = getY(quotes[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Gold overlay for winning segments
    for (let i = 1; i < len; i++) {
      const s1 = Math.round(times[i - 1] / 1000);
      const s2 = Math.round(times[i] / 1000);
      const isGold =
        winningTicksSet.has(s1) || winningTicksSet.has(s1 - 1) || winningTicksSet.has(s1 + 1) ||
        winningTicksSet.has(s2) || winningTicksSet.has(s2 - 1) || winningTicksSet.has(s2 + 1);
      if (isGold) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.8;
        ctx.lineJoin = 'round';
        ctx.moveTo(getX(times[i - 1]), getY(quotes[i - 1]));
        ctx.lineTo(getX(times[i]), getY(quotes[i]));
        ctx.stroke();
      }
    }

    // Smart Digit Circle Density Filter
    let lastDrawnX = -999;
    const minCircleSpacing = isMobile ? 16 : 14;
    const maxVisibleCircles = isMobile ? 35 : 60;
    const startIndex = (timeframe === 'all' && len > maxVisibleCircles) ? len - maxVisibleCircles : 0;

    for (let i = startIndex; i < len; i++) {
      const px = getX(times[i]);
      const py = getY(quotes[i]);

      if (px >= padLeft - 10 && px <= padLeft + usableW + 10) {
        if (px - lastDrawnX >= minCircleSpacing || i === len - 1) {
          lastDrawnX = px;

          const qStr = quotes[i].toFixed(pipSize);
          const lastDigit = parseInt(qStr.slice(-1), 10);
          const isEven = lastDigit % 2 === 0;

          const circleRadius = isMobile ? 6.5 : 7.5;
          ctx.beginPath();
          ctx.arc(px, py, circleRadius, 0, Math.PI * 2);
          ctx.fillStyle = isEven ? '#10b981' : '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = isMobile ? 'bold 7.5px sans-serif' : 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(lastDigit), px, py);
          ctx.textBaseline = 'alphabetic';
          ctx.textAlign = 'left';
        }
      }
    }

    // Latest price dot, dashed guide line, & right price tag badge
    if (len > 0) {
      const lastX = getX(times[len - 1]);
      const lastY = getY(quotes[len - 1]);
      const prevQ = len >= 2 ? quotes[len - 2] : quotes[len - 1];
      const isUp = quotes[len - 1] >= prevQ;
      const activeColor = isUp ? '#00e699' : '#ff3355';

      // Pulsing current price dot
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();

      // Horizontal dashed guide line
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(padLeft + usableW + 4, lastY);
      ctx.stroke();
      ctx.restore();

      // Price Tag Badge on Right Margin
      const tagText = quotes[len - 1].toFixed(pipSize);
      ctx.font = isMobile ? 'bold 9px monospace' : 'bold 10px monospace';
      const tw = ctx.measureText(tagText).width;
      const tagW = tw + (isMobile ? 6 : 10);
      const tagH = isMobile ? 16 : 18;
      const tagX = padLeft + usableW + 4;
      const tagY = lastY - tagH / 2;

      ctx.fillStyle = activeColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tagX, tagY, tagW, tagH, 3);
      else ctx.rect(tagX, tagY, tagW, tagH);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = isMobile ? 'bold 9px monospace' : 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, tagX + tagW / 2, lastY);
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }, [history, timeHistory, selectedDuration, streakRuns, pipSize, timeframe, directionFilter, winningTicksSet]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = wrapper.clientWidth * dpr;
      canvas.height = wrapper.clientHeight * dpr;
      canvas.style.width = `${wrapper.clientWidth}px`;
      canvas.style.height = `${wrapper.clientHeight}px`;
      redraw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    resize();

    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  // Touch & Mouse Events for Mobile Phone Support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStartX.current = e.clientX - offsetRef.current;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        offsetRef.current = e.clientX - dragStartX.current;
        redraw();
      }
    };

    const handleMouseUp = () => { isDragging.current = false; };

    // Mobile Touch Events
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        dragStartX.current = e.touches[0].clientX - offsetRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length === 1) {
        offsetRef.current = e.touches[0].clientX - dragStartX.current;
        redraw();
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      zoomRef.current = Math.max(0.2, Math.min(zoomRef.current * factor, 15.0));
      redraw();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [redraw]);

  return (
    <div className="w-full h-full relative bg-[#020204]">
      <div ref={wrapperRef} className="w-full h-full relative min-h-0" style={{ cursor: 'crosshair' }}>
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      </div>

      {/* Responsive Floating Control Strip overlay at bottom */}
      <div className="absolute bottom-1 left-0 right-0 px-2 sm:px-4 flex items-center justify-between text-[9px] select-none pointer-events-auto bg-transparent z-10 gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 bg-[#020204]/90 backdrop-blur-md border border-white/10 rounded px-1.5 py-0.5 shadow-lg shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-[#38bdf8] font-bold uppercase text-[8px] mr-0.5">Range:</span>
          {['all', '1m', '2m', '5m', '7m', '10m', '13m'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-1 py-0.5 font-bold rounded uppercase transition ${timeframe === tf ? 'bg-[#38bdf8] text-black font-extrabold' : 'text-[#c9ced6] hover:bg-white/10'}`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleResetView}
            className="bg-[#020204]/90 hover:bg-white/10 text-[#facc15] font-bold border border-[#facc15]/30 rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] uppercase transition shadow-lg shrink-0"
          >
            Auto-Fit
          </button>

          <div className="flex items-center gap-1 bg-[#020204]/90 backdrop-blur-md border border-white/10 rounded px-1 py-0.5 shadow-lg shrink-0">
            <button
              onClick={() => setDirectionFilter(directionFilter === 'up' ? 'all' : 'up')}
              className={`w-4 h-4 font-bold rounded flex items-center justify-center transition ${directionFilter === 'up' ? 'bg-[#00e699] text-[#000]' : 'text-[#00e699]/60 hover:bg-white/10'}`}
            >
              ▲
            </button>
            <button
              onClick={() => setDirectionFilter(directionFilter === 'down' ? 'all' : 'down')}
              className={`w-4 h-4 font-bold rounded flex items-center justify-center transition ${directionFilter === 'down' ? 'bg-[#ff3355] text-[#fff]' : 'text-[#ff3355]/60 hover:bg-white/10'}`}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
