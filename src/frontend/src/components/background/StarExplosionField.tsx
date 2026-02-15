import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Explosion {
  id: string;
  position: THREE.Vector3;
  startTime: number;
  lifetime: number;
}

interface StarExplosionFieldProps {
  starPositions: THREE.Vector3[];
}

export function StarExplosionField({ starPositions }: StarExplosionFieldProps) {
  const explosionsRef = useRef<Explosion[]>([]);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastExplosionTime = useRef(0);

  const ringGeometry = useMemo(() => new THREE.RingGeometry(0.5, 1, 32), []);
  
  const rainbowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        opacity: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        void main() {
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float hue = (angle / 6.28318) + time * 0.5;
          vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0));
          gl_FragColor = vec4(color, opacity);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime;
    
    // Spawn new explosion every ~2 seconds
    if (currentTime - lastExplosionTime.current > 2 && starPositions.length > 0) {
      const randomStar = starPositions[Math.floor(Math.random() * starPositions.length)];
      const newExplosion: Explosion = {
        id: `explosion-${Date.now()}`,
        position: randomStar.clone(),
        startTime: currentTime,
        lifetime: 2,
      };
      
      explosionsRef.current.push(newExplosion);
      lastExplosionTime.current = currentTime;
      
      // Create mesh
      const mesh = new THREE.Mesh(ringGeometry, rainbowMaterial.clone());
      mesh.position.copy(randomStar);
      mesh.lookAt(state.camera.position);
      groupRef.current?.add(mesh);
      meshesRef.current.push(mesh);
    }

    // Update and clean up explosions
    explosionsRef.current = explosionsRef.current.filter((explosion, index) => {
      const age = currentTime - explosion.startTime;
      const progress = age / explosion.lifetime;
      
      if (progress >= 1) {
        // Remove mesh
        const mesh = meshesRef.current[index];
        if (mesh) {
          groupRef.current?.remove(mesh);
          mesh.geometry.dispose();
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        }
        meshesRef.current.splice(index, 1);
        return false;
      }
      
      // Update mesh
      const mesh = meshesRef.current[index];
      if (mesh) {
        const scale = 1 + progress * 4;
        mesh.scale.set(scale, scale, 1);
        mesh.lookAt(state.camera.position);
        
        if (mesh.material instanceof THREE.ShaderMaterial) {
          mesh.material.uniforms.time.value = age;
          mesh.material.uniforms.opacity.value = 1 - progress;
        }
      }
      
      return true;
    });
  });

  useEffect(() => {
    return () => {
      meshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
    };
  }, []);

  return <group ref={groupRef} />;
}
