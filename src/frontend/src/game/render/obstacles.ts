import { ToonRenderer, toonMaterials } from './toonRenderer';
import { getToonTextures } from './toonMaterials';
import type { Obstacle, Boss } from '../types';
import { GRID_SIZE } from '../constants';

export function renderUFO(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  time: number,
  beatPhase: number = 0
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 1.5;

  // Coordinated bobbing motion synced with beat
  const bob = Math.sin(beatPhase * Math.PI * 2) * 4;
  const drift = Math.sin(time * 0.001 + obstacle.position.x) * 3;
  const tilt = Math.sin(beatPhase * Math.PI * 2) * 0.05;

  ctx.save();
  ctx.translate(x + size / 2 + drift, y + size / 2 + bob);
  ctx.rotate(tilt);
  
  const material = toonMaterials.ufo;
  
  // Enhanced pulsing glow synced with beat
  const glowPulse = 1.0 + Math.sin(beatPhase * Math.PI * 2) * 0.3;
  renderer.drawGlow(0, 0, material.glowRadius * glowPulse, material.glowColor, material.glowIntensity * glowPulse);
  
  // Hull (main body) with stronger gradient
  const hullPath = new Path2D();
  hullPath.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
  
  const gradient = renderer.createFakePBRGradient(-size * 0.6, -size * 0.3, size * 1.2, size * 0.6, material.baseColor);
  renderer.drawFill(hullPath, material, gradient);
  renderer.drawOutline(hullPath, material);
  
  // Dome (cockpit) with enhanced brightness
  const domePath = new Path2D();
  domePath.arc(0, -size * 0.1, size * 0.3, 0, Math.PI, true);
  ctx.fillStyle = renderer.adjustBrightness(material.baseColor, 1.5);
  ctx.fill(domePath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 3;
  ctx.stroke(domePath);
  
  // Alien pilot (visible in dome) with better fallback
  const textures = getToonTextures();
  if (textures.alienPilot) {
    const pilotSize = size * 0.28;
    renderer.drawTextureOverlay(
      -pilotSize / 2,
      -size * 0.2,
      pilotSize,
      pilotSize,
      textures.alienPilot,
      0.9
    );
  } else {
    // Enhanced fallback: distinct alien head silhouette
    // Head
    ctx.fillStyle = '#99ff99';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.15, size * 0.14, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#004400';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Large eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-size * 0.06, -size * 0.16, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.06, -size * 0.16, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.06, -size * 0.17, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.06, -size * 0.17, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Pulsing emissive lights on hull
  const lightPositions = [-0.4, -0.2, 0.2, 0.4];
  lightPositions.forEach((pos, i) => {
    const lightPhase = (beatPhase + i * 0.25) % 1.0;
    const lightAlpha = 0.6 + Math.sin(lightPhase * Math.PI * 2) * 0.4;
    
    ctx.fillStyle = `rgba(255, 136, 0, ${lightAlpha})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff8800';
    ctx.beginPath();
    ctx.arc(pos * size * 0.5, size * 0.05, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  
  // Rim light for depth
  renderer.drawRimLight(0, 0, size * 0.6, '#00eeff', Math.PI * 0.25);
  
  ctx.restore();
}

export function renderCow(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  beatPhase: number = 0
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 1.3;

  // Coordinated floating motion
  const float = Math.sin(beatPhase * Math.PI * 2 + 1) * 5;

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2 + float);
  
  const material = toonMaterials.cow;
  
  // Pulsing glow
  const glowPulse = 1.0 + Math.sin(beatPhase * Math.PI * 2 + 1) * 0.25;
  renderer.drawGlow(0, 0, material.glowRadius * glowPulse, material.glowColor, material.glowIntensity * glowPulse);
  
  // Body with enhanced gradient
  const bodyPath = new Path2D();
  bodyPath.ellipse(0, 0, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
  
  const gradient = renderer.createFakePBRGradient(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6, material.baseColor);
  renderer.drawFill(bodyPath, material, gradient);
  renderer.drawOutline(bodyPath, material);
  
  // Head with clear features
  const headPath = new Path2D();
  headPath.ellipse(-size * 0.35, -size * 0.1, size * 0.2, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = renderer.adjustBrightness(material.baseColor, 1.3);
  ctx.fill(headPath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 2.5;
  ctx.stroke(headPath);
  
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.4, -size * 0.12, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.38, -size * 0.12, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  
  // Spots for character
  ctx.fillStyle = renderer.adjustBrightness(material.baseColor, 0.7);
  ctx.beginPath();
  ctx.ellipse(size * 0.1, -size * 0.05, size * 0.12, size * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, size * 0.08, size * 0.1, size * 0.08, -0.2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

export function renderPenguinBoss(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  boss: Boss,
  beatPhase: number = 0
) {
  const x = boss.position.x * GRID_SIZE;
  const y = boss.position.y * GRID_SIZE;
  const size = GRID_SIZE * 2.5;

  // Coordinated boss motion
  const bob = Math.sin(beatPhase * Math.PI * 2 + 2) * 6;
  const sway = Math.sin(beatPhase * Math.PI * 4) * 0.08;

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2 + bob);
  ctx.rotate(sway);
  
  const material = toonMaterials.penguin;
  
  // Intense pulsing glow for boss
  const glowPulse = 1.0 + Math.sin(beatPhase * Math.PI * 2 + 2) * 0.4;
  renderer.drawGlow(0, 0, material.glowRadius * glowPulse, material.glowColor, material.glowIntensity * glowPulse);
  
  // Body (main) with strong gradient
  const bodyPath = new Path2D();
  bodyPath.ellipse(0, size * 0.1, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
  
  const bodyGradient = renderer.createFakePBRGradient(-size * 0.35, -size * 0.35, size * 0.7, size * 0.9, '#222222');
  renderer.drawFill(bodyPath, material, bodyGradient);
  renderer.drawOutline(bodyPath, material);
  
  // Belly (white) with clear separation
  const bellyPath = new Path2D();
  bellyPath.ellipse(0, size * 0.15, size * 0.22, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill(bellyPath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 3;
  ctx.stroke(bellyPath);
  
  // Head with distinct features
  const headPath = new Path2D();
  headPath.arc(0, -size * 0.25, size * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill(headPath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 4;
  ctx.stroke(headPath);
  
  // Beak (orange) - clear and prominent
  const beakPath = new Path2D();
  beakPath.moveTo(-size * 0.08, -size * 0.22);
  beakPath.lineTo(size * 0.08, -size * 0.22);
  beakPath.lineTo(0, -size * 0.15);
  beakPath.closePath();
  ctx.fillStyle = '#ff9900';
  ctx.fill(beakPath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 2.5;
  ctx.stroke(beakPath);
  
  // Eyes (white with black pupils)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.28, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, -size * 0.28, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.27, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, -size * 0.27, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  
  // Flippers (distinct from body)
  const flipperLeft = new Path2D();
  flipperLeft.ellipse(-size * 0.32, size * 0.05, size * 0.12, size * 0.3, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#333333';
  ctx.fill(flipperLeft);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 3;
  ctx.stroke(flipperLeft);
  
  const flipperRight = new Path2D();
  flipperRight.ellipse(size * 0.32, size * 0.05, size * 0.12, size * 0.3, 0.3, 0, Math.PI * 2);
  ctx.fill(flipperRight);
  ctx.stroke(flipperRight);
  
  // Feet (orange) - visible at bottom
  ctx.fillStyle = '#ff9900';
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, size * 0.52, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.15, size * 0.52, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

export function renderPointDrop(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  time: number,
  beatPhase: number = 0
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 0.8;

  // Coordinated spinning and pulsing
  const spin = (time * 0.003) % (Math.PI * 2);
  const pulse = 1.0 + Math.sin(beatPhase * Math.PI * 2 + 3) * 0.2;
  const float = Math.sin(beatPhase * Math.PI * 2 + 3) * 3;

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2 + float);
  ctx.rotate(spin);
  ctx.scale(pulse, pulse);
  
  const material = toonMaterials.pointDrop;
  
  // Intense pulsing glow
  const glowPulse = 1.0 + Math.sin(beatPhase * Math.PI * 2 + 3) * 0.5;
  renderer.drawGlow(0, 0, material.glowRadius * glowPulse, material.glowColor, material.glowIntensity * glowPulse);
  
  // Star shape for point drop
  const starPath = new Path2D();
  const points = 5;
  const outerRadius = size * 0.5;
  const innerRadius = size * 0.25;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      starPath.moveTo(px, py);
    } else {
      starPath.lineTo(px, py);
    }
  }
  starPath.closePath();
  
  const gradient = renderer.createFakePBRGradient(-outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2, material.baseColor);
  renderer.drawFill(starPath, material, gradient);
  renderer.drawOutline(starPath, material);
  
  ctx.restore();
}
