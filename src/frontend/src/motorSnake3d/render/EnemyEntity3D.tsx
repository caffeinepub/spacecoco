import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Enemy } from '../state/gameState';
import { ENEMY_MODEL_CATALOG } from './enemyModelCatalog';
import { 
  applyUfoMaterial, 
  applyCowMaterial, 
  applyCrocodileMaterial, 
  applyPenguinMaterial,
  findBoneByName
} from './enemyModelRigging';
import { createNeonUfoGlowMaterial } from './neonUfoGlowMaterial';

interface ModelData {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

interface EnemyEntity3DProps {
  enemy: Enemy;
  loadedModels: Map<string, ModelData>;
  forceGLB?: boolean;
}

export function EnemyEntity3D({ enemy, loadedModels, forceGLB = false }: EnemyEntity3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hoverOffset = useRef(Math.random() * Math.PI * 2);
  const tailBoneRef = useRef<THREE.Bone | null>(null);

  const modelScene = useMemo(() => {
    const config = ENEMY_MODEL_CATALOG[enemy.type];
    if (!config) return null;

    const modelData = loadedModels.get(config.path);
    if (!modelData) return null;

    const clonedScene = modelData.scene.clone();
    
    // Apply shared neon UFO glow material to all enemy types
    switch (enemy.type) {
      case 'ufo':
        applyUfoMaterial(clonedScene);
        break;
      case 'cow':
        applyCowMaterial(clonedScene);
        tailBoneRef.current = findBoneByName(clonedScene, 'tail');
        break;
      case 'crocodile':
        applyCrocodileMaterial(clonedScene);
        break;
      case 'penguin':
        applyPenguinMaterial(clonedScene);
        break;
    }

    // Ensure shadow casting/receiving
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Setup animations if available
    if (modelData.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(clonedScene);
      mixerRef.current = mixer;
      
      const action = mixer.clipAction(modelData.animations[0]);
      action.play();
    }

    return clonedScene;
  }, [enemy.type, loadedModels]);

  useEffect(() => {
    if (modelScene && groupRef.current) {
      modelRef.current = modelScene;
      groupRef.current.add(modelScene);

      return () => {
        if (groupRef.current && modelScene) {
          groupRef.current.remove(modelScene);
        }
      };
    }
  }, [modelScene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    const config = ENEMY_MODEL_CATALOG[enemy.type];
    
    groupRef.current.position.copy(enemy.position);
    if (config) {
      groupRef.current.position.add(config.positionOffset);
      groupRef.current.scale.setScalar(config.scale);
    }
    
    if (modelRef.current) {
      switch (enemy.type) {
        case 'ufo':
          groupRef.current.position.y += Math.sin(time * 2 + hoverOffset.current) * 0.3;
          modelRef.current.rotation.y += delta * 0.5;
          break;
          
        case 'cow':
          groupRef.current.position.y += Math.sin(time * 2 + hoverOffset.current) * 0.5;
          
          if (tailBoneRef.current && !mixerRef.current) {
            tailBoneRef.current.rotation.z = Math.sin(time * 3) * 0.3;
          }
          
          modelRef.current.rotation.y += delta * 0.2;
          break;
          
        case 'crocodile':
          modelRef.current.rotation.y = Math.sin(time * 1.5) * 0.2;
          groupRef.current.position.y += Math.sin(time * 1.2) * 0.1;
          break;
          
        case 'penguin':
          const velocity = enemy.velocity.length();
          if (mixerRef.current) {
            mixerRef.current.timeScale = velocity < 0.5 ? 0.5 : 1.0;
          }
          
          modelRef.current.rotation.z = Math.sin(time * 2) * 0.1;
          break;
      }
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      const idleRotation = Math.sin(time * 0.5) * 0.05;
      modelRef.current.rotation.y += idleRotation * delta;
    }
  });

  // Fallback primitive mesh with shared neon effect
  if (!modelScene || (!forceGLB && loadedModels.size === 0)) {
    return (
      <mesh ref={groupRef as any} position={enemy.position} castShadow receiveShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <primitive object={createNeonUfoGlowMaterial()} attach="material" />
      </mesh>
    );
  }

  return <group ref={groupRef} />;
}
