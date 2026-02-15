import * as THREE from 'three';

/**
 * Shared neon UFO glow material system with breathing pulse, color cycling,
 * and sharp white edge highlights applied via shader customization.
 */

// Neon palette for color cycling (purple → blue → green)
const NEON_PALETTE = [
  new THREE.Color('#bf00ff'), // neon purple
  new THREE.Color('#00ffff'), // electric blue/cyan
  new THREE.Color('#39ff14'), // acid green
];

// Registry of materials that need time-based updates
const materialRegistry = new Set<THREE.MeshPhysicalMaterial>();

/**
 * Creates a neon glow material with breathing pulse and color cycling.
 * Uses onBeforeCompile to inject custom shader code for rim lighting and dynamic effects.
 */
export function createNeonUfoGlowMaterial(): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: NEON_PALETTE[0].clone(),
    emissive: NEON_PALETTE[0].clone(),
    emissiveIntensity: 2.0,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  // Add custom uniforms for time-based animation
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    shader.uniforms.breathIntensity = { value: 1.0 };

    // Inject time uniform into vertex shader
    shader.vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      `
    );

    // Inject rim lighting and glow into fragment shader
    shader.fragmentShader = `
      uniform float time;
      uniform float breathIntensity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      ${shader.fragmentShader}
    `.replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      
      // Rim lighting for sharp white edges
      vec3 viewDir = normalize(vViewPosition);
      float rimPower = 3.0;
      float rimStrength = pow(1.0 - max(dot(vNormal, viewDir), 0.0), rimPower);
      vec3 rimColor = vec3(1.0, 1.0, 1.0) * rimStrength * 2.0;
      
      // Breathing pulse
      float breathPhase = sin(time * 1.5) * 0.5 + 0.5;
      float pulseIntensity = 1.0 + breathPhase * breathIntensity;
      
      // Apply rim and pulse to emissive
      totalEmissiveRadiance *= pulseIntensity;
      totalEmissiveRadiance += rimColor;
      `
    );

    // Store shader reference for updates
    (material as any).userData.shader = shader;
  };

  // Register for updates
  materialRegistry.add(material);

  return material;
}

/**
 * Applies the shared neon glow material to all meshes in a scene via traversal.
 * Preserves geometry and transforms, only replaces materials.
 */
export function applyNeonUfoGlowToScene(scene: THREE.Group): void {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose old material
      if (child.material instanceof THREE.Material) {
        child.material.dispose();
      }

      // Apply shared neon material
      child.material = createNeonUfoGlowMaterial();
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Updates all registered neon materials with current time for animation.
 * Call once per frame from the render loop.
 */
export function updateNeonUfoGlowMaterials(elapsedTime: number): void {
  // Calculate color cycling (3-second cycle through palette)
  const cycleTime = elapsedTime * 0.5; // Slower cycle
  const paletteIndex = Math.floor(cycleTime) % NEON_PALETTE.length;
  const nextIndex = (paletteIndex + 1) % NEON_PALETTE.length;
  const blend = (cycleTime % 1.0);

  const currentColor = NEON_PALETTE[paletteIndex].clone();
  const nextColor = NEON_PALETTE[nextIndex];
  currentColor.lerp(nextColor, blend);

  // Breathing pulse intensity
  const breathPhase = Math.sin(elapsedTime * 1.5) * 0.5 + 0.5;
  const breathIntensity = 1.5 + breathPhase * 1.5; // Range: 1.5 to 3.0

  // Update all registered materials
  materialRegistry.forEach((material) => {
    // Update color and emissive
    material.color.copy(currentColor);
    material.emissive.copy(currentColor);
    material.emissiveIntensity = breathIntensity;

    // Update shader uniforms if available
    const shader = (material as any).userData?.shader;
    if (shader && shader.uniforms) {
      shader.uniforms.time.value = elapsedTime;
      shader.uniforms.breathIntensity.value = breathIntensity * 0.5;
    }
  });
}

/**
 * Cleans up material registry (call on unmount if needed).
 */
export function clearNeonUfoGlowRegistry(): void {
  materialRegistry.forEach((material) => {
    material.dispose();
  });
  materialRegistry.clear();
}
