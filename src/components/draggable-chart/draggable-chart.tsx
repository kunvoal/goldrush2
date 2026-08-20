import React, { useState, useRef, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import ChartWrapper from '../../pages/chart/chart-wrapper';
import { useStore } from '@/hooks/useStore';
import { api_base } from '@/external/bot-skeleton';

interface DraggableChartProps {
    isOpen: boolean;
    onClose: () => void;
}

type THudMode = 'updown' | 'evenodd' | 'matches' | 'overunder';
type TRangeOption = '1m' | '2m' | '3m' | '5m' | '7m';
type TStrideOption = 2 | 3 | 4 | 5;
type TOverUnderType = 'OVER' | 'UNDER';

interface ITickData {
    quote: number;
    digit: number;
    time: number;
    diff: number;
}

interface IChartPoint extends ITickData {
    x: number;
    y: number;
    isCrest: boolean;
    isTrough: boolean;
    isInflection: boolean;
    index: number;
}

export const DraggableChartOverlay: React.FC<DraggableChartProps> = observer(({ isOpen, onClose }) => {
    const { chart_store } = useStore();
    const [position, setPosition] = useState({ x: Math.max(10, window.innerWidth - 890), y: 65 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);

    // Goldrush Telemetry Control States
    const [hudMode, setHudMode] = useState<THudMode>('updown');
    const [selectedRange, setSelectedRange] = useState<TRangeOption>('3m');
    const [selectedStride, setSelectedStride] = useState<TStrideOption>(5);

    // Sub-Filter States
    const [parityFilter, setParityFilter] = useState<'ALL' | 'EVEN' | 'ODD'>('ALL');
    const [matchesDigit, setMatchesDigit] = useState<number>(2);
    const [overUnderType, setOverUnderType] = useState<TOverUnderType>('UNDER');
    const [overUnderThreshold, setOverUnderThreshold] = useState<number>(3);

    // Live Tick History Buffer
    const [ticks, setTicks] = useState<ITickData[]>([]);
    const [containerSize, setContainerSize] = useState({ width: 860, height: 460 });

    const overlayRef = useRef<HTMLDivElement>(null);
    const chartCanvasRef = useRef<HTMLDivElement>(null);

    // Measure chart area dimensions
    useEffect(() => {
        if (!chartCanvasRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 50 && height > 50) {
                    setContainerSize({ width, height });
                }
            }
        });
        observer.observe(chartCanvasRef.current);
        return () => observer.disconnect();
    }, [isOpen, isMinimized]);

    // WebSocket Historical & Live Tick Stream (tracks active symbol from SmartChart)
    useEffect(() => {
        if (!isOpen) return;

        const activeSymbol = chart_store.symbol || '1HZ100V';

        // Fetch full tick history & subscribe live
        if (api_base?.api) {
            try {
                api_base.api.send({
                    ticks_history: activeSymbol,
                    count: 60,
                    end: 'latest',
                    style: 'ticks',
                    subscribe: 1
                });
            } catch (e) {
                console.warn('Deriv WS ticks_history request failed:', e);
            }
        }

        const subscription = api_base?.api?.onMessage()?.subscribe(({ data }: any) => {
            // Handle initial full tick history payload
            if (data?.msg_type === 'history' && data?.history) {
                const prices: number[] = data.history.prices || [];
                const times: number[] = data.history.times || [];

                const historyTicks: ITickData[] = prices.map((price, i) => {
                    const realQuote = Number(price);
                    const quoteStr = realQuote.toFixed(2);
                    const lastDigit = parseInt(quoteStr.slice(-1), 10);
                    const prevP = i > 0 ? Number(prices[i - 1]) : realQuote;

                    return {
                        quote: realQuote,
                        digit: lastDigit,
                        time: (times[i] || Date.now() / 1000) * 1000,
                        diff: Number((realQuote - prevP).toFixed(2))
                    };
                });

                setTicks(historyTicks);
            }

            // Handle live tick stream updates
            if (data?.msg_type === 'tick' && data?.tick) {
                const realQuote = Number(data.tick.quote);
                const quoteStr = realQuote.toFixed(2);
                const lastDigit = parseInt(quoteStr.slice(-1), 10);
                const tickTime = (data.tick.epoch || Date.now() / 1000) * 1000;

                setTicks(prev => {
                    if (prev.length > 0 && prev[prev.length - 1].time === tickTime) {
                        return prev;
                    }
                    const prevQuote = prev.length > 0 ? prev[prev.length - 1].quote : realQuote;
                    const diff = Number((realQuote - prevQuote).toFixed(2));

                    return [...prev.slice(-59), {
                        quote: realQuote,
                        digit: lastDigit,
                        time: tickTime,
                        diff
                    }];
                });
            }
        });

        return () => {
            try {
                subscription?.unsubscribe?.();
            } catch (e) {
                // ignore
            }
        };
    }, [isOpen, chart_store.symbol]);

    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.max(10, Math.min(prev.x, Math.max(10, window.innerWidth - 860))),
                y: Math.max(10, Math.min(prev.y, Math.max(10, window.innerHeight - 450)))
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-chart-control')) {
            return;
        }
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const newX = Math.max(10, Math.min(e.clientX - dragOffset.x, window.innerWidth - 300));
        const newY = Math.max(10, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Active Ticks slice based on Range
    const tickCountMap: Record<TRangeOption, number> = {
        '1m': 28,
        '2m': 36,
        '3m': 46,
        '5m': 54,
        '7m': 60
    };
    const maxVisibleTicks = tickCountMap[selectedRange] || 46;
    const visibleTicks = useMemo(() => {
        return ticks.slice(-maxVisibleTicks);
    }, [ticks, maxVisibleTicks]);

    // Compute Chart Geometry & Crest/Trough Points aligned to SmartChart canvas
    const chartGeometry = useMemo(() => {
        if (visibleTicks.length < 2) {
            return { points: [] };
        }

        const paddingLeft = 85;
        const paddingRight = 65;
        const paddingTop = 60;
        const paddingBottom = 40;

        const plotWidth = Math.max(100, containerSize.width - paddingLeft - paddingRight);
        const plotHeight = Math.max(100, containerSize.height - paddingTop - paddingBottom);

        const prices = visibleTicks.map(t => t.quote);
        let minPrice = Math.min(...prices);
        let maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) {
            minPrice -= 0.5;
            maxPrice += 0.5;
        }
        const priceRange = maxPrice - minPrice;

        // Map each tick to (x, y) coordinates
        const rawPoints = visibleTicks.map((t, i) => {
            const x = paddingLeft + (i / (visibleTicks.length - 1)) * plotWidth;
            const y = paddingTop + (1 - (t.quote - minPrice) / priceRange) * plotHeight;
            return { ...t, x, y, index: i };
        });

        // Detect Crests (Peaks) & Troughs (Valleys)
        const points: IChartPoint[] = rawPoints.map((p, i) => {
            const prevP = i > 0 ? rawPoints[i - 1].quote : p.quote;
            const nextP = i < rawPoints.length - 1 ? rawPoints[i + 1].quote : p.quote;

            // Peak / Crest: strictly higher than either or equal to both while being local max
            const isCrest = (p.quote >= prevP && p.quote >= nextP) && (p.quote > prevP || p.quote > nextP);
            // Valley / Trough: strictly lower than either or equal to both while being local min
            const isTrough = (p.quote <= prevP && p.quote <= nextP) && (p.quote < prevP || p.quote < nextP);

            // Boundary inflections
            const isBoundaryCrest = (i === 0 && p.quote > nextP) || (i === rawPoints.length - 1 && p.quote > prevP);
            const isBoundaryTrough = (i === 0 && p.quote < nextP) || (i === rawPoints.length - 1 && p.quote < prevP);

            // Intermediate step run points if stride matches
            const isInflection = !isCrest && !isTrough && (i % selectedStride === 0);

            return {
                ...p,
                isCrest: isCrest || isBoundaryCrest,
                isTrough: isTrough || isBoundaryTrough,
                isInflection
            };
        });

        return { points };
    }, [visibleTicks, containerSize, selectedStride]);

    if (!isOpen) return null;

    // Real-Time Parity Stats
    const evenCount = ticks.filter(t => t.digit % 2 === 0).length;
    const totalCount = ticks.length || 1;
    const evenPct = Math.round((evenCount / totalCount) * 100);
    const oddPct = 100 - evenPct;
    const lastTick = ticks.length > 0 ? ticks[ticks.length - 1] : { quote: 669.54, digit: 4, diff: -0.09 };

    const isMobileWindow = typeof window !== 'undefined' && window.innerWidth < 880;

    return (
        <div
            ref={overlayRef}
            className="draggable-chart-overlay led-snake-card-loaded"
            style={{
                position: 'fixed',
                left: isMobileWindow ? '0px' : `${position.x}px`,
                top: isMobileWindow ? '55px' : `${position.y}px`,
                width: isMobileWindow ? '100vw' : isMinimized ? '320px' : '860px',
                maxWidth: '100%',
                height: isMobileWindow ? (isMinimized ? '44px' : 'calc(100vh - 65px)') : isMinimized ? '44px' : '540px',
                zIndex: 99999,
                background: '#0d1117',
                backdropFilter: 'blur(16px)',
                border: isMobileWindow ? 'none' : '2px solid #ff4500',
                borderRadius: isMobileWindow ? '0px' : '10px',
                boxShadow: '0 0 35px rgba(255, 68, 0, 0.5), inset 0 0 15px rgba(255, 120, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: isDragging ? 'none' : 'height 0.2s ease, width 0.2s ease',
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box'
            }}
        >
            {/* Drag Header Bar */}
            <div
                onMouseDown={handleMouseDown}
                className="led-snake-nav-flow"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    borderBottom: isMinimized ? 'none' : '1.5px solid rgba(255, 68, 0, 0.35)',
                    background: 'linear-gradient(90deg, #1c0200 0%, #3d0800 50%, #1c0200 100%)',
                    gap: '10px'
                }}
            >
                {/* Drag handle icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ cursor: 'grab', fontSize: '15px', color: '#ffaa00' }}>⣿</span>
                </div>

                {/* Telemetry Control Toolbar */}
                {!isMinimized && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                        {/* HUD Mode Button Group */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255, 68, 0, 0.3)' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', paddingRight: '2px' }}>HUD:</span>
                            {(['updown', 'evenodd', 'matches', 'overunder'] as THudMode[]).map(mode => (
                                <button
                                    key={mode}
                                    className="draggable-chart-control"
                                    onClick={() => setHudMode(mode)}
                                    style={{
                                        background: hudMode === mode ? 'linear-gradient(180deg, #ff1a00 0%, #ff7700 100%)' : 'transparent',
                                        color: hudMode === mode ? '#ffffff' : '#ffc266',
                                        border: hudMode === mode ? '1px solid #ffcc00' : 'none',
                                        padding: '2px 7px',
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        boxShadow: hudMode === mode ? '0 0 10px rgba(255, 100, 0, 0.9)' : 'none'
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Range & Stride Selectors (Active on UPDOWN) */}
                        {hudMode === 'updown' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', paddingRight: '2px' }}>RANGE:</span>
                                    {(['1m', '2m', '3m', '5m', '7m'] as TRangeOption[]).map(rng => (
                                        <button
                                            key={rng}
                                            className="draggable-chart-control"
                                            onClick={() => setSelectedRange(rng)}
                                            style={{
                                                background: selectedRange === rng ? '#f59e0b' : 'transparent',
                                                color: selectedRange === rng ? '#000000' : '#ffffff',
                                                border: 'none',
                                                padding: '1px 5px',
                                                fontSize: '9px',
                                                fontWeight: 900,
                                                borderRadius: '2px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {rng}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', paddingRight: '2px' }}>TICKS:</span>
                                    {([2, 3, 4, 5] as TStrideOption[]).map(t => (
                                        <button
                                            key={t}
                                            className="draggable-chart-control"
                                            onClick={() => setSelectedStride(t)}
                                            style={{
                                                background: selectedStride === t ? '#10b981' : 'transparent',
                                                color: selectedStride === t ? '#000000' : '#ffffff',
                                                border: 'none',
                                                padding: '1px 5px',
                                                fontSize: '9px',
                                                fontWeight: 900,
                                                borderRadius: '2px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Window Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                        className="draggable-chart-control"
                        onClick={() => {
                            setIsMinimized(!isMinimized);
                            setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
                        }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: 900
                        }}
                        title={isMinimized ? 'Expand' : 'Minimize'}
                    >
                        {isMinimized ? '🗖' : '─'}
                    </button>
                    <button
                        className="draggable-chart-control"
                        onClick={onClose}
                        style={{
                            background: 'rgba(239, 68, 68, 0.65)',
                            border: '1px solid #ef4444',
                            color: '#ffffff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: 900
                        }}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Sub-Toolbar Bar (HUD Filters) */}
            {!isMinimized && (hudMode === 'evenodd' || hudMode === 'matches' || hudMode === 'overunder') && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 12px',
                        background: 'rgba(15, 23, 42, 0.98)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 45
                    }}
                >
                    {/* EVENODD Parity Filter */}
                    {hudMode === 'evenodd' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#06b6d4' }}>PARITY:</span>
                            {(['ALL', 'EVEN', 'ODD'] as const).map(f => (
                                <button
                                    key={f}
                                    className="draggable-chart-control"
                                    onClick={() => setParityFilter(f)}
                                    style={{
                                        background: parityFilter === f ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                                        color: parityFilter === f ? '#000000' : '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '3px',
                                        padding: '1px 6px',
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* MATCHES Digit Selector */}
                    {hudMode === 'matches' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#f59e0b' }}>MATCH DIGIT:</span>
                            {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(d => (
                                <button
                                    key={d}
                                    className="draggable-chart-control"
                                    onClick={() => setMatchesDigit(d)}
                                    style={{
                                        background: matchesDigit === d ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                                        color: matchesDigit === d ? '#000000' : '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '3px',
                                        padding: '1px 5px',
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* OVERUNDER Controls */}
                    {hudMode === 'overunder' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.5)', padding: '2px', borderRadius: '4px' }}>
                                {(['OVER', 'UNDER'] as TOverUnderType[]).map(type => (
                                    <button
                                        key={type}
                                        className="draggable-chart-control"
                                        onClick={() => setOverUnderType(type)}
                                        style={{
                                            background: overUnderType === type ? (type === 'OVER' ? '#10b981' : '#ef4444') : 'transparent',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '1px 6px',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            borderRadius: '2px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>THRESHOLD:</span>
                            {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(d => (
                                <button
                                    key={d}
                                    className="draggable-chart-control"
                                    onClick={() => setOverUnderThreshold(d)}
                                    style={{
                                        background: overUnderThreshold === d ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                                        color: overUnderThreshold === d ? '#000000' : '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '3px',
                                        padding: '1px 5px',
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#10b981' }}>
                        LIVE SPOT: {lastTick.quote}
                    </div>
                </div>
            )}

            {/* SmartCharts Champion Engine Container with Live Crest/Trough Digits Overlay */}
            {!isMinimized && (
                <div
                    ref={chartCanvasRef}
                    style={{
                        flex: 1,
                        position: 'relative',
                        width: '100%',
                        height: 'calc(100% - 44px)',
                        overflow: 'hidden',
                        background: '#0d1117'
                    }}
                >
                    {/* 1. Official SmartCharts Default Engine (Deriv Volatility Dropdown, Line Chart, Tools, Zoom, Pan) */}
                    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                        <ChartWrapper show_digits_stats={false} />
                    </div>

                    {/* 2. Floating Crest and Trough Digits Overlay Layer (Pointer Events None so all SmartChart interactions work 100%) */}
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 5,
                            pointerEvents: 'none',
                            display: 'block'
                        }}
                    >
                        <defs>
                            <filter id="digitDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.95" />
                            </filter>
                        </defs>

                        {/* Crest & Trough Digits Populated Along the Rolling Graph */}
                        {chartGeometry.points.map((p, idx) => {
                            const isEven = p.digit % 2 === 0;
                            let isHighlighted = true;
                            let digitColor = '#ffffff';

                            if (hudMode === 'evenodd') {
                                if (parityFilter === 'EVEN') isHighlighted = isEven;
                                if (parityFilter === 'ODD') isHighlighted = !isEven;
                                digitColor = isEven ? '#10b981' : '#ef4444';
                            } else if (hudMode === 'matches') {
                                isHighlighted = p.digit === matchesDigit;
                                digitColor = isHighlighted ? '#ffaa00' : 'rgba(255, 255, 255, 0.35)';
                            } else if (hudMode === 'overunder') {
                                isHighlighted = overUnderType === 'UNDER' ? p.digit < overUnderThreshold : p.digit > overUnderThreshold;
                                digitColor = isHighlighted ? '#10b981' : 'rgba(255, 255, 255, 0.35)';
                            }

                            if (!isHighlighted) return null;

                            // Peak / Crest: Display above apex
                            if (p.isCrest) {
                                return (
                                    <g key={`crest_${idx}`}>
                                        <text
                                            x={p.x}
                                            y={p.y - 12}
                                            fill={digitColor}
                                            fontSize="18"
                                            fontWeight="900"
                                            textAnchor="middle"
                                            fontFamily="Inter, sans-serif"
                                            filter="url(#digitDropShadow)"
                                        >
                                            {p.digit}
                                        </text>
                                    </g>
                                );
                            }

                            // Valley / Trough: Display below apex
                            if (p.isTrough) {
                                return (
                                    <g key={`trough_${idx}`}>
                                        <text
                                            x={p.x}
                                            y={p.y + 22}
                                            fill={digitColor}
                                            fontSize="18"
                                            fontWeight="900"
                                            textAnchor="middle"
                                            fontFamily="Inter, sans-serif"
                                            filter="url(#digitDropShadow)"
                                        >
                                            {p.digit}
                                        </text>
                                    </g>
                                );
                            }

                            // Stride run point
                            if (p.isInflection) {
                                return (
                                    <g key={`inflection_${idx}`}>
                                        <text
                                            x={p.x}
                                            y={p.y - 10}
                                            fill={digitColor}
                                            fontSize="14"
                                            fontWeight="800"
                                            textAnchor="middle"
                                            fontFamily="Inter, sans-serif"
                                            filter="url(#digitDropShadow)"
                                            opacity="0.85"
                                        >
                                            {p.digit}
                                        </text>
                                    </g>
                                );
                            }

                            return null;
                        })}
                    </svg>

                    {/* Parity Ratio Footer HUD (Active in EVENODD) */}
                    {hudMode === 'evenodd' && (
                        <div style={{ position: 'absolute', bottom: '25px', left: '70px', right: '70px', background: 'rgba(15, 23, 42, 0.94)', padding: '5px 12px', borderRadius: '6px', border: '1px solid #ff4500', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'auto' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>EVEN: {evenPct}%</span>
                            <div style={{ flex: 1, height: '8px', background: '#ef4444', borderRadius: '4px', margin: '0 12px', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: `${evenPct}%`, background: '#10b981', height: '100%', transition: 'width 0.4s ease' }} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444' }}>ODD: {oddPct}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default DraggableChartOverlay;
