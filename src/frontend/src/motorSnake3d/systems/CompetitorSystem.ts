import * as THREE from 'three';
import type { GameState, Competitor, TailSegment, Enemy } from '../state/gameState';

export class CompetitorSystem {
  private gameState: GameState;
  private initialized = false;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  update(dt: number) {
    // Initialize competitors on first update
    if (!this.initialized) {
      this.spawnInitialCompetitors();
      this.initialized = true;
    }

    // Update each competitor
    this.gameState.competitors.forEach(competitor => {
      this.updateCompetitorAI(competitor, dt);
      this.updateCompetitorTail(competitor, dt);
      this.checkCompetitorCollisions(competitor);
    });
  }

  private spawnInitialCompetitors() {
    const colors = ['#ff00ff', '#00ffff', '#ffff00'];
    
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI * 2;
      const radius = 15;
      
      const competitor: Competitor = {
        id: `competitor-${i}`,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        tailSegments: [],
        score: 0,
        color: colors[i],
      };

      // Add initial tail segments
      for (let j = 0; j < 3; j++) {
        competitor.tailSegments.push({
          position: competitor.position.clone(),
          rotation: new THREE.Euler(0, 0, 0),
          scale: 1,
        });
      }

      this.gameState.addCompetitor(competitor);
    }
  }

  private updateCompetitorAI(competitor: Competitor, dt: number) {
    // Find nearest UFO (food)
    const nearestUFO = this.findNearestUFO(competitor.position);
    
    if (nearestUFO) {
      // Steer toward UFO
      const direction = new THREE.Vector3()
        .subVectors(nearestUFO.position, competitor.position)
        .normalize();
      
      const steerForce = direction.multiplyScalar(3);
      competitor.velocity.add(steerForce.multiplyScalar(dt));
    } else {
      // Wander behavior
      const wanderForce = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      competitor.velocity.add(wanderForce.multiplyScalar(dt));
    }

    // Limit speed
    const maxSpeed = 8;
    if (competitor.velocity.length() > maxSpeed) {
      competitor.velocity.normalize().multiplyScalar(maxSpeed);
    }

    // Update position
    competitor.position.add(competitor.velocity.clone().multiplyScalar(dt));

    // Boundary wrapping
    const maxDist = 30;
    if (competitor.position.length() > maxDist) {
      competitor.position.normalize().multiplyScalar(-maxDist * 0.9);
    }

    this.gameState.updateCompetitor(competitor.id, {
      position: competitor.position,
      velocity: competitor.velocity,
    });
  }

  private updateCompetitorTail(competitor: Competitor, dt: number) {
    if (competitor.tailSegments.length === 0) return;

    // Update tail segments to follow
    const segments = [...competitor.tailSegments];
    const spacing = 1.8;

    for (let i = 0; i < segments.length; i++) {
      const target = i === 0 ? competitor.position : segments[i - 1].position;
      const segment = segments[i];
      
      const direction = new THREE.Vector3().subVectors(target, segment.position);
      const distance = direction.length();
      
      if (distance > spacing) {
        direction.normalize().multiplyScalar(distance - spacing);
        segment.position.add(direction.multiplyScalar(0.1));
      }
    }

    this.gameState.updateCompetitor(competitor.id, {
      tailSegments: segments,
    });
  }

  private checkCompetitorCollisions(competitor: Competitor) {
    // Check collision with UFOs
    this.gameState.enemies.forEach(enemy => {
      if (enemy.type === 'ufo' && enemy.active) {
        const distance = competitor.position.distanceTo(enemy.position);
        
        if (distance < 3) {
          // Competitor eats UFO
          this.gameState.removeEnemy(enemy.id);
          
          // Grow tail
          const lastSegment = competitor.tailSegments[competitor.tailSegments.length - 1];
          if (lastSegment) {
            const newSegment: TailSegment = {
              position: lastSegment.position.clone(),
              rotation: new THREE.Euler(0, 0, 0),
              scale: 1,
            };
            
            const updatedSegments = [...competitor.tailSegments, newSegment];
            const newScore = competitor.score + 10;
            
            this.gameState.updateCompetitor(competitor.id, {
              tailSegments: updatedSegments,
              score: newScore,
            });
          }
        }
      }
    });
  }

  private findNearestUFO(position: THREE.Vector3): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;

    this.gameState.enemies.forEach(enemy => {
      if (enemy.type === 'ufo' && enemy.active) {
        const distance = position.distanceTo(enemy.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = enemy;
        }
      }
    });

    return nearest;
  }
}
