import { useRef, useState, useCallback, useEffect } from 'react';
import type { GameState, Direction, Obstacle, Boss, SnakeSegment } from '../types';
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  BASE_SPEED, 
  GRID_SIZE,
  BOSS_SPAWN_INTERVAL,
  UFO_SPAWN_INTERVAL,
  INITIAL_SNAKE_LENGTH,
} from '../constants';
import { StarfieldRenderer } from '../render/starfield';
import { renderUFO, renderCow, renderPenguinBoss } from '../render/obstacles';

export function useGameLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>, mode: string) {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);

  // Create initial snake with 5 segments centered
  const createInitialSnake = (): SnakeSegment[] => {
    const segments: SnakeSegment[] = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      segments.push({ x: centerX - i, y: centerY });
    }
    return segments;
  };

  const [gameState, setGameState] = useState<GameState>({
    snake: {
      segments: createInitialSnake(),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      skinId: 0,
      isAlive: true,
    },
    score: 0,
    level: 1,
    planet: 'MARS',
    gravityMode: 'NORMAL',
    powerUps: [],
    obstacles: [],
    boss: null,
    isGameOver: false,
    isPaused: false,
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const lastUFOSpawnRef = useRef<number>(0);
  const starfieldRef = useRef<StarfieldRenderer | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const startGame = useCallback(() => {
    const newState: GameState = {
      snake: {
        segments: createInitialSnake(),
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        skinId: 0,
        isAlive: true,
      },
      score: 0,
      level: 1,
      planet: 'MARS',
      gravityMode: 'NORMAL',
      powerUps: [],
      obstacles: [],
      boss: null,
      isGameOver: false,
      isPaused: false,
    };
    setGameState(newState);
    gameStateRef.current = newState;
    setIsGameOver(false);
    lastUpdateRef.current = Date.now();
    lastUFOSpawnRef.current = Date.now();
    
    // Initialize starfield if not already done
    if (!starfieldRef.current && canvasRef.current) {
      starfieldRef.current = new StarfieldRenderer(
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    
    gameLoop();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isPaused: true };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, isPaused: false };
      gameStateRef.current = newState;
      return newState;
    });
    lastUpdateRef.current = Date.now();
    gameLoop();
  }, []);

  const spawnUFOWithCow = useCallback(() => {
    const ufoId = `ufo-${Date.now()}`;
    const cowId = `cow-${Date.now()}`;
    const spawnX = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
    
    const ufo: Obstacle = {
      id: ufoId,
      type: 'UFO_WITH_COW',
      position: { x: spawnX, y: -2 }, // Start above visible area
      active: true,
      velocity: { x: 0, y: 0.5 }, // Descend slowly
      linkedCowId: cowId,
    };

    const cow: Obstacle = {
      id: cowId,
      type: 'FLYING_COW',
      position: { x: spawnX, y: -1 },
      active: true,
      velocity: { x: 0, y: 0.5 },
    };

    setGameState(prev => {
      const newState = {
        ...prev,
        obstacles: [...prev.obstacles, ufo, cow],
      };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  const spawnPenguinBoss = useCallback(() => {
    const boss: Boss = {
      type: 'PENGUIN',
      position: { x: centerX, y: centerY },
      health: 3,
      circleProgress: 0,
      active: true,
    };

    setGameState(prev => {
      const newState = {
        ...prev,
        boss,
      };
      gameStateRef.current = newState;
      return newState;
    });
  }, [centerX, centerY]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    const currentState = gameStateRef.current;

    // Check for UFO spawn (every 2 seconds during active gameplay)
    if (!currentState.isPaused && !currentState.isGameOver) {
      if (now - lastUFOSpawnRef.current >= UFO_SPAWN_INTERVAL) {
        spawnUFOWithCow();
        lastUFOSpawnRef.current = now;
      }
    }

    // Check for boss spawn (every 5 levels)
    if (!currentState.isPaused && !currentState.isGameOver && !currentState.boss) {
      if (currentState.level % BOSS_SPAWN_INTERVAL === 0 && currentState.level > 0) {
        spawnPenguinBoss();
      }
    }

    if (delta >= BASE_SPEED && !currentState.isPaused && !currentState.isGameOver) {
      updateGame();
      lastUpdateRef.current = now;
    }

    // Render
    renderGame(ctx);

    if (!currentState.isGameOver && !currentState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [spawnUFOWithCow, spawnPenguinBoss]);

  const updateGame = () => {
    setGameState(prev => {
      // Update obstacles (move descending UFOs and cows)
      const updatedObstacles = prev.obstacles.map(obstacle => {
        if (obstacle.velocity) {
          return {
            ...obstacle,
            position: {
              x: obstacle.position.x + obstacle.velocity.x,
              y: obstacle.position.y + obstacle.velocity.y,
            },
          };
        }
        return obstacle;
      }).filter(obstacle => {
        // Remove obstacles that have moved off screen
        return obstacle.position.y < GRID_HEIGHT + 2;
      });

      const newState = {
        ...prev,
        obstacles: updatedObstacles,
        score: prev.score + 1,
      };
      gameStateRef.current = newState;
      return newState;
    });
  };

  const renderGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas to black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render starfield background
    if (starfieldRef.current) {
      starfieldRef.current.render(ctx);
    }

    const currentState = gameStateRef.current;

    // Render obstacles (UFOs and cows)
    currentState.obstacles.forEach(obstacle => {
      const pixelX = obstacle.position.x * GRID_SIZE;
      const pixelY = obstacle.position.y * GRID_SIZE;

      if (obstacle.type === 'UFO_WITH_COW') {
        renderUFO(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
      } else if (obstacle.type === 'FLYING_COW') {
        renderCow(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
      }
    });

    // Render boss (penguin)
    if (currentState.boss && currentState.boss.active) {
      const pixelX = currentState.boss.position.x * GRID_SIZE;
      const pixelY = currentState.boss.position.y * GRID_SIZE;
      renderPenguinBoss(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
    }

    // Render snake (green at start)
    ctx.fillStyle = '#00FF00';
    currentState.snake.segments.forEach((segment, index) => {
      const pixelX = segment.x * GRID_SIZE;
      const pixelY = segment.y * GRID_SIZE;
      
      // Add slight gradient for depth
      if (index === 0) {
        // Head is brighter
        ctx.fillStyle = '#00FF00';
      } else {
        ctx.fillStyle = '#00DD00';
      }
      
      ctx.fillRect(pixelX + 1, pixelY + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    gameState,
    isGameOver,
    startGame,
    pauseGame,
    resumeGame,
  };
}
