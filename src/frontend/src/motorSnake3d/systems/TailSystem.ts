import * as THREE from 'three';
import type { GameState, TailSegment } from '../state/gameState';

export class TailSystem {
  private gameState: GameState;
  private segmentSpacing = 1.5;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number, brake: boolean, shake: boolean) {
    // Update tail segments to follow head
    this.updateTailFollow(dt);

    // Handle brake-triggered whip
    if (brake) {
      this.triggerWhip();
    }

    // Handle shake to remove baby penguins
    if (shake) {
      this.gameState.babyPenguins.forEach(p => {
        this.gameState.removeBabyPenguin(p.id);
      });
    }
  }

  private updateTailFollow(dt: number) {
    const segments = this.gameState.tailSegments;
    if (segments.length === 0) return;

    // First segment follows head
    const headPos = this.gameState.player.position;
    const firstSeg = segments[0];
    const toHead = headPos.clone().sub(firstSeg.position);
    
    if (toHead.length() > this.segmentSpacing) {
      firstSeg.position.add(toHead.normalize().multiplyScalar(dt * 5));
    }

    // Each segment follows the previous
    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1];
      const curr = segments[i];
      const toPrev = prev.position.clone().sub(curr.position);
      
      if (toPrev.length() > this.segmentSpacing) {
        curr.position.add(toPrev.normalize().multiplyScalar(dt * 5));
      }
    }
  }

  private triggerWhip() {
    // Apply impulse to player from tail coil
    const impulse = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize().multiplyScalar(5);

    const newVel = this.gameState.player.velocity.clone().add(impulse);
    this.gameState.setPlayerVelocity(newVel);
  }

  removeSegment(index: number) {
    this.gameState.removeTailSegment(index);
  }
}
