import { ToonRenderer, toonMaterials } from './toonRenderer';
import { getToonTextures } from './toonMaterials';
import type { Obstacle, Boss } from '../types';
import { GRID_SIZE } from '../constants';

export function renderUFO(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  time: number
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 1.5;

  // Add subtle lateral drift
  const drift = Math.sin(time * 0.001 + obstacle.position.x) * 3;

  ctx.save();
  ctx.translate(x + size / 2 + drift, y + size / 2);
  
  const material = toonMaterials.ufo;
  
  // Glow
  renderer.drawGlow(0, 0, material.glowRadius, material.glowColor, material.glowIntensity);
  
  // Hull (main body)
  const hullPath = new Path2D();
  hullPath.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
  
  const gradient = renderer.createFakePBRGradient(-size * 0.6, -size * 0.3, size * 1.2, size * 0.6, material.baseColor);
  renderer.drawFill(hullPath, material, gradient);
  renderer.drawOutline(hullPath, material);
  
  // Dome (cockpit)
  const domePath = new Path2D();
  domePath.arc(0, -size * 0.1, size * 0.3, 0, Math.PI, true);
  ctx.fillStyle = renderer.adjustBrightness(material.baseColor, 1.3);
  ctx.fill(domePath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = 2;
  ctx.stroke(domePath);
  
  // Alien pilot (visible in dome)
  const textures = getToonTextures();
  if (textures.alienPilot) {
    const pilotSize = size * 0.25;
    renderer.drawTextureOverlay(
      -pilotSize / 2,
      -size * 0.2,
      pilotSize,
      pilotSize,
      textures.alienPilot,
      0.8
    );
  } else {
    // Fallback: simple alien head silhouette
    ctx.fillStyle = '#88ff88';
    ctx.beginPath();
    ctx.arc(0, -size * 0.15, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.05, -size * 0.17, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.05, -size * 0.17, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Lights/decals
  if (textures.ufoDecals) {
    renderer.drawTextureOverlay(
      -size * 0.6,
      -size * 0.3,
      size * 1.2,
      size * 0.6,
      textures.ufoDecals,
      0.6
    );
  } else {
    // Fallback: simple lights
    const lightPositions = [-0.4, -0.2, 0, 0.2, 0.4];
    lightPositions.forEach(pos => {
      const pulse = Math.sin(time * 0.005 + pos * 10) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 102, 0, ${pulse})`;
      ctx.beginPath();
      ctx.arc(pos * size * 0.5, size * 0.05, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  ctx.restore();
}

export function renderCow(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 1.2;

  renderer.drawCircleEntity(
    x + size / 2,
    y + size / 2,
    size / 2,
    toonMaterials.cow
  );
}

export function renderPenguinBoss(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  boss: Boss
) {
  const x = boss.position.x * GRID_SIZE;
  const y = boss.position.y * GRID_SIZE;
  const size = GRID_SIZE * 3;

  ctx.save();
  ctx.translate(x, y);
  
  const material = toonMaterials.penguin;
  
  // Glow
  renderer.drawGlow(0, 0, material.glowRadius, material.glowColor, material.glowIntensity);
  
  // Body (larger oval)
  const bodyPath = new Path2D();
  bodyPath.ellipse(0, size * 0.1, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
  const bodyGradient = renderer.createFakePBRGradient(-size * 0.4, -size * 0.4, size * 0.8, size, '#ffffff');
  ctx.fillStyle = bodyGradient;
  ctx.fill(bodyPath);
  ctx.strokeStyle = material.outlineColor;
  ctx.lineWidth = material.outlineWidth;
  ctx.stroke(bodyPath);
  
  // Head (smaller circle on top)
  const headPath = new Path2D();
  headPath.arc(0, -size * 0.25, size * 0.3, 0, Math.PI * 2);
  const headGradient = renderer.createFakePBRGradient(-size * 0.3, -size * 0.55, size * 0.6, size * 0.6, '#000000');
  ctx.fillStyle = headGradient;
  ctx.fill(headPath);
  ctx.stroke(headPath);
  
  // Beak (orange triangle)
  ctx.fillStyle = '#ff8800';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.1, -size * 0.15);
  ctx.lineTo(size * 0.1, -size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Eyes (white with black pupils)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.3, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.1, -size * 0.3, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.3, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.1, -size * 0.3, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  
  // Flippers (side ovals)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(-size * 0.45, size * 0.1, size * 0.15, size * 0.35, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size * 0.45, size * 0.1, size * 0.15, size * 0.35, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Feet (orange ovals at bottom)
  ctx.fillStyle = '#ff8800';
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, size * 0.55, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.15, size * 0.55, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();

  // Health indicator
  ctx.save();
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(x - size / 2, y - size / 2 - 10, size, 5);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(x - size / 2, y - size / 2 - 10, (size * boss.health) / 3, 5);
  ctx.restore();
}

export function renderPointDrop(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  time: number
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 0.8;
  
  const pulse = Math.sin(time * 0.005) * 0.2 + 1.0;

  renderer.drawCircleEntity(
    x + size / 2,
    y + size / 2,
    (size / 2) * pulse,
    toonMaterials.pointDrop
  );
}
