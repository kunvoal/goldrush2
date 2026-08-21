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
  const [isMinimized, setIsMinimized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full h-full min-h-0 bg-[#090d16] relative p-1.5 sm:p-3 font-mono select-none overflow-hidden flex flex-col justify-center items-stretch box-border">
      {/* Strict Parametric Container — 100% bounded with Zero Overflow */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1140px',
          height: '100%',
          maxHeight: isMinimized ? '44px' : '100%',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1.5px solid rgba(255, 69, 0, 0.45)',
          borderRadius: '8px',
          boxShadow: '0 0 25px rgba(255, 69, 0, 0.25), inset 0 0 15px rgba(255, 120, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-height 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '6px 10px' : '8px 14px',
            background: 'linear-gradient(90deg, #1c0200 0%, #3d0800 50%, #1c0200 100%)',
            borderBottom: '1.5px solid rgba(255, 68, 0, 0.35)',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.6px' }}>
              STATS TELEMETRY GRAPH
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid rgba(255, 69, 0, 0.4)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: 700,
                cursor: 'pointer',
                maxWidth: isMobile ? '140px' : 'auto',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}
            >
              {ASSET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 900
              }}
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '🗖' : '─'}
            </button>
          </div>
        </div>

        {/* Sub-Toolbar Bar (Live Digit Stats & Frequency Badges) */}
        {!isMinimized && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: isMobile ? '4px 8px' : '5px 14px',
              background: 'rgba(15, 23, 42, 0.98)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
              zIndex: 5
            }}
          >
            {/* EVEN/ODD and LIVE SPOT Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '10px', fontWeight: 900 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#10b981' }}>EVEN: {evenPct}% ({evenCount})</span>
                <span style={{ color: '#ef4444' }}>ODD: {oddPct}% ({oddCount})</span>
              </div>
              <div style={{ color: '#10b981', fontSize: '10px', fontWeight: 900 }}>
                LIVE SPOT: <span style={{ color: '#ffffff' }}>{lastQuote}</span>
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
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '3px',
                      padding: '1px 6px',
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

        {/* Rolling Canvas Body Container — strictly constrained */}
        {!isMinimized && (
          <div
            style={{
              flex: 1,
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              background: '#020204'
            }}
          >
            <TickCanvasChart history={history} timeHistory={timeHistory} />
          </div>
        )}
      </div>
    </div>
  );
}

