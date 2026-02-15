import * as THREE from 'three';

export const NEON_COLORS = {
  acidGreen: new THREE.Color('#39ff14'),
  hotPink: new THREE.Color('#ff1493'),
  neonOrange: new THREE.Color('#ff6600'),
  electricCyan: new THREE.Color('#00ffff'),
  neonPurple: new THREE.Color('#bf00ff'),
  laserRed: new THREE.Color('#ff0033'),
};

export function createNeonMaterial(color: THREE.Color, emissiveIntensity = 2): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    metalness: 0.1,
    roughness: 0.3,
  });
}

export function createNeonOutlineMaterial(color: THREE.Color): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide,
  });
}

export function applyNeonGlow(mesh: THREE.Mesh, color: THREE.Color, intensity = 2) {
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.emissive = color;
    mesh.material.emissiveIntensity = intensity;
  }
}
