import React, { useState, useEffect, useRef } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { TickCanvasChart } from '@/components/tick-canvas-chart/tick-canvas-chart';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';

const ASSET_OPTIONS = [
  { value: '1HZ10V', label: 'Volatility 10 (1s)' },
  { value: '1HZ25V', label: 'Volatility 25 (1s)' },
  { value: '1HZ50V', label: 'Volatility 50 (1s)' },
  { value: '1HZ75V', label: 'Volatility 75 (1s)' },
  { value: '1HZ100V', label: 'Volatility 100 (1s)' },
  { value: 'R_10', label: 'Volatility 10' },
  { value: 'R_25', label: 'Volatility 25' },
  { value: 'R_50', label: 'Volatility 50' },
  { value: 'R_75', label: 'Volatility 75' },
  { value: 'R_100', label: 'Volatility 100' },
];

export default function StatsView() {
  const { chart_store } = useStore();
  const { isDesktop } = useDevice();
  const isMobile = !isDesktop;

  const [selectedAsset, setSelectedAsset] = useState<string>(chart_store?.symbol || '1HZ100V');
  const [history, setHistory] = useState<number[]>([]);
  const [timeHistory, setTimeHistory] = useState<number[]>([]);
  const [digits, setDigits] = useState<number[]>([]);

  // Draggable positioning state matching DraggableChartOverlay
  const defaultX = Math.max(10, Math.min(window.innerWidth - 870, (window.innerWidth - 860) / 2));
  const [position, setPosition] = useState({ x: defaultX, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Responsive screen size listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 880) {
        setPosition({ x: 0, y: 0 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable drag position offset on mobile full-screen
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMobile) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 860, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 450, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMobile]);

  useEffect(() => {
    if (!api_base?.api) return;

    let sub: any = null;

    try {
      api_base.api.send({
        ticks_history: selectedAsset,
        count: 1000,
        end: 'latest',
        style: 'ticks',
        subscribe: 1,
      });
    } catch (e) {
      console.warn('StatsView WS request failed:', e);
    }

    sub = api_base.api.onMessage()?.subscribe(({ data }: any) => {
      if (data?.msg_type === 'history' && data?.history) {
        const prices: number[] = data.history.prices || [];
        const times: number[] = data.history.times || [];

        setHistory(prices);
        setTimeHistory(times.map(t => t * 1000));
        setDigits(prices.map(p => parseInt(p.toFixed(2).slice(-1), 10)));
      }

      if (data?.msg_type === 'tick' && data?.tick && data.tick.symbol === selectedAsset) {
        const quote = Number(data.tick.quote);
        const epoch = (data.tick.epoch || Date.now() / 1000) * 1000;
        const d = parseInt(quote.toFixed(2).slice(-1), 10);

        setHistory(prev => [...prev.slice(-999), quote]);
        setTimeHistory(prev => [...prev.slice(-999), epoch]);
        setDigits(prev => [...prev.slice(-999), d]);
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, [selectedAsset]);

  // Compute digit frequencies for stats bar
  const digitCounts = Array(10).fill(0);
  digits.forEach(d => {
    if (d >= 0 && d <= 9) digitCounts[d]++;
  });

  const totalDigits = digits.length || 1;
  const evenCount = digitCounts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const oddCount = totalDigits - evenCount;
  const evenPct = Math.round((evenCount / totalDigits) * 100);
  const oddPct = Math.round((oddCount / totalDigits) * 100);
  const lastQuote = history.length > 0 ? history[history.length - 1].toFixed(2) : '---';

  return (
    <div className="w-full h-[calc(100vh-110px)] min-h-[500px] bg-[#090d16] relative p-0 sm:p-4 font-mono select-none overflow-hidden flex justify-center">
      {/* Responsive Container — Adaptable for Mobile & Desktop */}
      <div
        ref={overlayRef}
        style={{
          position: isMobile ? 'relative' : 'absolute',
          left: isMobile ? 0 : `${position.x}px`,
          top: isMobile ? 0 : `${position.y}px`,
          width: isMobile ? '100%' : '860px',
          height: isMinimized ? '44px' : isMobile ? '100%' : '500px',
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '520px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: isMobile ? '0px' : '8px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.2s ease'
        }}
      >
        {/* Header Drag Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="drag-handle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '6px 10px' : '8px 12px',
            background: 'rgba(30, 41, 59, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: isMobile ? 'default' : 'move',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
              STATS GRAPH
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onMouseDown={e => e.stopPropagation()}>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: 700,
                cursor: 'pointer',
                maxWidth: isMobile ? '130px' : 'auto'
              }}
            >
              {ASSET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {!isMobile && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 900
                }}
              >
                {isMinimized ? '□' : '_'}
              </button>
            )}
          </div>
        </div>

        {/* Sub-Toolbar Bar (Mobile Responsive Digit Stats Bar) */}
        {!isMinimized && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: isMobile ? '4px 8px' : '4px 12px',
              background: 'rgba(15, 23, 42, 0.98)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 45
            }}
          >
            {/* EVEN/ODD and LIVE SPOT Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '10px', fontWeight: 900 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#10b981' }}>EVEN: {evenPct}% ({evenCount})</span>
                <span style={{ color: '#ef4444' }}>ODD: {oddPct}% ({oddCount})</span>
              </div>
              <div style={{ color: '#10b981', fontSize: '10px', fontWeight: 900 }}>
                SPOT: <span style={{ color: '#ffffff' }}>{lastQuote}</span>
              </div>
            </div>

            {/* Scrollable 10-Digit Frequency Badges Row */}
            <div 
              className="no-scrollbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                overflowX: 'auto',
                width: '100%',
                paddingBottom: '2px'
              }}
            >
              {digitCounts.map((count, d) => {
                const pct = Math.round((count / totalDigits) * 100);
                const isEven = d % 2 === 0;
                return (
                  <span
                    key={d}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                      padding: '1px 5px',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: isEven ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {d}:{pct}%
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Rolling Canvas Body Container */}
        {!isMinimized && (
          <div
            style={{
              flex: 1,
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              background: '#0f172a'
            }}
          >
            <TickCanvasChart history={history} timeHistory={timeHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
