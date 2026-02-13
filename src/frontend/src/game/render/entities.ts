import { drawSprite } from './sprites';
import type { SnakeSegment, Position } from '../types';
import { GRID_SIZE } from '../constants';

export function renderSnake(
  ctx: CanvasRenderingContext2D,
  segments: SnakeSegment[],
  showTongue: boolean = false
) {
  if (segments.length === 0) return;

  segments.forEach((segment, index) => {
    const pixelX = segment.x * GRID_SIZE;
    const pixelY = segment.y * GRID_SIZE;

    if (index === 0) {
      // Head with enhanced glow
      ctx.save();
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      // Snake sprite sheet: 256x256, 4x4 grid, 64px per frame
      // Frame 0 = head
      drawSprite(ctx, 'snake', 0, 0, 64, 64, pixelX, pixelY, GRID_SIZE, GRID_SIZE);
      ctx.restore();
      
      if (showTongue) {
        // Frame 3 = tongue
        drawSprite(ctx, 'snake', 192, 0, 64, 64, pixelX, pixelY, GRID_SIZE, GRID_SIZE);
      }
    } else {
      // Body with subtle glow
      ctx.save();
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
      // Frame 1 = body
      drawSprite(ctx, 'snake', 64, 0, 64, 64, pixelX, pixelY, GRID_SIZE, GRID_SIZE);
      ctx.restore();
    }
  });
}

export function renderOpponentSnake(
  ctx: CanvasRenderingContext2D,
  segments: SnakeSegment[]
) {
  if (segments.length === 0) return;

  segments.forEach((segment, index) => {
    const pixelX = segment.x * GRID_SIZE;
    const pixelY = segment.y * GRID_SIZE;

    ctx.save();
    // Red tint for opponents
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = index === 0 ? 20 : 10;
    ctx.globalAlpha = 0.9;
    
    if (index === 0) {
      // Frame 0 = head
      drawSprite(ctx, 'snake', 0, 0, 64, 64, pixelX, pixelY, GRID_SIZE, GRID_SIZE);
    } else {
      // Frame 1 = body
      drawSprite(ctx, 'snake', 64, 0, 64, 64, pixelX, pixelY, GRID_SIZE, GRID_SIZE);
    }
    
    // Add red overlay
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(pixelX, pixelY, GRID_SIZE, GRID_SIZE);
    ctx.restore();
  });
}

export function renderCrocodile(
  ctx: CanvasRenderingContext2D,
  position: Position,
  animationFrame: number
) {
  const pixelX = position.x * GRID_SIZE;
  const pixelY = position.y * GRID_SIZE;
  const frameIndex = Math.floor(animationFrame) % 2;

  ctx.save();
  ctx.shadowColor = '#88ff00';
  ctx.shadowBlur = 15;
  // Crocodile sprite sheet: 256x128, 2 frames horizontally, 128px per frame
  drawSprite(ctx, 'crocodile', frameIndex * 128, 0, 128, 128, pixelX, pixelY, GRID_SIZE * 2, GRID_SIZE);
  ctx.restore();
}
