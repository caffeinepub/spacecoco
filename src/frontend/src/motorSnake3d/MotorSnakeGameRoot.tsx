import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SphereWorld } from './render/SphereWorld';
import { PlayerSnake3D } from './render/PlayerSnake3D';
import { EnemiesLayer3D } from './render/EnemiesLayer3D';
import { BackgroundChaosLayer3D } from './render/BackgroundChaosLayer3D';
import { DebugWorldControls } from './ui/DebugWorldControls';
import { EnvironmentDebugPanel } from './ui/EnvironmentDebugPanel';
import { PowerUpStatusHUD } from './ui/PowerUpStatusHUD';
import { GhostOverlayHUD } from './ui/GhostOverlayHUD';
import { DebugSpawnPanel } from './ui/DebugSpawnPanel';
import { VfxLayer3D } from './vfx/VfxLayer3D';
import { VfxScreenOverlay } from './vfx/VfxScreenOverlay';
import { VirtualJoystick } from './input/VirtualJoystick';
import { useAnalogInput } from './input/useAnalogInput';
import { useGameState } from './state/gameState';
import { WorldSystem } from './systems/WorldSystem';
import { EnvironmentSystem } from './systems/EnvironmentSystem';
import { PlayerMotorSystem } from './systems/PlayerMotorSystem';
import { TailSystem } from './systems/TailSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { EnemySpawnerSystem } from './systems/EnemySpawnerSystem';
import { AnomalyPowerUpSystem } from './systems/AnomalyPowerUpSystem';
import { GhostSystem } from './systems/GhostSystem';
import { NeonChaosVfxSystem } from './systems/NeonChaosVfxSystem';
import { useFrame } from '@react-three/fiber';

interface MotorSnakeGameRootProps {
  isPaused: boolean;
  onIntensityChange?: (intensity: number) => void;
  onVfxTrigger?: (event: string, payload?: any) => void;
}

function GameLogic({ isPaused, onIntensityChange, onVfxTrigger }: MotorSnakeGameRootProps) {
  const gameState = useGameState();
  const { analogVector, acceleration, brake, shake } = useAnalogInput();
  
  const worldSystem = useRef(new WorldSystem(gameState));
  const environmentSystem = useRef(new EnvironmentSystem(gameState, onVfxTrigger));
  const playerMotorSystem = useRef(new PlayerMotorSystem(gameState));
  const tailSystem = useRef(new TailSystem(gameState));
  const collisionSystem = useRef(new CollisionSystem(gameState, onVfxTrigger));
  const enemySpawnerSystem = useRef(new EnemySpawnerSystem(gameState));
  const anomalyPowerUpSystem = useRef(new AnomalyPowerUpSystem(gameState, onVfxTrigger));
  const ghostSystem = useRef(new GhostSystem(gameState));
  const neonChaosVfxSystem = useRef(new NeonChaosVfxSystem(gameState));

  useFrame((state, delta) => {
    if (isPaused) return;

    const dt = Math.min(delta, 0.1); // Cap delta to prevent large jumps

    // Update all systems
    worldSystem.current.update(dt);
    environmentSystem.current.update(dt);
    playerMotorSystem.current.update(dt, analogVector, acceleration, brake);
    tailSystem.current.update(dt, brake, shake);
    collisionSystem.current.update(dt);
    enemySpawnerSystem.current.update(dt);
    anomalyPowerUpSystem.current.update(dt);
    ghostSystem.current.update(dt);
    neonChaosVfxSystem.current.update(dt);

    // Calculate gameplay intensity for audio
    const intensity = Math.min(1, (gameState.speed / 10) + (gameState.enemies.length / 20));
    onIntensityChange?.(intensity);
  });

  return null;
}

export function MotorSnakeGameRoot({ isPaused, onIntensityChange, onVfxTrigger }: MotorSnakeGameRootProps) {
  const gameState = useGameState();

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas with shadow support */}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        className="w-full h-full"
        dpr={[1, 2]}
        shadows
        gl={{ 
          antialias: true,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SphereWorld
          worldMode={gameState.worldMode}
          abyssMode={gameState.abyssMode}
          fogIntensity={gameState.fogIntensity}
        />
        <BackgroundChaosLayer3D />
        <PlayerSnake3D />
        <EnemiesLayer3D />
        <VfxLayer3D />
        <GameLogic
          isPaused={isPaused}
          onIntensityChange={onIntensityChange}
          onVfxTrigger={onVfxTrigger}
        />
      </Canvas>

      {/* Screen overlay for eat effect */}
      <VfxScreenOverlay />

      {/* Virtual Joystick for mobile */}
      <VirtualJoystick />

      {/* HUD Overlays */}
      <PowerUpStatusHUD />
      <GhostOverlayHUD />

      {/* Debug Panels */}
      <DebugWorldControls />
      <EnvironmentDebugPanel />
      <DebugSpawnPanel />
    </div>
  );
}
