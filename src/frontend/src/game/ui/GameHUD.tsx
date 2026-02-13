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
    <Card className="p-4 bg-card/50 backdrop-blur border-accent/30">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-accent">{gameState.score}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{gameState.level}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getPlanetColor(gameState.planet)}>
            {gameState.planet}
          </Badge>
          <Badge variant="outline">
            Gravity: {gameState.gravityMode}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
