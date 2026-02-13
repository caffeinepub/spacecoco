import { useEffect, useRef } from 'react';

interface NeonStartSceneProps {
  className?: string;
}

export function NeonStartScene({ className = '' }: NeonStartSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const ufoSpritesRef = useRef<HTMLImageElement | null>(null);
  const cowLaserSpritesRef = useRef<HTMLImageElement | null>(null);
  const bannerRef = useRef<HTMLImageElement | null>(null);
  const sparkSpritesRef = useRef<HTMLImageElement | null>(null);

  // UFO and cow animation state
  const ufosRef = useRef<Array<{ x: number; y: number; speed: number; frame: number }>>([]);
  const cowsRef = useRef<Array<{ x: number; y: number; laserFrame: number; laserTimer: number }>>([]);
  const sparksRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Load sprites
    const banner = new Image();
    banner.src = '/assets/generated/spacecoco-menu-banner-neon.dim_2560x900.png';
    bannerRef.current = banner;

    const ufoSprites = new Image();
    ufoSprites.src = '/assets/generated/spacecoco-menu-ufo-sprites.dim_1024x256.png';
    ufoSpritesRef.current = ufoSprites;

    const cowLaserSprites = new Image();
    cowLaserSprites.src = '/assets/generated/spacecoco-menu-cow-laser-sprites.dim_1024x256.png';
    cowLaserSpritesRef.current = cowLaserSprites;

    const sparkSprites = new Image();
    sparkSprites.src = '/assets/generated/spacecoco-neon-sparks-sprites.dim_512x512.png';
    sparkSpritesRef.current = sparkSprites;

    // Initialize UFOs
    for (let i = 0; i < 3; i++) {
      ufosRef.current.push({
        x: Math.random() * canvas.width / window.devicePixelRatio,
        y: Math.random() * 200 - 100,
        speed: 0.5 + Math.random() * 1,
        frame: Math.random() * 4,
      });
    }

    // Initialize cows
    for (let i = 0; i < 2; i++) {
      cowsRef.current.push({
        x: 100 + i * 300,
        y: 150 + Math.random() * 100,
        laserFrame: 0,
        laserTimer: Math.random() * 100,
      });
    }

    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Clear with dark space background
      ctx.fillStyle = '#0a0015';
      ctx.fillRect(0, 0, w, h);

      // Draw banner background with glow
      const bannerImg = bannerRef.current;
      if (bannerImg && bannerImg.complete) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.filter = 'blur(20px)';
        ctx.drawImage(bannerImg, 0, 0, w, h);
        ctx.filter = 'none';
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bannerImg, 0, 0, w, h);
        ctx.restore();
      }

      // Update and draw UFOs
      const ufoImg = ufoSpritesRef.current;
      if (ufoImg && ufoImg.complete) {
        ufosRef.current.forEach((ufo) => {
          ufo.y += ufo.speed;
          ufo.frame += 0.1;

          if (ufo.y > h + 50) {
            ufo.y = -50;
            ufo.x = Math.random() * w;
          }

          const frameIndex = Math.floor(ufo.frame) % 4;
          const spriteSize = 256;

          ctx.save();
          // Glow effect
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 30;
          ctx.drawImage(
            ufoImg,
            frameIndex * spriteSize,
            0,
            spriteSize,
            spriteSize,
            ufo.x - 40,
            ufo.y - 40,
            80,
            80
          );
          ctx.restore();
        });
      }

      // Update and draw cows with eye lasers
      const cowImg = cowLaserSpritesRef.current;
      if (cowImg && cowImg.complete) {
        cowsRef.current.forEach((cow) => {
          cow.laserTimer += delta * 0.01;
          
          if (cow.laserTimer > 100) {
            cow.laserFrame = (cow.laserFrame + 1) % 4;
            cow.laserTimer = 0;

            // Spawn sparks when laser fires
            if (cow.laserFrame === 1) {
              for (let i = 0; i < 5; i++) {
                sparksRef.current.push({
                  x: cow.x + 40,
                  y: cow.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 0,
                  maxLife: 30 + Math.random() * 30,
                });
              }
            }
          }

          const spriteSize = 256;

          ctx.save();
          // Glow effect
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 25;
          ctx.drawImage(
            cowImg,
            cow.laserFrame * spriteSize,
            0,
            spriteSize,
            spriteSize,
            cow.x - 40,
            cow.y - 40,
            80,
            80
          );
          ctx.restore();
        });
      }

      // Update and draw sparks
      const sparkImg = sparkSpritesRef.current;
      if (sparkImg && sparkImg.complete) {
        sparksRef.current = sparksRef.current.filter((spark) => {
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.life += 1;

          if (spark.life >= spark.maxLife) return false;

          const alpha = 1 - spark.life / spark.maxLife;
          const sparkSize = 128;
          const frameIndex = Math.floor((spark.life / spark.maxLife) * 4) % 4;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 15;
          ctx.drawImage(
            sparkImg,
            frameIndex * sparkSize,
            0,
            sparkSize,
            sparkSize,
            spark.x - 16,
            spark.y - 16,
            32,
            32
          );
          ctx.restore();

          return true;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
