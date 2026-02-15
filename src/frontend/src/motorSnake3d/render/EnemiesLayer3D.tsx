import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameState } from '../state/gameState';
import { EnemyEntity3D } from './EnemyEntity3D';
import { useEnemyModelCache } from './useEnemyModelCache';
import { ENEMY_MODEL_CATALOG } from './enemyModelCatalog';
import { updateNeonUfoGlowMaterials } from './neonUfoGlowMaterial';

export function EnemiesLayer3D() {
  const gameState = useGameState();
  const [modelPaths] = useState(() => 
    Object.values(ENEMY_MODEL_CATALOG).map(config => config.path)
  );
  
  const { loadedModels, isLoading, error } = useEnemyModelCache(modelPaths);

  useEffect(() => {
    if (error) {
      console.warn('Enemy models not available, using fallback primitives:', error);
    }
  }, [error]);

  // Update shared neon material system once per frame
  useFrame((state) => {
    updateNeonUfoGlowMaterials(state.clock.elapsedTime);
  });

  return (
    <group>
      {gameState.enemies.map(enemy => (
        <EnemyEntity3D 
          key={enemy.id} 
          enemy={enemy}
          loadedModels={loadedModels}
          forceGLB={!isLoading}
        />
      ))}
    </group>
  );
}
