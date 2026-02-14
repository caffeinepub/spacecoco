import type { GameState } from '../state/gameState';

export class MultiplayerBridge {
  private gameState: GameState;
  private onSubmitAction?: (action: string) => void;

  constructor(gameState: GameState, onSubmitAction?: (action: string) => void) {
    this.gameState = gameState;
    this.onSubmitAction = onSubmitAction;
  }

  submitPlayerAction(action: string) {
    this.onSubmitAction?.(action);
  }

  applyRemoteActions(actions: Array<{ player: string; action: string }>) {
    // Placeholder: apply remote player actions to game state
    actions.forEach(({ player, action }) => {
      console.log(`Remote action from ${player}:`, action);
    });
  }
}
