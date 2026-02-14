import * as THREE from 'three';
import type { GameState } from '../state/gameState';

export class WorldSystem {
  private gameState: GameState;
  private sphereRadius = 30;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number) {
    // Constrain player to sphere surface based on world mode
    if (this.gameState.worldMode === 'inside') {
      this.constrainToInnerSurface();
    } else {
      this.constrainToOuterSurface();
    }

    // Handle abyss mode
    if (this.gameState.abyssMode) {
      this.updateAbyssMode(dt);
    }
  }

  private constrainToInnerSurface() {
    const pos = this.gameState.player.position;
    const distance = pos.length();
    
    if (distance > this.sphereRadius - 1) {
      pos.normalize().multiplyScalar(this.sphereRadius - 1);
      this.gameState.setPlayerPosition(pos);
    }
  }

  private constrainToOuterSurface() {
    const pos = this.gameState.player.position;
    const distance = pos.length();
    
    if (distance < this.sphereRadius + 1) {
      pos.normalize().multiplyScalar(this.sphereRadius + 1);
      this.gameState.setPlayerPosition(pos);
    }
  }

  private updateAbyssMode(dt: number) {
    // Abyss mode: pull player toward center with tentacle effect
    const pos = this.gameState.player.position;
    const toCenter = pos.clone().normalize().multiplyScalar(-0.5 * dt);
    pos.add(toCenter);
    this.gameState.setPlayerPosition(pos);

    // After 3 seconds in abyss, respawn
    // This would need a timer in the state, simplified here
  }

  toggleWorldMode() {
    const newMode = this.gameState.worldMode === 'inside' ? 'outside' : 'inside';
    this.gameState.setWorldMode(newMode);
  }

  triggerCoreBreak() {
    this.gameState.setCoreIntact(false);
    this.gameState.setAbyssMode(true);
    
    // After 3 seconds, respawn
    setTimeout(() => {
      this.gameState.setAbyssMode(false);
      this.gameState.setCoreIntact(true);
      this.gameState.setPlayerPosition(new THREE.Vector3(0, this.sphereRadius - 2, 0));
    }, 3000);
  }
}
