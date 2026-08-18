import React from 'react';

export interface FireSvgOverlayProps {
  opacity?: number;
  className?: string;
}

export const FireSvgOverlay: React.FC<FireSvgOverlayProps> = ({
  opacity = 0.9,
  className = '',
}) => {
  return (
    <div
      className={`fire-svg-overlay-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        opacity,
        borderRadius: 'inherit',
      }}
    >
      {/* SVG Filters for Liquid Flame Warping & Turbulence */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="svg-fire-turbulence" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.04"
              numOctaves="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="4s"
                values="0.015 0.04; 0.025 0.07; 0.015 0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Fiery Core Gradients */}
          <linearGradient id="fireGradOuter" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7a0000" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#ff2200" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#ff7700" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="fireGradMid" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b30000" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ff5500" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#ffaa00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffff66" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="fireGradInner" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff3300" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffcc00" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Ember Spark Radial Gradient */}
          <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#ff3300" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Real-time SVG Vector Flames Overlay */}
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          filter: 'url(#svg-fire-turbulence) drop-shadow(0 0 15px #ff4500)',
          display: 'block',
        }}
      >
        {/* Layer 1: Outer Red Flame Waves */}
        <path
          d="M -20 620 Q 30 400 80 500 T 180 380 T 280 460 T 380 340 T 420 620 Z"
          fill="url(#fireGradOuter)"
        >
          <animate
            attributeName="d"
            dur="3.2s"
            repeatCount="indefinite"
            values="
              M -20 620 Q 30 400 80 500 T 180 380 T 280 460 T 380 340 T 420 620 Z;
              M -20 620 Q 50 350 100 450 T 200 320 T 300 420 T 400 300 T 420 620 Z;
              M -20 620 Q 30 400 80 500 T 180 380 T 280 460 T 380 340 T 420 620 Z
            "
          />
        </path>

        {/* Layer 2: Mid Orange Flame Waves */}
        <path
          d="M -20 620 Q 40 450 100 520 T 200 400 T 300 480 T 400 380 T 420 620 Z"
          fill="url(#fireGradMid)"
        >
          <animate
            attributeName="d"
            dur="2.5s"
            repeatCount="indefinite"
            values="
              M -20 620 Q 40 450 100 520 T 200 400 T 300 480 T 400 380 T 420 620 Z;
              M -20 620 Q 20 380 70 480 T 160 350 T 260 430 T 360 320 T 420 620 Z;
              M -20 620 Q 40 450 100 520 T 200 400 T 300 480 T 400 380 T 420 620 Z
            "
          />
        </path>

        {/* Layer 3: Inner White-Hot Flame Peaks */}
        <path
          d="M -10 620 Q 60 490 120 550 T 220 440 T 320 510 T 410 430 T 420 620 Z"
          fill="url(#fireGradInner)"
        >
          <animate
            attributeName="d"
            dur="1.8s"
            repeatCount="indefinite"
            values="
              M -10 620 Q 60 490 120 550 T 220 440 T 320 510 T 410 430 T 420 620 Z;
              M -10 620 Q 80 440 140 500 T 240 390 T 340 460 T 420 380 T 420 620 Z;
              M -10 620 Q 60 490 120 550 T 220 440 T 320 510 T 410 430 T 420 620 Z
            "
          />
        </path>
      </svg>

      {/* Floating Animated Vector SVG Sparks */}
      <svg
        viewBox="0 0 400 600"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {[
          { cx: '15%', cy: '70%', r: 4, dur: '3.5s', delay: '0s' },
          { cx: '35%', cy: '80%', r: 6, dur: '2.8s', delay: '0.5s' },
          { cx: '55%', cy: '75%', r: 5, dur: '3.1s', delay: '1.2s' },
          { cx: '75%', cy: '85%', r: 7, dur: '2.4s', delay: '0.8s' },
          { cx: '85%', cy: '65%', r: 4, dur: '3.8s', delay: '1.6s' },
        ].map((spark, idx) => (
          <circle
            key={idx}
            cx={spark.cx}
            cy={spark.cy}
            r={spark.r}
            fill="url(#sparkGlow)"
            style={{ filter: 'drop-shadow(0 0 6px #ffaa00)' }}
          >
            <animate
              attributeName="cy"
              values="90%; 10%; 0%"
              dur={spark.dur}
              begin={spark.delay}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${spark.cx}; calc(${spark.cx} + 20px); calc(${spark.cx} - 15px)`}
              dur={spark.dur}
              begin={spark.delay}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 0.8; 0"
              dur={spark.dur}
              begin={spark.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};
