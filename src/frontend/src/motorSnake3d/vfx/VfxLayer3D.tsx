import { useEffect, useState } from 'react';
import { VfxBus } from './VfxBus';
import * as THREE from 'three';
import { RainbowRingEffect } from './effects/RainbowRingEffect';
import { DiscoGlintEffect } from './effects/DiscoGlintEffect';
import { ConfettiBurstEffect } from './effects/ConfettiBurstEffect';
import { PinkSmokeTrailEffect } from './effects/PinkSmokeTrailEffect';
import { useCameraShake } from './useCameraShake';

interface Effect {
  id: string;
  type: string;
  position: THREE.Vector3;
  direction?: THREE.Vector3;
}

export function VfxLayer3D() {
  const [effects, setEffects] = useState<Effect[]>([]);
  const { triggerShake } = useCameraShake();

  useEffect(() => {
    const unsubscribe = VfxBus.subscribe((event) => {
      const id = `${event.name}-${Date.now()}`;
      const position = event.payload?.position || new THREE.Vector3(0, 0, 0);

      // Trigger camera shake for eat hit
      if (event.name === 'eatHit') {
        triggerShake(2, 0.5);
      }

      // Add effect based on type
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

      setEffects(prev => [
        ...prev,
        {
          id,
          type: event.name,
          position: position.clone(),
          direction,
        },
      ]);
    });

    return unsubscribe;
  }, [triggerShake]);

  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      {effects.map(effect => {
        switch (effect.type) {
          case 'eatHit':
          case 'fireRing':
            return (
              <RainbowRingEffect
                key={effect.id}
                position={effect.position}
                onComplete={() => removeEffect(effect.id)}
              />
            );
          
          case 'freezeDome':
            return (
              <DiscoGlintEffect
                key={effect.id}
                position={effect.position}
                direction={effect.direction || new THREE.Vector3(1, 0, 0)}
                onComplete={() => removeEffect(effect.id)}
              />
            );
          
          case 'foldPulse':
            return (
              <ConfettiBurstEffect
                key={effect.id}
                position={effect.position}
                onComplete={() => removeEffect(effect.id)}
              />
            );
          
          default:
            return (
              <mesh key={effect.id} position={effect.position}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                  color={getEffectColor(effect.type)}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            );
        }
      })}
    </>
  );
}

function getEffectColor(type: string): string {
  switch (type) {
    case 'freezeDome': return '#00ffff';
    case 'foldPulse': return '#ff00ff';
    case 'fireRing': return '#ff6600';
    case 'blackhole': return '#9900ff';
    case 'star': return '#ffff00';
    case 'mirror': return '#00ffff';
    case 'gravityShift': return '#00ff00';
    case 'windPortal': return '#ffffff';
    default: return '#ffffff';
  }
}
