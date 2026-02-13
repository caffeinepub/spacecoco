export const GRID_SIZE = 20;
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const GRID_WIDTH = Math.floor(CANVAS_WIDTH / GRID_SIZE);
export const GRID_HEIGHT = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

export const BASE_SPEED = 150; // ms per move
export const SPEED_INCREASE_PER_LEVEL = 5;

export const POINTS_PER_COW = 150; // Bonus points for cows
export const POINTS_PER_PENGUIN = 300; // Bonus points for penguin boss
export const POINTS_PER_CROCODILE = 100; // Bonus points for crocodiles
export const POINTS_PER_BOSS = 500;
export const POINTS_PER_ELIMINATION = 250; // Points for eliminating opponent
export const POINTS_PER_POINT_DROP = 50; // Points for collecting dropped points
export const SUPREME_COW_THRESHOLD = 1000;

export const UFO_GROWTH_AMOUNT = 3; // Snake grows by 3 segments when eating UFO
export const POINT_DROP_GROWTH_AMOUNT = 1; // Snake grows by 1 segment per point drop
export const BOSS_SPAWN_INTERVAL = 5; // Every 5 levels
export const UFO_SPAWN_INTERVAL = 2000; // Every 2 seconds (in ms)
export const CROCODILE_SPAWN_INTERVAL = 4000; // Every 4 seconds (in ms)
export const INITIAL_SNAKE_LENGTH = 5; // Snake starts with 5 segments
export const ELIMINATION_POINT_DROPS = 5; // Number of point drops when eliminating opponent

export const TONGUE_CADENCE = 1000; // Show tongue every 1 second (in ms)

export const PLANETS = ['MARS', 'TITAN', 'EUROPA'] as const;

export const PLANET_EFFECTS = {
  MARS: { slowZones: true, gravityMode: 'HIGH' as const },
  TITAN: { fogEffect: true, gravityMode: 'NORMAL' as const },
  EUROPA: { slippery: true, gravityMode: 'LOW' as const },
};
