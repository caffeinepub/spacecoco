interface ToonTextures {
  ufoAlbedo: HTMLImageElement | null;
  ufoAlbedoV2: HTMLImageElement | null;
  cowAlbedo: HTMLImageElement | null;
  penguinAlbedo: HTMLImageElement | null;
  penguinAlbedoV2: HTMLImageElement | null;
  alienPilot: HTMLImageElement | null;
  ufoDecals: HTMLImageElement | null;
  lightBlob: HTMLImageElement | null;
}

const textures: ToonTextures = {
  ufoAlbedo: null,
  ufoAlbedoV2: null,
  cowAlbedo: null,
  penguinAlbedo: null,
  penguinAlbedoV2: null,
  alienPilot: null,
  ufoDecals: null,
  lightBlob: null,
};

let loadingPromise: Promise<void> | null = null;

export async function loadToonTextures(): Promise<void> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const paths = {
      ufoAlbedo: '/assets/generated/ufo-toon-albedo.dim_4096x4096.png',
      ufoAlbedoV2: '/assets/generated/ufo-toon-albedo-v2.dim_4096x4096.png',
      cowAlbedo: '/assets/generated/cow-toon-albedo.dim_4096x4096.png',
      penguinAlbedo: '/assets/generated/penguin-toon-albedo.dim_4096x4096.png',
      penguinAlbedoV2: '/assets/generated/penguin-toon-albedo-v2.dim_4096x4096.png',
      alienPilot: '/assets/generated/alien-pilot-toon-albedo.dim_4096x4096.png',
      ufoDecals: '/assets/generated/ufo-decals-emissive.dim_2048x2048.png',
      lightBlob: '/assets/generated/radial-light-blob.dim_2048x2048.png',
    };

    const loadImage = (src: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn(`Failed to load ${src}, using fallback`);
          resolve(null);
        };
        img.src = src;
      });
    };

    try {
      const [ufo, ufoV2, cow, penguin, penguinV2, alien, decals, blob] = await Promise.all([
        loadImage(paths.ufoAlbedo),
        loadImage(paths.ufoAlbedoV2),
        loadImage(paths.cowAlbedo),
        loadImage(paths.penguinAlbedo),
        loadImage(paths.penguinAlbedoV2),
        loadImage(paths.alienPilot),
        loadImage(paths.ufoDecals),
        loadImage(paths.lightBlob),
      ]);

      textures.ufoAlbedo = ufo;
      textures.ufoAlbedoV2 = ufoV2;
      textures.cowAlbedo = cow;
      textures.penguinAlbedo = penguin;
      textures.penguinAlbedoV2 = penguinV2;
      textures.alienPilot = alien;
      textures.ufoDecals = decals;
      textures.lightBlob = blob;
    } catch (err) {
      console.warn('Failed to load toon textures, using fallback rendering:', err);
    }
  })();

  return loadingPromise;
}

export function getToonTextures(): ToonTextures {
  return textures;
}

export interface ToonMaterial {
  baseColor: string;
  outlineColor: string;
  outlineWidth: number;
  glowColor: string;
  glowRadius: number;
  glowIntensity: number;
}

export const toonMaterials = {
  snake: {
    baseColor: '#00ff88',
    outlineColor: '#003322',
    outlineWidth: 3,
    glowColor: '#00ff88',
    glowRadius: 20,
    glowIntensity: 0.6,
  },
  opponentSnake: {
    baseColor: '#ff4444',
    outlineColor: '#330000',
    outlineWidth: 3,
    glowColor: '#ff4444',
    glowRadius: 18,
    glowIntensity: 0.5,
  },
  ufo: {
    baseColor: '#00ddff',
    outlineColor: '#003344',
    outlineWidth: 4,
    glowColor: '#ff6600',
    glowRadius: 40,
    glowIntensity: 0.8,
  },
  cow: {
    baseColor: '#ff00ff',
    outlineColor: '#440044',
    outlineWidth: 3,
    glowColor: '#ff00ff',
    glowRadius: 25,
    glowIntensity: 0.6,
  },
  penguin: {
    baseColor: '#ffaa00',
    outlineColor: '#442200',
    outlineWidth: 5,
    glowColor: '#ffaa00',
    glowRadius: 50,
    glowIntensity: 0.9,
  },
  pointDrop: {
    baseColor: '#ffff00',
    outlineColor: '#444400',
    outlineWidth: 2,
    glowColor: '#ffff00',
    glowRadius: 15,
    glowIntensity: 0.7,
  },
  laser: {
    baseColor: '#ff0000',
    outlineColor: '#440000',
    outlineWidth: 2,
    glowColor: '#ff0000',
    glowRadius: 30,
    glowIntensity: 1.0,
  },
};
