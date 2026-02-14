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

// Vibrant cartoon palette with high saturation and contrast
export const toonMaterials = {
  snake: {
    baseColor: '#00ffaa',
    outlineColor: '#004433',
    outlineWidth: 3.5,
    glowColor: '#00ffaa',
    glowRadius: 28,
    glowIntensity: 1.2,
  },
  opponentSnake: {
    baseColor: '#ff3366',
    outlineColor: '#440011',
    outlineWidth: 3.5,
    glowColor: '#ff3366',
    glowRadius: 26,
    glowIntensity: 1.1,
  },
  ufo: {
    baseColor: '#00eeff',
    outlineColor: '#004455',
    outlineWidth: 4.5,
    glowColor: '#ff8800',
    glowRadius: 50,
    glowIntensity: 1.4,
  },
  cow: {
    baseColor: '#ff22ff',
    outlineColor: '#550055',
    outlineWidth: 3.5,
    glowColor: '#ff22ff',
    glowRadius: 32,
    glowIntensity: 1.1,
  },
  penguin: {
    baseColor: '#ffbb00',
    outlineColor: '#553300',
    outlineWidth: 5.5,
    glowColor: '#ffbb00',
    glowRadius: 60,
    glowIntensity: 1.5,
  },
  pointDrop: {
    baseColor: '#ffff22',
    outlineColor: '#555500',
    outlineWidth: 2.5,
    glowColor: '#ffff22',
    glowRadius: 22,
    glowIntensity: 1.3,
  },
  laser: {
    baseColor: '#ff1144',
    outlineColor: '#550011',
    outlineWidth: 2.5,
    glowColor: '#ff1144',
    glowRadius: 38,
    glowIntensity: 1.6,
  },
};
