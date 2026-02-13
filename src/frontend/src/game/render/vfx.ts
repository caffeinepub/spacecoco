import { drawSprite, drawFullSprite } from './sprites';

export interface LaserVFX {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  createdAt: number;
  duration: number;
}

export interface ExplosionVFX {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  duration: number;
}

// Render thin red laser beam
export function renderLaser(
  ctx: CanvasRenderingContext2D,
  laser: LaserVFX,
  currentTime: number
) {
  const elapsed = currentTime - laser.createdAt;
  if (elapsed > laser.duration) return;

  const angle = Math.atan2(laser.endY - laser.startY, laser.endX - laser.startX);
  const length = Math.sqrt(
    Math.pow(laser.endX - laser.startX, 2) + Math.pow(laser.endY - laser.startY, 2)
  );

  ctx.save();
  ctx.translate(laser.startX, laser.startY);
  ctx.rotate(angle);
  
  // Draw laser sprite stretched to length
  drawFullSprite(ctx, 'laser', 0, -4, length, 8);
  
  ctx.restore();
}

// Render pink pixel explosion animation
export function renderExplosion(
  ctx: CanvasRenderingContext2D,
  explosion: ExplosionVFX,
  currentTime: number
) {
  const elapsed = currentTime - explosion.createdAt;
  if (elapsed > explosion.duration) return;

  // Explosion sprite sheet: 256x256, 4x4 grid = 16 frames
  const frameSize = 64; // 256/4 = 64px per frame
  const totalFrames = 16;
  const frameIndex = Math.floor((elapsed / explosion.duration) * totalFrames);
  
  if (frameIndex >= totalFrames) return;

  const row = Math.floor(frameIndex / 4);
  const col = frameIndex % 4;

  drawSprite(
    ctx,
    'explosion',
    col * frameSize,
    row * frameSize,
    frameSize,
    frameSize,
    explosion.x - 32,
    explosion.y - 32,
    64,
    64
  );
}
