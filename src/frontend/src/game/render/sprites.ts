// Sprite loader and renderer for pixel-art game assets
export interface SpriteSheet {
  image: HTMLImageElement;
  loaded: boolean;
}

class SpriteManager {
  private sprites: Map<string, SpriteSheet> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  loadSprite(name: string, path: string): Promise<void> {
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(name, { image: img, loaded: true });
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load sprite: ${path}`);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      img.src = path;
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  getSprite(name: string): SpriteSheet | undefined {
    return this.sprites.get(name);
  }

  isLoaded(name: string): boolean {
    return this.sprites.get(name)?.loaded ?? false;
  }
}

export const spriteManager = new SpriteManager();

// Initialize all game sprites
export async function loadAllSprites(): Promise<void> {
  const sprites = [
    { name: 'snake', path: '/assets/generated/spacecoco-snake-sprites.dim_256x256.png' },
    { name: 'ufo', path: '/assets/generated/spacecoco-ufo.dim_64x64.png' },
    { name: 'cow', path: '/assets/generated/spacecoco-cow.dim_64x64.png' },
    { name: 'penguin', path: '/assets/generated/spacecoco-penguin-boss.dim_128x128.png' },
    { name: 'crocodile', path: '/assets/generated/spacecoco-crocodile-sprites.dim_256x128.png' },
    { name: 'laser', path: '/assets/generated/spacecoco-laser-red.dim_64x16.png' },
    { name: 'explosion', path: '/assets/generated/spacecoco-explosion-pink-sprites.dim_256x256.png' },
  ];

  await Promise.all(sprites.map(s => spriteManager.loadSprite(s.name, s.path)));
}

// Draw sprite with crisp pixel rendering
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  spriteName: string,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const sprite = spriteManager.getSprite(spriteName);
  if (!sprite || !sprite.loaded) return;

  // Disable image smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite.image, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = true;
}

// Draw full sprite (no clipping)
export function drawFullSprite(
  ctx: CanvasRenderingContext2D,
  spriteName: string,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const sprite = spriteManager.getSprite(spriteName);
  if (!sprite || !sprite.loaded) return;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite.image, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = true;
}
