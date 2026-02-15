import { useEffect, useState } from 'react';
import { useGameState } from '../state/gameState';
import { EnemyEntity3D } from './EnemyEntity3D';
import { useEnemyModelCache } from './useEnemyModelCache';
import { ENEMY_MODEL_CATALOG } from './enemyModelCatalog';

export function EnemiesLayer3D() {
  const gameState = useGameState();
  const [modelPaths] = useState(() => 
    Object.values(ENEMY_MODEL_CATALOG).map(config => config.path)
  );
  
  const { loadedModels, isLoading, error } = useEnemyModelCache(modelPaths);

  useEffect(() => {
    if (error) {
      console.error('Failed to load enemy models:', error);
    }
  }, [error]);

  // Don't render enemies until models are loaded
  if (isLoading) {
    return null;
  }

  return (
    <group>
      {gameState.enemies.map(enemy => (
        <EnemyEntity3D 
          key={enemy.id} 
          enemy={enemy}
          loadedModels={loadedModels}
        />
      ))}
    </group>
  );
}
