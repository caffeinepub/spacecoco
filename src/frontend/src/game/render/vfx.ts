import { ToonRenderer, toonMaterials } from './toonRenderer';
import type { Laser, Explosion, ScorePopup } from '../types';

export function renderLaser(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  laser: Laser,
  time: number,
  beatPhase: number = 0
) {
  const material = toonMaterials.laser;
  
  // Enhanced shimmer and pulse
  const shimmer = Math.sin(time * 0.02) * 0.3 + 0.7;
  const pulse = 1.0 + Math.sin(beatPhase * Math.PI * 2) * 0.3;
  
  ctx.save();
  
  // Multi-layer laser beam with stronger glow
  const layers = [
    { width: 12 * pulse, alpha: 0.3 * shimmer, color: material.glowColor },
    { width: 8 * pulse, alpha: 0.5 * shimmer, color: material.baseColor },
    { width: 4 * pulse, alpha: 0.8 * shimmer, color: '#ffffff' },
  ];
  
  layers.forEach(layer => {
    ctx.strokeStyle = layer.color.replace(')', `, ${layer.alpha})`).replace('rgb', 'rgba');
    ctx.lineWidth = layer.width;
    ctx.shadowBlur = 20;
    ctx.shadowColor = material.glowColor;
    ctx.beginPath();
    ctx.moveTo(laser.startX, laser.startY);
    ctx.lineTo(laser.endX, laser.endY);
    ctx.stroke();
  });
  
  // Intense glow at endpoints
  renderer.drawGlow(laser.startX, laser.startY, material.glowRadius * pulse, material.glowColor, material.glowIntensity * 1.5);
  renderer.drawGlow(laser.endX, laser.endY, material.glowRadius * pulse, material.glowColor, material.glowIntensity * 1.5);
  
  ctx.restore();
}

export function renderExplosion(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  explosion: Explosion,
  time: number
) {
  const age = time - explosion.createdAt;
  const progress = age / 500;
  
  if (progress >= 1.0) return;
  
  const x = explosion.x;
  const y = explosion.y;
  
  ctx.save();
  
  // Multi-stage explosion with enhanced brightness
  if (progress < 0.3) {
    // Initial flash - very bright
    const flashRadius = 40 * (progress / 0.3);
    const flashAlpha = 1.0 - (progress / 0.3);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, flashRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if (progress >= 0.2 && progress < 0.7) {
    // Main explosion ring - vibrant colors
    const ringProgress = (progress - 0.2) / 0.5;
    const ringRadius = 20 + 60 * ringProgress;
    const ringAlpha = 0.8 * (1.0 - ringProgress);
    
    const gradient = ctx.createRadialGradient(x, y, ringRadius * 0.3, x, y, ringRadius);
    gradient.addColorStop(0, `rgba(255, 200, 0, ${ringAlpha})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${ringAlpha * 0.8})`);
    gradient.addColorStop(1, `rgba(255, 0, 100, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff6600';
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if (progress >= 0.5) {
    // Outer shockwave - bright and expanding
    const waveProgress = (progress - 0.5) / 0.5;
    const waveRadius = 40 + 80 * waveProgress;
    const waveAlpha = 0.5 * (1.0 - waveProgress);
    
    ctx.strokeStyle = `rgba(255, 150, 50, ${waveAlpha})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff9933';
    ctx.beginPath();
    ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

export function renderScorePopup(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  popup: ScorePopup,
  time: number
) {
  const age = time - popup.createdAt;
  const progress = age / popup.duration;
  
  if (progress >= 1.0) return;
  
  const x = popup.x;
  const y = popup.y - 30 * progress;
  const alpha = 1.0 - progress;
  const scale = 1.0 + progress * 0.5;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Enhanced glow pulse
  const glowPulse = 1.0 + Math.sin(progress * Math.PI * 4) * 0.3;
  
  ctx.font = 'bold 24px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Bright glow
  ctx.shadowBlur = 20 * glowPulse;
  ctx.shadowColor = popup.color;
  ctx.fillStyle = popup.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  ctx.fillText(`+${popup.amount}`, 0, 0);
  
  // Bright outline
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
  ctx.lineWidth = 3;
  ctx.strokeText(`+${popup.amount}`, 0, 0);
  
  ctx.restore();
}
