import { ToonRenderer, toonMaterials } from './toonRenderer';
import type { Snake, OpponentSnake, Obstacle } from '../types';
import { GRID_SIZE, TONGUE_CADENCE } from '../constants';

export function renderSnake(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  time: number,
  showTongue: boolean
) {
  const material = toonMaterials.snake;

  snake.segments.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;
    
    // Undulating wave effect
    const wave = Math.sin(index * 0.3 + time * 0.01) * 2;
    
    renderer.drawSnakeSegment(x, y, GRID_SIZE, material, wave);
  });

  // Draw head with tongue
  if (showTongue && snake.segments.length > 0) {
    const head = snake.segments[0];
    const x = head.x * GRID_SIZE + GRID_SIZE / 2;
    const y = head.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let tongueX = x, tongueY = y;
    switch (snake.direction) {
      case 'UP':
        tongueY -= GRID_SIZE;
        break;
      case 'DOWN':
        tongueY += GRID_SIZE;
        break;
      case 'LEFT':
        tongueX -= GRID_SIZE;
        break;
      case 'RIGHT':
        tongueX += GRID_SIZE;
        break;
    }
    
    ctx.moveTo(x, y);
    ctx.lineTo(tongueX, tongueY);
    ctx.stroke();
    ctx.restore();
  }
}

export function renderOpponentSnake(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  opponent: OpponentSnake,
  time: number
) {
  if (!opponent.isAlive) return;

  const material = toonMaterials.opponentSnake;

  opponent.segments.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;
    
    const wave = Math.sin(index * 0.3 + time * 0.01 + Math.PI) * 2;
    
    renderer.drawSnakeSegment(x, y, GRID_SIZE, material, wave);
  });
}

export function renderCrocodile(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle
) {
  const x = obstacle.position.x * GRID_SIZE;
  const y = obstacle.position.y * GRID_SIZE;
  const size = GRID_SIZE * 1.5;

  const material = {
    ...toonMaterials.snake,
    baseColor: '#88ff00',
    glowColor: '#88ff00',
  };

  renderer.drawRectEntity(x, y, size, size * 0.6, material);
}
