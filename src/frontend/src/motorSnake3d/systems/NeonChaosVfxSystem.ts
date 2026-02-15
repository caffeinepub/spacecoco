import type { GameState } from '../state/gameState';
import { VfxBus } from '../vfx/VfxBus';
import * as THREE from 'three';

export class NeonChaosVfxSystem {
  private gameState: GameState;
  private shootingStarTimer = 0;
  private planetCollisionTimer = 0;
  private ufoLaserTimer = 0;
  private cowLaserTimer = 0;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number) {
    this.updateShootingStars(dt);
    this.updatePlanetCollisions(dt);
    this.updateUfoLasers(dt);
    this.updateCowLasers(dt);
  }

  private updateShootingStars(dt: number) {
    this.shootingStarTimer += dt;
    const interval = 1 + Math.random() * 1; // 1-2 seconds

    if (this.shootingStarTimer >= interval) {
      this.shootingStarTimer = 0;
      this.triggerShootingStar();
    }
  }

  private triggerShootingStar() {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40;
    const startPos = new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 30,
      Math.sin(angle) * radius
    );

    const direction = new THREE.Vector3(
      -Math.cos(angle),
      (Math.random() - 0.5) * 0.5,
      -Math.sin(angle)
    ).normalize();

    VfxBus.trigger('shootingStar', { position: startPos, direction });
  }

  private updatePlanetCollisions(dt: number) {
    this.planetCollisionTimer += dt;
    const interval = 3 + Math.random() * 1; // 3-4 seconds

    if (this.planetCollisionTimer >= interval) {
      this.planetCollisionTimer = 0;
      this.triggerPlanetCollision();
    }
  }

  private triggerPlanetCollision() {
    const angle = Math.random() * Math.PI * 2;
    const radius = 25;
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 20,
      Math.sin(angle) * radius
    );

    VfxBus.trigger('planetCollision', { position });
  }

  private updateUfoLasers(dt: number) {
    this.ufoLaserTimer += dt;
    
    if (this.ufoLaserTimer >= 0.8) {
      this.ufoLaserTimer = 0;
      
      const ufos = this.gameState.enemies.filter(e => e.type === 'ufo');
      if (ufos.length >= 2) {
        const ufo1 = ufos[Math.floor(Math.random() * ufos.length)];
        const ufo2 = ufos[Math.floor(Math.random() * ufos.length)];
        
        if (ufo1.id !== ufo2.id) {
          VfxBus.trigger('ufoLaser', {
            start: ufo1.position.clone(),
            end: ufo2.position.clone(),
          });
        }
      }
    }
  }

  private updateCowLasers(dt: number) {
    this.cowLaserTimer += dt;
    
    if (this.cowLaserTimer >= 1.2) {
      this.cowLaserTimer = 0;
      
      const cows = this.gameState.enemies.filter(e => e.type === 'cow');
      cows.forEach(cow => {
        const eyeOffset1 = new THREE.Vector3(0.3, 0.5, 0);
        const eyeOffset2 = new THREE.Vector3(-0.3, 0.5, 0);
        
        const direction = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize().multiplyScalar(15);
        
        VfxBus.trigger('cowEyeLaser', {
          start: cow.position.clone().add(eyeOffset1),
          end: cow.position.clone().add(eyeOffset1).add(direction),
        });
        
        VfxBus.trigger('cowEyeLaser', {
          start: cow.position.clone().add(eyeOffset2),
          end: cow.position.clone().add(eyeOffset2).add(direction),
        });
      });
    }
  }
}
