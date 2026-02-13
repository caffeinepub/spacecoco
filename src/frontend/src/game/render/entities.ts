import { drawSprite, drawFullSprite } from './sprites';
import { GRID_SIZE } from '../constants';
import type { SnakeSegment, Position } from '../types';

// Snake rendering with pixel-art sprites
export function renderSnake(
  ctx: CanvasRenderingContext2D,
  segments: SnakeSegment[],
  showTongue: boolean
) {
  segments.forEach((segment, index) => {
    const pixelX = segment.x * GRID_SIZE;
    const pixelY = segment.y * GRID_SIZE;

    if (index === 0) {
      // Head with eyes and optional tongue
      // Snake sprite sheet: 256x256, 4 frames (head variations)
      const headFrame = showTongue ? 1 : 0; // Frame 0: normal, Frame 1: tongue out
      const frameSize = 64; // 256/4 = 64px per frame
      drawSprite(
        ctx,
        'snake',
        headFrame * frameSize,
        0,
        frameSize,
        frameSize,
        pixelX - 2,
        pixelY - 2,
        GRID_SIZE + 4,
        GRID_SIZE + 4
      );
    } else {
      // Body segment - use frame 2 from sprite sheet
      const frameSize = 64;
      drawSprite(
        ctx,
        'snake',
        2 * frameSize,
        0,
        frameSize,
        frameSize,
        pixelX,
        pixelY,
        GRID_SIZE,
        GRID_SIZE
      );
    }
  });
}

// UFO rendering with pixel-art sprite
export function renderUFOSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 40
) {
  drawFullSprite(
    ctx,
    'ufo',
    x - size / 2,
    y - size / 2,
    size,
    size
  );
}

// Cow rendering with pixel-art sprite
export function renderCowSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 30
) {
  drawFullSprite(
    ctx,
    'cow',
    x - size / 2,
    y - size / 2,
    size,
    size
  );
}

// Penguin boss rendering with pixel-art sprite
export function renderPenguinBossSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 60
) {
  drawFullSprite(
    ctx,
    'penguin',
    x - size / 2,
    y - size / 2,
    size,
    size
  );
}

// Crocodile rendering with animated sprite sheet
export function renderCrocodile(
  ctx: CanvasRenderingContext2D,
  position: Position,
  animationFrame: number
) {
  const pixelX = position.x * GRID_SIZE;
  const pixelY = position.y * GRID_SIZE;
  
  // Crocodile sprite sheet: 256x128, 4 frames horizontally
  const frameSize = 64; // 256/4 = 64px per frame
  const frame = Math.floor(animationFrame) % 4;
  
  drawSprite(
    ctx,
    'crocodile',
    frame * frameSize,
    0,
    frameSize,
    64,
    pixelX - 2,
    pixelY - 2,
    GRID_SIZE + 4,
    GRID_SIZE + 4
  );
}
