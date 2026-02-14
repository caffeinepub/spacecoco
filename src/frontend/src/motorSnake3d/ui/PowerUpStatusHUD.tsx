import { Card } from '@/components/ui/card';
import { useGameState } from '../state/gameState';

export function PowerUpStatusHUD() {
  const { activePowerUp } = useGameState();

  if (!activePowerUp) return null;

  const remaining = activePowerUp.duration - activePowerUp.elapsed;
  const progress = (remaining / activePowerUp.duration) * 100;

  const getPowerUpInfo = () => {
    switch (activePowerUp.type) {
      case 'blackhole':
        return {
          name: 'Black Hole',
          color: 'text-purple-400',
          warning: 'Self-suction risk!',
        };
      case 'star':
        return {
          name: 'Shooting Star',
          color: 'text-yellow-400',
          warning: 'Melting fast!',
        };
      case 'mirror':
        return {
          name: 'Mirror',
          color: 'text-cyan-400',
          warning: 'Intangible!',
        };
    }
  };

  const info = getPowerUpInfo();

  return (
    <Card className="absolute top-4 right-4 p-4 bg-black/70 backdrop-blur border-accent/30 z-40 min-w-[200px]">
      <h3 className={`text-sm font-bold ${info.color} mb-2`}>{info.name}</h3>
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${info.color.replace('text', 'bg')} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-destructive">{info.warning}</p>
        <p className="text-xs text-muted-foreground">
          {remaining.toFixed(1)}s remaining
        </p>
      </div>
    </Card>
  );
}
