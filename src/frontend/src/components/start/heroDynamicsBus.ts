import * as THREE from 'three';

/**
 * Shared in-memory state bus for hero scene dynamics.
 * Enables communication between cows, UFOs, and VFX without prop drilling.
 */

export interface CowDynamicState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  reactionStartTime: number;
  reactionIntensity: number;
}

export interface UfoDynamicState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isDarting: boolean;
}

class HeroDynamicsBus {
  private cows: Map<number, CowDynamicState> = new Map();
  private ufos: Map<number, UfoDynamicState> = new Map();
  private timestamp: number = 0;

  updateCow(index: number, state: CowDynamicState) {
    this.cows.set(index, state);
  }

  getCow(index: number): CowDynamicState | undefined {
    return this.cows.get(index);
  }

  getAllCows(): CowDynamicState[] {
    return Array.from(this.cows.values());
  }

  updateUfo(index: number, state: UfoDynamicState) {
    this.ufos.set(index, state);
  }

  getUfo(index: number): UfoDynamicState | undefined {
    return this.ufos.get(index);
  }

  getAllUfos(): UfoDynamicState[] {
    return Array.from(this.ufos.values());
  }

  setTimestamp(time: number) {
    this.timestamp = time;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  clear() {
    this.cows.clear();
    this.ufos.clear();
    this.timestamp = 0;
  }
}

// Singleton instance for hero scene
export const heroDynamicsBus = new HeroDynamicsBus();
