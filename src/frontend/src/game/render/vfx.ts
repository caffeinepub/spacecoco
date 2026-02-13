import { drawSprite, drawFullSprite } from './sprites';
import type { ScorePopup } from '../types';

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
  
  // Enhanced glow trail
  ctx.shadowColor = '#ff0033';
  ctx.shadowBlur = 30;
  ctx.globalAlpha = 0.8;
  
  // Draw multiple layers for trail effect
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.3 - i * 0.1;
    drawFullSprite(ctx, 'laser', 0, -6 - i * 2, length, 12 + i * 4);
  }
  
  // Main laser beam
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 20;
  drawFullSprite(ctx, 'laser', 0, -4, length, 8);
  
  ctx.restore();
}

export function renderExplosion(
  ctx: CanvasRenderingContext2D,
  explosion: ExplosionVFX,
  currentTime: number
) {
  const elapsed = currentTime - explosion.createdAt;
  if (elapsed > explosion.duration) return;

  const frameSize = 64;
  const totalFrames = 16;
  const frameIndex = Math.floor((elapsed / explosion.duration) * totalFrames);
  
  if (frameIndex >= totalFrames) return;

  const row = Math.floor(frameIndex / 4);
  const col = frameIndex % 4;

  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 40;
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
  ctx.restore();
}

export function renderScorePopup(
  ctx: CanvasRenderingContext2D,
  popup: ScorePopup,
  currentTime: number
) {
  const elapsed = currentTime - popup.createdAt;
  if (elapsed > popup.duration) return;

  const progress = elapsed / popup.duration;
  const alpha = 1 - progress;
  const yOffset = -progress * 50;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 32px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Glow effect
  ctx.shadowColor = popup.color;
  ctx.shadowBlur = 20;
  
  // Outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(`+${popup.amount}`, popup.x, popup.y + yOffset);
  
  // Fill
  ctx.fillStyle = popup.color;
  ctx.fillText(`+${popup.amount}`, popup.x, popup.y + yOffset);
  
  ctx.restore();
}
