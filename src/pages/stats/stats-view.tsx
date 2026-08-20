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

  useEffect(() => {
    if (!api_base?.api) return;

    setHistory([]);
    setTimeHistory([]);
    setDigits([]);

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
  const oddPct = 100 - evenPct;
  const lastQuote = history.length > 0 ? history[history.length - 1].toFixed(2) : '---';

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 165px)',
        maxHeight: 'calc(100vh - 165px)',
        minHeight: '380px',
        padding: isMobile ? '4px' : '8px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        background: '#090d16',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Centered Main Stats Dashboard Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          height: '100%',
          background: '#0d1117',
          border: '1.5px solid #ff4500',
          borderRadius: '8px',
          boxShadow: '0 0 30px rgba(255, 68, 0, 0.4), inset 0 0 15px rgba(255, 100, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
            <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
              STATS TELEMETRY GRAPH
            </span>
            <span style={{ fontSize: '10px', color: '#ffc266', fontWeight: 800, background: 'rgba(255, 68, 0, 0.25)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255, 100, 0, 0.4)' }}>
              {history.length} TICKS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid #ffaa00',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 800,
                cursor: 'pointer',
                maxWidth: isMobile ? '140px' : 'auto',
                boxShadow: '0 0 10px rgba(255, 170, 0, 0.3)'
              }}
            >
              {ASSET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Toolbar Bar (Digit Stats Bar) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: isMobile ? '4px 8px' : '6px 14px',
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255, 68, 0, 0.2)',
            flexShrink: 0
          }}
        >
          {/* EVEN/ODD and LIVE SPOT Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '10px', fontWeight: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>EVEN: {evenPct}% ({evenCount})</span>
              <span style={{ color: '#ef4444' }}>ODD: {oddPct}% ({oddCount})</span>
            </div>
            <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 900 }}>
              LIVE SPOT: <span style={{ color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '3px', marginLeft: '4px' }}>{lastQuote}</span>
            </div>
          </div>

          {/* 10-Digit Frequency Badges Row */}
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
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    fontWeight: 900,
                    color: isEven ? '#10b981' : '#ef4444',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {d}: {pct}%
                </span>
              );
            })}
          </div>
        </div>

        {/* Rolling Canvas Body Container — strictly bounded */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            background: '#0d1117'
          }}
        >
          <TickCanvasChart history={history} timeHistory={timeHistory} />
        </div>
      </div>
    </div>
  );
}
