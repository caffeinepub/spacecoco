import { drawSprite } from './sprites';

export function renderUFO(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  ctx.shadowColor = '#00ddff';
  ctx.shadowBlur = 25;
  drawSprite(ctx, 'ufo', 0, 0, 64, 64, centerX - 32, centerY - 32, 64, 64);
  ctx.restore();
}

export function renderCow(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  drawSprite(ctx, 'cow', 0, 0, 64, 64, centerX - 32, centerY - 32, 64, 64);
  ctx.restore();
}

export function renderPenguinBoss(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 30;
  drawSprite(ctx, 'penguin', 0, 0, 128, 128, centerX - 64, centerY - 64, 128, 128);
  ctx.restore();
}

export function renderPointDrop(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  
  // Pulsing glow effect
  const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
  ctx.shadowColor = '#00ddff';
  ctx.shadowBlur = 20 * pulse;
  
  // Draw bright point
  ctx.fillStyle = '#00ddff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8 * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner bright core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4 * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}
