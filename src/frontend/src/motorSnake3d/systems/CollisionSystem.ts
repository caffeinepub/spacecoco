import * as THREE from 'three';
import type { GameState } from '../state/gameState';

export class CollisionSystem {
  private gameState: GameState;
  private onVfxTrigger?: (event: string, payload?: any) => void;

  constructor(gameState: GameState, onVfxTrigger?: (event: string, payload?: any) => void) {
    this.gameState = gameState;
    this.onVfxTrigger = onVfxTrigger;
  }

  update(dt: number) {
    this.checkEnemyCollisions();
    this.checkAnomalyCollisions();
    this.checkCoreCollision();
  }

  private checkEnemyCollisions() {
    const playerPos = this.gameState.player.position;

    this.gameState.enemies.forEach(enemy => {
      const distance = playerPos.distanceTo(enemy.position);
      
      if (distance < 2) {
        this.handleEnemyCollision(enemy);
      }
    });
  }

  private handleEnemyCollision(enemy: any) {
    switch (enemy.type) {
      case 'cow':
        // Freeze dome + shards
        this.onVfxTrigger?.('freezeDome', { position: enemy.position });
        this.gameState.removeEnemy(enemy.id);
        break;
        
      case 'ufo':
        // Fold pulse + teleport
        this.onVfxTrigger?.('foldPulse', { position: enemy.position });
        this.gameState.setPlayerPosition(new THREE.Vector3(0, 0, 0));
        this.gameState.removeEnemy(enemy.id);
        break;
        
      case 'penguin':
        // Fire ring + baby attachments
        this.onVfxTrigger?.('fireRing', { position: enemy.position });
        
        // Spawn 3 baby penguins
        for (let i = 0; i < 3; i++) {
          this.gameState.addBabyPenguin({
            id: `baby-${Date.now()}-${i}`,
            attachedSegment: Math.min(i, this.gameState.tailSegments.length - 1)
          });
        }
        
        this.gameState.removeEnemy(enemy.id);
        break;
    }
  }

  private checkAnomalyCollisions() {
    const playerPos = this.gameState.player.position;

    this.gameState.anomalies.forEach(anomaly => {
      const distance = playerPos.distanceTo(anomaly.position);
      
      if (distance < 2) {
        this.handleAnomalyCollision(anomaly);
      }
    });
  }

  private handleAnomalyCollision(anomaly: any) {
    // Activate power-up
    this.gameState.setActivePowerUp({
      type: anomaly.type,
      duration: anomaly.type === 'mirror' ? 2 : 5,
      elapsed: 0
    });

    this.gameState.removeAnomaly(anomaly.id);

    // Trigger VFX
    this.onVfxTrigger?.(anomaly.type, { position: anomaly.position });
  }

  private checkCoreCollision() {
    const playerPos = this.gameState.player.position;
    const distanceToCore = playerPos.length();

    if (distanceToCore < 2 && this.gameState.coreIntact) {
      // Core break triggered
      this.onVfxTrigger?.('coreBreak', {});
    }
  }
}
