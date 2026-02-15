import * as THREE from 'three';

export function findEmissiveParts(scene: THREE.Group): THREE.Mesh[] {
  const emissiveParts: THREE.Mesh[] = [];
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      if (material.emissive && material.emissive.getHex() !== 0) {
        emissiveParts.push(child);
      }
    }
  });
  
  return emissiveParts;
}

export function findBoneByName(scene: THREE.Group, name: string): THREE.Bone | null {
  let foundBone: THREE.Bone | null = null;
  
  scene.traverse((child) => {
    if (child instanceof THREE.Bone && child.name.toLowerCase().includes(name.toLowerCase())) {
      foundBone = child;
    }
  });
  
  return foundBone;
}

export function applyUfoMaterial(scene: THREE.Group) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      
      // Apply metallic look
      material.metalness = 0.9;
      material.roughness = 0.2;
      
      // Check if this is an emissive part (lights)
      if (child.name.toLowerCase().includes('light') || child.name.toLowerCase().includes('emissive')) {
        material.emissive = new THREE.Color(0x00aaff); // Blue
        material.emissiveIntensity = 2.0;
      }
    }
  });
}

export function applyCowMaterial(scene: THREE.Group) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      material.metalness = 0.0;
      material.roughness = 0.8;
    }
  });
}

export function applyCrocodileMaterial(scene: THREE.Group) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      
      // Green scaly look
      if (child.name.toLowerCase().includes('body') || child.name.toLowerCase().includes('scale')) {
        material.color = new THREE.Color(0x2d5016);
        material.roughness = 0.7;
        material.metalness = 0.1;
      }
      
      // White teeth
      if (child.name.toLowerCase().includes('teeth') || child.name.toLowerCase().includes('tooth')) {
        material.color = new THREE.Color(0xffffff);
        material.roughness = 0.3;
      }
    }
  });
}

export function applyPenguinMaterial(scene: THREE.Group) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      material.metalness = 0.0;
      material.roughness = 0.6;
      
      // Orange beak
      if (child.name.toLowerCase().includes('beak')) {
        material.color = new THREE.Color(0xff8800);
      }
    }
  });
}
