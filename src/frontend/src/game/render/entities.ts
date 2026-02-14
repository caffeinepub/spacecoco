import { ToonRenderer, toonMaterials } from './toonRenderer';
import type { Snake, OpponentSnake, Obstacle } from '../types';
import { GRID_SIZE, TONGUE_CADENCE } from '../constants';

export function renderSnake(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  time: number,
  showTongue: boolean,
  beatPhase: number = 0
) {
  const material = toonMaterials.snake;

  snake.segments.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;
    
    // Enhanced undulating wave effect
    const wave = Math.sin(index * 0.4 + time * 0.012) * 3;
    
    // Subtle squash/stretch animation synced with beat
    const squash = 1.0 + Math.sin(beatPhase * Math.PI * 2 + index * 0.2) * 0.08;
    
    renderer.drawSnakeSegment(x, y, GRID_SIZE, material, wave, squash);
  });

  // Draw animated tongue
  if (showTongue && snake.segments.length > 0) {
    const head = snake.segments[0];
    const x = head.x * GRID_SIZE + GRID_SIZE / 2;
    const y = head.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.save();
    
    // Tongue wiggle animation
    const wiggle = Math.sin(time * 0.02) * 3;
    
    ctx.strokeStyle = '#ff2244';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff2244';
    ctx.beginPath();
    
    let tongueX = x, tongueY = y;
    let midX = x, midY = y;
    
    switch (snake.direction) {
      case 'UP':
        tongueY -= GRID_SIZE * 1.2;
        midX += wiggle;
        midY -= GRID_SIZE * 0.6;
        break;
      case 'DOWN':
        tongueY += GRID_SIZE * 1.2;
        midX += wiggle;
        midY += GRID_SIZE * 0.6;
        break;
      case 'LEFT':
        tongueX -= GRID_SIZE * 1.2;
        midY += wiggle;
        midX -= GRID_SIZE * 0.6;
        break;
      case 'RIGHT':
        tongueX += GRID_SIZE * 1.2;
        midY += wiggle;
        midX += GRID_SIZE * 0.6;
        break;
    }
    
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(midX, midY, tongueX, tongueY);
    ctx.stroke();
    
    // Forked tongue tip
    ctx.beginPath();
    const forkAngle = snake.direction === 'UP' || snake.direction === 'DOWN' ? 0.3 : 0.3;
    const forkLength = 4;
    ctx.moveTo(tongueX, tongueY);
    ctx.lineTo(tongueX - forkLength * Math.cos(forkAngle), tongueY - forkLength * Math.sin(forkAngle));
    ctx.moveTo(tongueX, tongueY);
    ctx.lineTo(tongueX + forkLength * Math.cos(forkAngle), tongueY + forkLength * Math.sin(forkAngle));
    ctx.stroke();
    
    ctx.restore();
  }
}

export function renderOpponentSnake(
  renderer: ToonRenderer,
  ctx: CanvasRenderingContext2D,
  opponent: OpponentSnake,
  time: number,
  beatPhase: number = 0
) {
  if (!opponent.isAlive) return;

  const material = toonMaterials.opponentSnake;

  opponent.segments.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;
    
    const wave = Math.sin(index * 0.4 + time * 0.012 + Math.PI) * 3;
    const squash = 1.0 + Math.sin(beatPhase * Math.PI * 2 + index * 0.2 + Math.PI) * 0.08;
    
    renderer.drawSnakeSegment(x, y, GRID_SIZE, material, wave, squash);
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
