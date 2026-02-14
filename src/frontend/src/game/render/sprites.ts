// Sprite loading is now optional - toon renderer doesn't require pixel sprites
// Keep this file for backward compatibility but make loading non-blocking

const sprites: { [key: string]: HTMLImageElement } = {};
let loadingPromise: Promise<void> | null = null;

export async function loadAllSprites(): Promise<void> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Sprites are optional for toon renderer
    console.log('Sprite loading is optional for toon renderer');
  })();

  return loadingPromise;
}

export function getSprite(name: string): HTMLImageElement | null {
  return sprites[name] || null;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spriteName: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const sprite = getSprite(spriteName);
  if (!sprite) return;

  ctx.drawImage(sprite, x, y, width, height);
}

export function drawSpriteFrame(
  ctx: CanvasRenderingContext2D,
  spriteName: string,
  frameX: number,
  frameY: number,
  frameWidth: number,
  frameHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const sprite = getSprite(spriteName);
  if (!sprite) return;

  ctx.drawImage(
    sprite,
    frameX,
    frameY,
    frameWidth,
    frameHeight,
    x,
    y,
    width,
    height
  );
}
