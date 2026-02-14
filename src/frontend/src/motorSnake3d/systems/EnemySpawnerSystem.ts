import * as THREE from 'three';
import type { GameState, Enemy } from '../state/gameState';

export class EnemySpawnerSystem {
  private gameState: GameState;
  private spawnTimer = 0;
  private spawnInterval = 5;

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
    });
  }

  private spawnRandomEnemy() {
    const types: Array<'cow' | 'ufo' | 'penguin'> = ['cow', 'ufo', 'penguin'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.spawnEnemy(type);
  }

  spawnEnemy(type: 'cow' | 'ufo' | 'penguin') {
    const angle = Math.random() * Math.PI * 2;
    const radius = 25;
    
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (Math.random() - 0.5) * 10
    );

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
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
