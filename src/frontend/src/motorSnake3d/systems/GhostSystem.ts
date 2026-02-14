import type { GameState } from '../state/gameState';

export class GhostSystem {
  private gameState: GameState;
  private influenceGrowthRate = 0.05;
  private replacementThreshold = 100;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number) {
    // Activate ghost after first death
    if (this.gameState.deathCount > 0 && !this.gameState.ghostActive) {
      this.gameState.setGhostActive(true);
    }

    if (!this.gameState.ghostActive) return;

    // Grow influence over time
    const newInfluence = this.gameState.ghostInfluence + this.influenceGrowthRate * dt;
    this.gameState.setGhostInfluence(newInfluence);

    // Check for replacement
    if (newInfluence >= this.replacementThreshold && !this.gameState.ghostReplaced) {
      this.gameState.setGhostReplaced(true);
    }
  }

  onPlayerDeath() {
    this.gameState.incrementDeathCount();
    
    if (this.gameState.deathCount === 1) {
      this.gameState.setGhostActive(true);
    }
  }
}
