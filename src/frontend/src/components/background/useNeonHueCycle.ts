import { useMemo } from 'react';
import * as THREE from 'three';

interface NeonPalette {
  colors: THREE.Color[];
  duration: number;
}

export function useNeonHueCycle(elapsedTime: number): THREE.Color {
  const palette = useMemo<NeonPalette>(() => ({
    colors: [
      new THREE.Color('#ff00ff'), // Fuchsia
      new THREE.Color('#0080ff'), // Electric blue
      new THREE.Color('#00ff00'), // Lime green
      new THREE.Color('#ff6600'), // Fire orange
    ],
    duration: 4, // 1 second per color
  }), []);

  return useMemo(() => {
    const { colors, duration } = palette;
    const cycleTime = elapsedTime % duration;
    const segmentDuration = duration / colors.length;
    const currentIndex = Math.floor(cycleTime / segmentDuration);
    const nextIndex = (currentIndex + 1) % colors.length;
    const t = (cycleTime % segmentDuration) / segmentDuration;

    const result = new THREE.Color();
    result.lerpColors(colors[currentIndex], colors[nextIndex], t);
    return result;
  }, [elapsedTime, palette]);
}
