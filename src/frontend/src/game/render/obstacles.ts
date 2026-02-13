import { renderUFOSprite, renderCowSprite, renderPenguinBossSprite } from './entities';

// Re-export sprite-based rendering functions
export function renderUFO(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 40
) {
  renderUFOSprite(ctx, x, y, size);
}

export function renderCow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 30
) {
  renderCowSprite(ctx, x, y, size);
}

export function renderPenguinBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 60
) {
  renderPenguinBossSprite(ctx, x, y, size);
}
