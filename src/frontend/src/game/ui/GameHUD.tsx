import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GameState } from '../types';

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  const getPlanetColor = (planet: string) => {
    switch (planet) {
      case 'MARS': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TITAN': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'EUROPA': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-accent/30 neon-card">
      <div className="flex flex-wrap gap-6 justify-between items-center">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</p>
            <p className="text-5xl font-bold text-accent neon-text-glow font-display">{gameState.score}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Level</p>
            <p className="text-5xl font-bold text-secondary neon-text-glow-secondary font-display">{gameState.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Eliminations</p>
            <p className="text-5xl font-bold text-destructive neon-text-glow-red font-display">{gameState.eliminations || 0}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`${getPlanetColor(gameState.planet)} text-base px-4 py-2`}>
            {gameState.planet}
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2">
            Gravity: {gameState.gravityMode}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
