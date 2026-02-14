import { ToonRenderer, toonMaterials } from './toonRenderer';
import type { ScorePopup } from '../types';

export function renderLaser(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  laser: { startX: number; startY: number; endX: number; endY: number; createdAt: number; duration: number },
  time: number
) {
  const age = time - laser.createdAt;
  const progress = Math.min(1, age / laser.duration);
  const alpha = 1 - progress;

  if (alpha <= 0) return;

  const material = toonMaterials.laser;

  // Multi-layer glow
  ctx.save();
  ctx.globalAlpha = alpha;
  
  // Outer glow
  renderer.drawGlow(
    (laser.startX + laser.endX) / 2,
    (laser.startY + laser.endY) / 2,
    material.glowRadius * 1.5,
    material.glowColor,
    material.glowIntensity
  );

  // Core beam
  ctx.strokeStyle = material.baseColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(laser.startX, laser.startY);
  ctx.lineTo(laser.endX, laser.endY);
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = renderer.adjustBrightness(material.baseColor, 1.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(laser.startX, laser.startY);
  ctx.lineTo(laser.endX, laser.endY);
  ctx.stroke();

  ctx.restore();
}

export function renderExplosion(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  explosion: { x: number; y: number; createdAt: number; duration: number },
  time: number
) {
  const age = time - explosion.createdAt;
  const progress = Math.min(1, age / explosion.duration);
  const alpha = 1 - progress;
  const radius = 20 + progress * 40;

  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Outer ring
  const gradient = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, radius);
  gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function renderScorePopup(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  popup: ScorePopup,
  time: number
) {
  const age = time - popup.createdAt;
  const progress = Math.min(1, age / popup.duration);
  const alpha = 1 - progress;
  const offsetY = progress * 30;

  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 24px Orbitron, monospace';
  ctx.fillStyle = popup.color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = `+${popup.amount}`;
  ctx.strokeText(text, popup.x, popup.y - offsetY);
  ctx.fillText(text, popup.x, popup.y - offsetY);

  ctx.restore();
}
