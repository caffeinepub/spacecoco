import type { GameState } from '../state/gameState';
import * as THREE from 'three';

export class EnvironmentSystem {
  private gameState: GameState;
  private gravityCycleTimer = 0;
  private gravityCycleDuration = 5; // 5 seconds
  private acidRainTimer = 0;
  private onVfxTrigger?: (event: string, payload?: any) => void;

  constructor(gameState: GameState, onVfxTrigger?: (event: string, payload?: any) => void) {
    this.gameState = gameState;
    this.onVfxTrigger = onVfxTrigger;
  }

  update(dt: number) {
    this.updateGravityCycle(dt);
    this.updateAcidRain(dt);
  }

  private updateGravityCycle(dt: number) {
    this.gravityCycleTimer += dt;
    
    if (this.gravityCycleTimer >= this.gravityCycleDuration) {
      this.gravityCycleTimer = 0;
    }

    // Cycle between 0x and 3x gravity
    const phase = this.gravityCycleTimer / this.gravityCycleDuration;
    const multiplier = Math.sin(phase * Math.PI * 2) * 1.5 + 1.5; // Range: 0 to 3
    
    if (Math.abs(multiplier - this.gameState.gravityMultiplier) > 0.5) {
      this.onVfxTrigger?.('gravityShift', { multiplier });
    }
    
    this.gameState.setGravityMultiplier(multiplier);
  }

  private updateAcidRain(dt: number) {
    if (!this.gameState.acidRainActive) return;

    this.acidRainTimer += dt;
    
    if (this.acidRainTimer >= 1.0) {
      this.acidRainTimer = 0;
      
      // Remove tail segment if no shield
      if (!this.gameState.shieldActive && this.gameState.tailSegments.length > 0) {
        this.gameState.removeTailSegment(this.gameState.tailSegments.length - 1);
      }
    }
  }

  spawnWindPortal(position: THREE.Vector3) {
    this.gameState.windPortals.push({ position: position.clone(), active: true });
    this.onVfxTrigger?.('windPortal', { position });
    
    // Apply radial force to player
    const toPlayer = this.gameState.player.position.clone().sub(position);
    const distance = toPlayer.length();
    const force = toPlayer.normalize().multiplyScalar(10 / (distance + 1));
    
    const newVel = this.gameState.player.velocity.clone().add(force);
    this.gameState.setPlayerVelocity(newVel);
  }

  triggerAcidRain() {
    this.gameState.setAcidRainActive(true);
    this.acidRainTimer = 0;
    
    setTimeout(() => {
      this.gameState.setAcidRainActive(false);
    }, 5000);
  }

  setFogIntensity(intensity: number) {
    this.gameState.setFogIntensity(Math.max(0, Math.min(1, intensity)));
  }
}
