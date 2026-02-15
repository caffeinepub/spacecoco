import { useEffect, useRef } from 'react';

export function GalaxySnakeHero() {
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

    // Cow state
    const cowImage = new Image();
    cowImage.src = '/assets/generated/galaxy-snake-cow-walk-cycle.dim_2048x2048.png';
    
    const cows = [
      { x: 0.2, y: 0.15, speed: 0.0003, scale: 0.08, phase: 0 },
      { x: 0.6, y: 0.12, speed: 0.00025, scale: 0.06, phase: Math.PI },
      { x: 0.85, y: 0.18, speed: 0.00035, scale: 0.07, phase: Math.PI * 0.5 },
    ];

    const animate = () => {
      time += 0.016;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw animated cows with lasers
      if (cowImage.complete) {
        cows.forEach((cow) => {
          const cowX = canvas.width * cow.x + Math.sin(time * cow.speed * 100 + cow.phase) * 50;
          const cowY = canvas.height * cow.y + Math.sin(time * 0.5 + cow.phase) * 8;
          const cowSize = canvas.width * cow.scale;

          // Draw cow
          ctx.save();
          ctx.translate(cowX, cowY);
          ctx.drawImage(cowImage, -cowSize / 2, -cowSize / 2, cowSize, cowSize);
          ctx.restore();

          // Draw eye lasers
          const laserLength = 150 + Math.sin(time * 2 + cow.phase) * 30;
          const laserAngle = Math.sin(time * 0.8 + cow.phase) * 0.3;
          
          // Left laser
          ctx.save();
          ctx.translate(cowX - cowSize * 0.15, cowY - cowSize * 0.1);
          ctx.rotate(laserAngle);
          
          const leftGradient = ctx.createLinearGradient(0, 0, laserLength, 0);
          leftGradient.addColorStop(0, `rgba(255, 0, 255, ${0.9 + Math.sin(time * 3) * 0.1})`);
          leftGradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.7 + Math.cos(time * 2.5) * 0.1})`);
          leftGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
          
          ctx.strokeStyle = leftGradient;
          ctx.lineWidth = 4 + Math.sin(time * 4) * 2;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(laserLength, 0);
          ctx.stroke();
          ctx.restore();

          // Right laser
          ctx.save();
          ctx.translate(cowX + cowSize * 0.15, cowY - cowSize * 0.1);
          ctx.rotate(laserAngle);
          
          const rightGradient = ctx.createLinearGradient(0, 0, laserLength, 0);
          rightGradient.addColorStop(0, `rgba(0, 255, 255, ${0.9 + Math.cos(time * 3) * 0.1})`);
          rightGradient.addColorStop(0.5, `rgba(255, 0, 255, ${0.7 + Math.sin(time * 2.5) * 0.1})`);
          rightGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
          
          ctx.strokeStyle = rightGradient;
          ctx.lineWidth = 4 + Math.cos(time * 4) * 2;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(laserLength, 0);
          ctx.stroke();
          ctx.restore();
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated canvas layer with cows and lasers */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
      />

      {/* Animated neon title */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-wider animate-galaxy-title-float">
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '0s' }}>G</span>
          <span className="inline-block animate-letter-bob-2 neon-galaxy-text" style={{ animationDelay: '0.1s' }}>A</span>
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '0.2s' }}>L</span>
          <span className="inline-block animate-letter-bob-2 neon-galaxy-text" style={{ animationDelay: '0.3s' }}>A</span>
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '0.4s' }}>X</span>
          <span className="inline-block animate-letter-bob-2 neon-galaxy-text" style={{ animationDelay: '0.5s' }}>Y</span>
          <span className="inline-block mx-4"></span>
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '0.6s' }}>S</span>
          <span className="inline-block animate-letter-bob-2 neon-galaxy-text" style={{ animationDelay: '0.7s' }}>N</span>
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '0.8s' }}>A</span>
          <span className="inline-block animate-letter-bob-2 neon-galaxy-text" style={{ animationDelay: '0.9s' }}>K</span>
          <span className="inline-block animate-letter-bob-1 neon-galaxy-text" style={{ animationDelay: '1.0s' }}>E</span>
        </h1>
      </div>
    </div>
  );
}
