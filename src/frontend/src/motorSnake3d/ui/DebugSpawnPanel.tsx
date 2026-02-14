import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameState } from '../state/gameState';
import { EnemySpawnerSystem } from '../systems/EnemySpawnerSystem';
import { AnomalyPowerUpSystem } from '../systems/AnomalyPowerUpSystem';
import { useRef } from 'react';

export function DebugSpawnPanel() {
  const gameState = useGameState();
  const enemySpawner = useRef(new EnemySpawnerSystem(gameState));
  const anomalySpawner = useRef(new AnomalyPowerUpSystem(gameState));

  return (
    <Card className="absolute bottom-4 right-4 p-4 bg-black/70 backdrop-blur border-accent/30 z-40 w-48">
      <h3 className="text-sm font-bold text-accent mb-3">Spawn</h3>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Enemies</p>
          <div className="grid grid-cols-3 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => enemySpawner.current.spawnEnemy('cow')}
              className="text-xs p-1"
            >
              Cow
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => enemySpawner.current.spawnEnemy('ufo')}
              className="text-xs p-1"
            >
              UFO
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => enemySpawner.current.spawnEnemy('penguin')}
              className="text-xs p-1"
            >
              Penguin
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Anomalies</p>
          <div className="grid grid-cols-3 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => anomalySpawner.current.spawnAnomaly('blackhole')}
              className="text-xs p-1"
            >
              BH
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => anomalySpawner.current.spawnAnomaly('star')}
              className="text-xs p-1"
            >
              Star
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => anomalySpawner.current.spawnAnomaly('mirror')}
              className="text-xs p-1"
            >
              Mirror
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-accent/20">
          <p className="text-xs text-muted-foreground">
            Babies: {gameState.babyPenguins.length}
          </p>
        </div>
      </div>
    </Card>
  );
}
