import * as THREE from 'three';
import type { GameState } from '../state/gameState';

export class PlayerMotorSystem {
  private gameState: GameState;
  private baseSpeed = 5;
  private smoothingFactor = 0.1;
  private aggressiveFactor = 0.5;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number, analogVector: THREE.Vector2, acceleration: number, brake: boolean) {
    // Apply ghost replacement speed boost
    const speedMultiplier = this.gameState.ghostReplaced ? 1.5 : 1.0;
    
    // Apply baby penguin slow
    const penguinSlow = 1 - (this.gameState.babyPenguins.length * 0.1);
    
    const effectiveSpeed = this.baseSpeed * speedMultiplier * penguinSlow * this.gameState.gravityMultiplier;

    // Determine movement style based on acceleration
    const isAggressive = acceleration > 0.5;
    const factor = isAggressive ? this.aggressiveFactor : this.smoothingFactor;

    // Convert analog input to 3D velocity
    const inputVel = new THREE.Vector3(analogVector.x, analogVector.y, 0).multiplyScalar(effectiveSpeed);
    
    // Smooth or aggressive interpolation
    const currentVel = this.gameState.player.velocity;
    const newVel = currentVel.clone().lerp(inputVel, factor);
    
    // Add oscillation for aggressive movement
    if (isAggressive) {
      const oscillation = Math.sin(Date.now() * 0.01) * 2;
      newVel.z += oscillation;
    }

    this.gameState.setPlayerVelocity(newVel);

    // Update position
    const newPos = this.gameState.player.position.clone().add(newVel.clone().multiplyScalar(dt));
    this.gameState.setPlayerPosition(newPos);

    // Handle brake (triggers tail whip)
    if (brake) {
      // Tail system will handle the whip
    }
  }

  shake() {
    // Remove all baby penguins
    this.gameState.babyPenguins.forEach(p => {
      this.gameState.removeBabyPenguin(p.id);
    });
  }
}
