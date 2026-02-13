export const GRID_SIZE = 20;
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const GRID_WIDTH = Math.floor(CANVAS_WIDTH / GRID_SIZE);
export const GRID_HEIGHT = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

export const BASE_SPEED = 150; // ms per move
export const SPEED_INCREASE_PER_LEVEL = 5;

export const POINTS_PER_COW = 100;
export const POINTS_PER_BOSS = 500;
export const SUPREME_COW_THRESHOLD = 1000;

export const BOSS_SPAWN_INTERVAL = 5; // Every 5 levels
export const UFO_SPAWN_INTERVAL = 2000; // Every 2 seconds (in ms)
export const INITIAL_SNAKE_LENGTH = 5; // Snake starts with 5 segments

export const PLANETS = ['MARS', 'TITAN', 'EUROPA'] as const;

export const PLANET_EFFECTS = {
  MARS: { slowZones: true, gravityMode: 'HIGH' as const },
  TITAN: { fogEffect: true, gravityMode: 'NORMAL' as const },
  EUROPA: { slippery: true, gravityMode: 'LOW' as const },
};
