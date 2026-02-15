import { useEffect, useRef } from 'react';

export function NeonStartCoverOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation state
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw animated shimmer overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 100,
        canvas.height / 2 + Math.cos(time * 0.7) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      // Neon shimmer colors
      gradient.addColorStop(0, `rgba(255, 0, 255, ${0.1 + Math.sin(time * 2) * 0.05})`);
      gradient.addColorStop(0.3, `rgba(0, 255, 255, ${0.08 + Math.cos(time * 1.5) * 0.04})`);
      gradient.addColorStop(0.6, `rgba(0, 255, 0, ${0.05 + Math.sin(time * 1.8) * 0.03})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {/* Static cover image with motion animation */}
      <div className="absolute inset-0 animate-neon-cover-drift">
        <img
          src="/assets/generated/galaxy-snake-cover.dim_3840x2160.png"
          alt="Galaxy Snake Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated shimmer canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 mix-blend-screen opacity-60"
      />

      {/* Readability gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>
  );
}
