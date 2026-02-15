import * as THREE from 'three';

export interface EnemyModelConfig {
  path: string;
  scale: number;
  rotationOffset: THREE.Euler;
  positionOffset: THREE.Vector3;
}

export const ENEMY_MODEL_CATALOG: Record<string, EnemyModelConfig> = {
  ufo: {
    path: '/assets/models/enemies/ufo.glb',
    scale: 1.5,
    rotationOffset: new THREE.Euler(0, 0, 0),
    positionOffset: new THREE.Vector3(0, 0, 0),
  },
  cow: {
    path: '/assets/models/enemies/cow.glb',
    scale: 1.0,
    rotationOffset: new THREE.Euler(0, Math.PI / 2, 0),
    positionOffset: new THREE.Vector3(0, -0.1, 0),
  },
  crocodile: {
    path: '/assets/models/enemies/crocodile.glb',
    scale: 1.2,
    rotationOffset: new THREE.Euler(0, 0, 0),
    positionOffset: new THREE.Vector3(0, -0.2, 0),
  },
  penguin: {
    path: '/assets/models/enemies/penguin.glb',
    scale: 1.1,
    rotationOffset: new THREE.Euler(0, 0, 0),
    positionOffset: new THREE.Vector3(0, -0.3, 0),
  },
};
