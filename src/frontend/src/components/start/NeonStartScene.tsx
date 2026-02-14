import { useEffect, useRef } from 'react';

interface Sprite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'ufo' | 'cow' | 'spark';
  phase: number;
  scale: number;
}

/**
 * @deprecated Legacy 2D canvas hero scene. The app now uses NeonSpaceBackground3D
 * as a persistent 3D background layer. This component is kept for reference but
 * should not be used in new code.
 */
export function NeonStartScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Sprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const localCanvas = canvasRef.current;
    if (!localCanvas) return;

    const localCtx = localCanvas.getContext('2d');
    if (!localCtx) return;

    // Initialize sprites
    spritesRef.current = [];
    for (let i = 0; i < 8; i++) {
      spritesRef.current.push({
        x: Math.random() * localCanvas.width,
        y: Math.random() * localCanvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: Math.random() > 0.5 ? 'ufo' : 'cow',
        phase: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4,
      });
    }

    // Add sparks
    for (let i = 0; i < 15; i++) {
      spritesRef.current.push({
        x: Math.random() * localCanvas.width,
        y: Math.random() * localCanvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        type: 'spark',
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.5,
      });
    }

    const animate = () => {
      if (!localCanvas || !localCtx) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      // Vibrant space gradient background
      const gradient = localCtx.createLinearGradient(0, 0, localCanvas.width, localCanvas.height);
      gradient.addColorStop(0, '#001a33');
      gradient.addColorStop(0.5, '#002244');
      gradient.addColorStop(1, '#001a33');
      localCtx.fillStyle = gradient;
      localCtx.fillRect(0, 0, localCanvas.width, localCanvas.height);

      // Update and render sprites
      spritesRef.current.forEach(sprite => {
        // Update position
        sprite.x += sprite.vx;
        sprite.y += sprite.vy;

        // Wrap around edges
        if (sprite.x < -50) sprite.x = localCanvas.width + 50;
        if (sprite.x > localCanvas.width + 50) sprite.x = -50;
        if (sprite.y < -50) sprite.y = localCanvas.height + 50;
        if (sprite.y > localCanvas.height + 50) sprite.y = -50;

        // Coordinated pulsing animation
        const beatPhase = (elapsed * 0.002) % 1.0;
        const pulse = 1.0 + Math.sin((beatPhase + sprite.phase) * Math.PI * 2) * 0.15;
        const size = 40 * sprite.scale * pulse;

        localCtx.save();
        localCtx.translate(sprite.x, sprite.y);

        if (sprite.type === 'ufo') {
          // Brighter UFO with enhanced glow
          const glowSize = size * 2;
          const glowGradient = localCtx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
          glowGradient.addColorStop(0, 'rgba(0, 238, 255, 0.4)');
          glowGradient.addColorStop(0.5, 'rgba(255, 136, 0, 0.3)');
          glowGradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
          localCtx.fillStyle = glowGradient;
          localCtx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

          // UFO body - brighter colors
          localCtx.fillStyle = '#00eeff';
          localCtx.shadowBlur = 20;
          localCtx.shadowColor = '#00eeff';
          localCtx.beginPath();
          localCtx.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
          localCtx.fill();

          // Dome
          localCtx.fillStyle = '#88ffff';
          localCtx.beginPath();
          localCtx.arc(0, -size * 0.1, size * 0.3, 0, Math.PI, true);
          localCtx.fill();

          // Pulsing lights
          const lightAlpha = 0.7 + Math.sin(beatPhase * Math.PI * 4) * 0.3;
          localCtx.fillStyle = `rgba(255, 136, 0, ${lightAlpha})`;
          localCtx.shadowBlur = 15;
          localCtx.shadowColor = '#ff8800';
          localCtx.beginPath();
          localCtx.arc(-size * 0.3, 0, size * 0.08, 0, Math.PI * 2);
          localCtx.fill();
          localCtx.beginPath();
          localCtx.arc(size * 0.3, 0, size * 0.08, 0, Math.PI * 2);
          localCtx.fill();

          localCtx.shadowBlur = 0;
        } else if (sprite.type === 'cow') {
          // Brighter cow with enhanced glow
          const glowSize = size * 1.8;
          const glowGradient = localCtx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
          glowGradient.addColorStop(0, 'rgba(255, 34, 255, 0.4)');
          glowGradient.addColorStop(1, 'rgba(255, 34, 255, 0)');
          localCtx.fillStyle = glowGradient;
          localCtx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

          // Cow body - brighter magenta
          localCtx.fillStyle = '#ff22ff';
          localCtx.shadowBlur = 18;
          localCtx.shadowColor = '#ff22ff';
          localCtx.beginPath();
          localCtx.ellipse(0, 0, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
          localCtx.fill();

          // Head
          localCtx.fillStyle = '#ff55ff';
          localCtx.beginPath();
          localCtx.ellipse(-size * 0.35, -size * 0.1, size * 0.2, size * 0.18, 0, 0, Math.PI * 2);
          localCtx.fill();

          // Eye laser effect - brighter
          const laserAlpha = 0.8 + Math.sin(beatPhase * Math.PI * 6) * 0.2;
          localCtx.strokeStyle = `rgba(255, 0, 0, ${laserAlpha})`;
          localCtx.lineWidth = 3;
          localCtx.shadowBlur = 20;
          localCtx.shadowColor = '#ff0000';
          localCtx.beginPath();
          localCtx.moveTo(-size * 0.4, -size * 0.12);
          localCtx.lineTo(-size * 0.7, -size * 0.15);
          localCtx.stroke();

          localCtx.shadowBlur = 0;
        } else if (sprite.type === 'spark') {
          // Brighter sparks with enhanced glow
          const sparkAlpha = 0.7 + Math.sin((beatPhase + sprite.phase) * Math.PI * 2) * 0.3;
          
          localCtx.fillStyle = `rgba(255, 255, 100, ${sparkAlpha})`;
          localCtx.shadowBlur = 15;
          localCtx.shadowColor = '#ffff66';
          localCtx.beginPath();
          localCtx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
          localCtx.fill();

          // Spark rays
          localCtx.strokeStyle = `rgba(255, 255, 200, ${sparkAlpha * 0.6})`;
          localCtx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + beatPhase * Math.PI * 2;
            localCtx.beginPath();
            localCtx.moveTo(0, 0);
            localCtx.lineTo(Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3);
            localCtx.stroke();
          }

          localCtx.shadowBlur = 0;
        }

        localCtx.restore();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1600}
      height={600}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
