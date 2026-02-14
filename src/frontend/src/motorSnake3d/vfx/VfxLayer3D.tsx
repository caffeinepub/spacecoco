import { useEffect, useState } from 'react';
import { VfxBus } from './VfxBus';
import * as THREE from 'three';

export function VfxLayer3D() {
  const [effects, setEffects] = useState<Array<{ id: string; type: string; position: THREE.Vector3 }>>([]);

  useEffect(() => {
    const unsubscribe = VfxBus.subscribe((event) => {
      const id = `${event.name}-${Date.now()}`;
      
      setEffects(prev => [
        ...prev,
        {
          id,
          type: event.name,
          position: event.payload?.position || new THREE.Vector3(0, 0, 0),
        },
      ]);

      // Remove after animation
      setTimeout(() => {
        setEffects(prev => prev.filter(e => e.id !== id));
      }, 2000);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {effects.map(effect => (
        <mesh key={effect.id} position={effect.position}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={getEffectColor(effect.type)}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
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
