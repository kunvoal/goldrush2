import React, { useRef, useEffect } from 'react';

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  life: number;
  maxLife: number;
}

interface SparkEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const FireCanvasOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.95 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const flames: FlameParticle[] = [];
    const sparks: SparkEmber[] = [];

    const resize = () => {
      canvas.width = container.clientWidth || 240;
      canvas.height = container.clientHeight || 700;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const createFlame = (): FlameParticle => {
      const W = canvas.width || 240;
      const H = canvas.height || 700;
      return {
        x: Math.random() * W,
        y: H + Math.random() * 15,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(Math.random() * 4.5 + 3.0),
        size: 4,
        maxSize: Math.random() * 35 + 25,
        life: 0,
        maxLife: Math.random() * 50 + 35,
      };
    };

    const createSpark = (): SparkEmber => {
      const W = canvas.width || 240;
      const H = canvas.height || 700;
      return {
        x: Math.random() * W,
        y: H - Math.random() * 120,
        vx: (Math.random() - 0.5) * 3.2,
        vy: -(Math.random() * 5 + 3.5),
        size: Math.random() * 3 + 1.2,
        alpha: 1.0,
      };
    };

    const animate = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Continuous spawning for roaring fire
      if (flames.length < 80) {
        for (let i = 0; i < 4; i++) {
          flames.push(createFlame());
        }
      }

      if (sparks.length < 40 && Math.random() < 0.75) {
        sparks.push(createSpark());
      }

      // Draw Intense Flame Particles
      for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.life++;
        f.x += f.vx + Math.sin(f.y * 0.03) * 1.2;
        f.y += f.vy;

        const progress = f.life / f.maxLife;
        f.size = Math.sin(progress * Math.PI) * f.maxSize;

        if (progress > 1 || f.size <= 0) {
          flames.splice(i, 1);
          continue;
        }

        // Brilliant Flame Color Layers (Pure White Core -> Intense Gold -> Roaring Flame Orange -> Crimson Flame -> Smoke Edge)
        let colorInner = 'rgba(255, 255, 230, 0.95)';
        let colorOuter = 'rgba(255, 120, 0, 0.8)';
        
        if (progress > 0.2) {
          colorInner = 'rgba(255, 220, 50, 0.9)';
          colorOuter = 'rgba(255, 80, 0, 0.75)';
        }
        if (progress > 0.5) {
          colorInner = 'rgba(255, 140, 0, 0.85)';
          colorOuter = 'rgba(230, 30, 0, 0.65)';
        }
        if (progress > 0.8) {
          colorInner = 'rgba(200, 20, 0, 0.5)';
          colorOuter = 'rgba(80, 5, 0, 0.2)';
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(1, f.size), 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(1, f.size));
        grad.addColorStop(0, colorInner);
        grad.addColorStop(0.5, colorOuter);
        grad.addColorStop(1, 'rgba(255, 68, 0, 0)');

        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fill();
        ctx.restore();
      }

      // Draw Floating Spark Embers
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx + Math.sin(s.y * 0.08) * 0.8;
        s.y += s.vy;
        s.alpha -= 0.012;

        if (s.alpha <= 0 || s.y < 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 80, ${s.alpha})`;
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 12;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        borderRadius: 'inherit'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity
        }}
      />
    </div>
  );
};
