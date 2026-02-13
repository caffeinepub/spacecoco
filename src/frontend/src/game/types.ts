export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {
  direction?: Direction;
}

export interface Snake {
  segments: SnakeSegment[];
  direction: Direction;
  nextDirection: Direction;
  skinId: number;
  isAlive: boolean;
}

export type Planet = 'MARS' | 'TITAN' | 'EUROPA';

export type GravityMode = 'LOW' | 'NORMAL' | 'HIGH';

export interface PlanetModifier {
  planet: Planet;
  effect: string;
  gravityMode: GravityMode;
}

export type PowerUpType = 'RED_LASER' | 'BLUE_LASER' | 'GREEN_LASER';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  active: boolean;
}

export interface Obstacle {
  id: string;
  type: 'UFO' | 'FLYING_COW' | 'CRATER' | 'ICE_PATCH' | 'UFO_WITH_COW' | 'CROCODILE' | 'POINT_DROP';
  position: Position;
  active: boolean;
  velocity?: { x: number; y: number };
  linkedCowId?: string;
  animationFrame?: number;
  pointValue?: number;
}

export interface Boss {
  type: 'PENGUIN' | 'SUPREME_COW';
  position: Position;
  health: number;
  circleProgress: number;
  active: boolean;
}

export interface OpponentSnake {
  id: string;
  segments: SnakeSegment[];
  direction: Direction;
  isAlive: boolean;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  amount: number;
  createdAt: number;
  duration: number;
  color: string;
}

export interface GameState {
  snake: Snake;
  opponents: OpponentSnake[];
  score: number;
  level: number;
  eliminations: number;
  planet: Planet;
  gravityMode: GravityMode;
  powerUps: PowerUp[];
  obstacles: Obstacle[];
  boss: Boss | null;
  isGameOver: boolean;
  isPaused: boolean;
  lasers: Array<{ id: string; startX: number; startY: number; endX: number; endY: number; createdAt: number; duration: number }>;
  explosions: Array<{ id: string; x: number; y: number; createdAt: number; duration: number }>;
  scorePopups: ScorePopup[];
}
