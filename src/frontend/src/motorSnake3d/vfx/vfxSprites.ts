import * as THREE from 'three';

const textureCache = new Map<string, THREE.Texture>();

export function loadVfxTexture(path: string): THREE.Texture {
  if (textureCache.has(path)) {
    return textureCache.get(path)!;
  }

  const loader = new THREE.TextureLoader();
  const texture = loader.load(path);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(path, texture);

  return texture;
}

export const VfxSprites = {
  rainbowRing: '/assets/generated/vfx-rainbow-ring.dim_1024x1024.png',
  confetti: '/assets/generated/vfx-confetti.dim_1024x1024.png',
  pinkSmoke: '/assets/generated/vfx-pink-smoke.dim_1024x1024.png',
  discoGlint: '/assets/generated/vfx-disco-glint.dim_1024x1024.png',
};
