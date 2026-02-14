import * as THREE from 'three';
import type { GameState, Anomaly } from '../state/gameState';

export class AnomalyPowerUpSystem {
  private gameState: GameState;
  private spawnTimer = 0;
  private spawnInterval = 10;
  private onVfxTrigger?: (event: string, payload?: any) => void;

  constructor(gameState: GameState, onVfxTrigger?: (event: string, payload?: any) => void) {
    this.gameState = gameState;
    this.onVfxTrigger = onVfxTrigger;
  }

  update(dt: number) {
    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRandomAnomaly();
    }

    // Update active power-up
    if (this.gameState.activePowerUp) {
      this.updateActivePowerUp(dt);
    }
  }

  private spawnRandomAnomaly() {
    const types: Array<'blackhole' | 'star' | 'mirror'> = ['blackhole', 'star', 'mirror'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.spawnAnomaly(type);
  }

  spawnAnomaly(type: 'blackhole' | 'star' | 'mirror') {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20;
    
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (Math.random() - 0.5) * 10
    );

    const anomaly: Anomaly = {
      id: `anomaly-${Date.now()}-${Math.random()}`,
      type,
      position,
      active: true
    };

    this.gameState.addAnomaly(anomaly);
  }

  private updateActivePowerUp(dt: number) {
    const powerUp = this.gameState.activePowerUp!;
    powerUp.elapsed += dt;

    // Apply power-up effects
    switch (powerUp.type) {
      case 'blackhole':
        this.applyBlackHoleEffect(dt);
        break;
      case 'star':
        this.applyShootingStarEffect(dt);
        break;
      case 'mirror':
        // Mirror effect handled in collision system
        break;
    }

    // Check if expired
    if (powerUp.elapsed >= powerUp.duration) {
      this.gameState.setActivePowerUp(null);
    }
  }

  private applyBlackHoleEffect(dt: number) {
    // Suction enemies
    this.gameState.enemies.forEach(enemy => {
      const toPlayer = this.gameState.player.position.clone().sub(enemy.position);
      const distance = toPlayer.length();
      const force = toPlayer.normalize().multiplyScalar(5 / (distance + 1));
      enemy.velocity.add(force.multiplyScalar(dt));
    });

    // Self-risk: pull player toward center slightly
    const toCenter = this.gameState.player.position.clone().normalize().multiplyScalar(-0.1 * dt);
    const newPos = this.gameState.player.position.clone().add(toCenter);
    this.gameState.setPlayerPosition(newPos);
  }

  private applyShootingStarEffect(dt: number) {
    // Player phases through enemies (handled in collision system)
    // Melt effect: reduce duration faster
    const powerUp = this.gameState.activePowerUp!;
    powerUp.elapsed += dt * 0.5; // Melts faster
  }
}
