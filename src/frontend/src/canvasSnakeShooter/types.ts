export interface Vector2 {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
  angle: number;
}

export interface Snake {
  segments: SnakeSegment[];
  direction: Vector2;
  nextDirection: Vector2;
  growthPending: number;
  speed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Food {
  x: number;
  y: number;
  radius: number;
}

export type EnemyType = 'UFO' | 'COW' | 'PENGUIN';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shootTimer: number;
  shootCooldown: number;
  phase: number;
  seed: number;
  radius: number;
}

export interface Laser {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  createdAt: number;
  lifetime: number;
  enemyId: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  vx: number;
}

export interface Meteorite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export interface RainbowBurst {
  x: number;
  y: number;
  particles: Particle[];
  createdAt: number;
}

export interface BackgroundState {
  stars: Star[];
  meteorites: Meteorite[];
  rainbowBursts: RainbowBurst[];
}

export interface GameState {
  snake: Snake;
  food: Food | null;
  enemies: Enemy[];
  lasers: Laser[];
  particles: Particle[];
  background: BackgroundState;
  score: number;
  isGameOver: boolean;
  time: number;
}
