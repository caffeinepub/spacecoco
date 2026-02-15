import * as THREE from 'three';
import type { GameState, Enemy } from '../state/gameState';

export class EnemySpawnerSystem {
  private gameState: GameState;
  private spawnTimer = 0;
  private spawnInterval = 2.5; // Faster spawning for more UFOs

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number) {
    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRandomEnemy();
    }

    // Update enemy positions
    this.gameState.enemies.forEach(enemy => {
      enemy.position.add(enemy.velocity.clone().multiplyScalar(dt));
      
      // Wrap around bounds
      const maxDist = 35;
      if (enemy.position.length() > maxDist) {
        enemy.position.normalize().multiplyScalar(-maxDist * 0.9);
      }
    });
  }

  private spawnRandomEnemy() {
    const types: Array<'cow' | 'ufo' | 'penguin' | 'crocodile' | 'finalBoss'> = [
      'ufo', 'ufo', 'ufo', // More UFOs for eating
      'cow', 'cow',
      'penguin',
      'crocodile',
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.spawnEnemy(type);
  }

  spawnEnemy(type: 'cow' | 'ufo' | 'penguin' | 'crocodile' | 'finalBoss') {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 10;
    
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 15,
      Math.sin(angle) * radius
    );

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5
    );

    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      type,
      position,
      velocity,
      active: true
    };

    this.gameState.addEnemy(enemy);
  }
}
