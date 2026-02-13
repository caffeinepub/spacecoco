import { useRef, useState, useCallback, useEffect } from 'react';
import type { GameState, Direction, Obstacle, Boss, SnakeSegment } from '../types';
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  BASE_SPEED, 
  GRID_SIZE,
  BOSS_SPAWN_INTERVAL,
  UFO_SPAWN_INTERVAL,
  CROCODILE_SPAWN_INTERVAL,
  INITIAL_SNAKE_LENGTH,
  UFO_GROWTH_AMOUNT,
  POINTS_PER_COW,
  POINTS_PER_PENGUIN,
  POINTS_PER_CROCODILE,
  TONGUE_CADENCE,
} from '../constants';
import { StarfieldRenderer } from '../render/starfield';
import { renderUFO, renderCow, renderPenguinBoss } from '../render/obstacles';
import { renderSnake, renderCrocodile } from '../render/entities';
import { renderLaser, renderExplosion } from '../render/vfx';
import { loadAllSprites } from '../render/sprites';

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mode: string,
  isMuted: boolean = false,
  onLaserFired?: () => void,
  onCowEaten?: () => void
) {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);

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
    lasers: [],
    explosions: [],
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const [spriteLoadError, setSpriteLoadError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const lastUFOSpawnRef = useRef<number>(0);
  const lastCrocodileSpawnRef = useRef<number>(0);
  const lastTongueRef = useRef<number>(0);
  const starfieldRef = useRef<StarfieldRenderer | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const spritesLoadedRef = useRef<boolean>(false);
  const keysPressed = useRef<Set<string>>(new Set());

  // Load sprites on mount
  useEffect(() => {
    loadAllSprites()
      .then(() => {
        console.log('✅ All sprites loaded successfully');
        setSpritesLoaded(true);
        spritesLoadedRef.current = true;
      })
      .catch(err => {
        console.error('❌ Failed to load sprites:', err);
        setSpriteLoadError(err.message || 'Failed to load game assets');
        // Still allow minimal rendering
        setSpritesLoaded(false);
        spritesLoadedRef.current = false;
      });
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnUFOWithCow = useCallback(() => {
    const ufoId = `ufo-${Date.now()}`;
    const cowId = `cow-${Date.now()}`;
    const spawnX = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
    
    const ufo: Obstacle = {
      id: ufoId,
      type: 'UFO_WITH_COW',
      position: { x: spawnX, y: -2 },
      active: true,
      velocity: { x: 0, y: 0.5 },
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

  const spawnCrocodile = useCallback(() => {
    const crocodileId = `croc-${Date.now()}`;
    const spawnX = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
    const spawnY = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
    
    const crocodile: Obstacle = {
      id: crocodileId,
      type: 'CROCODILE',
      position: { x: spawnX, y: spawnY },
      active: true,
      velocity: { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.3 },
      animationFrame: 0,
    };

    setGameState(prev => {
      const newState = {
        ...prev,
        obstacles: [...prev.obstacles, crocodile],
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

  const updateGame = useCallback(() => {
    setGameState(prev => {
      const newSnake = { ...prev.snake };
      newSnake.direction = newSnake.nextDirection;

      // Move snake head
      const head = { ...newSnake.segments[0] };
      switch (newSnake.direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check border collision
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        const newState = { ...prev, isGameOver: true };
        gameStateRef.current = newState;
        setIsGameOver(true);
        return newState;
      }

      // Check self collision
      const hitSelf = newSnake.segments.some(seg => seg.x === head.x && seg.y === head.y);
      if (hitSelf) {
        const newState = { ...prev, isGameOver: true };
        gameStateRef.current = newState;
        setIsGameOver(true);
        return newState;
      }

      // Check collisions with obstacles
      let scoreIncrease = 0;
      let growthAmount = 0;
      const updatedObstacles = prev.obstacles.map(obstacle => {
        if (obstacle.velocity) {
          const newPos = {
            x: obstacle.position.x + obstacle.velocity.x,
            y: obstacle.position.y + obstacle.velocity.y,
          };
          
          // Update animation frame for crocodiles
          if (obstacle.type === 'CROCODILE') {
            return {
              ...obstacle,
              position: newPos,
              animationFrame: (obstacle.animationFrame || 0) + 0.2,
            };
          }
          
          return { ...obstacle, position: newPos };
        }
        return obstacle;
      }).filter(obstacle => {
        // Check collision with snake head
        const gridX = Math.floor(obstacle.position.x);
        const gridY = Math.floor(obstacle.position.y);
        
        if (gridX === head.x && gridY === head.y) {
          if (obstacle.type === 'UFO_WITH_COW') {
            growthAmount += UFO_GROWTH_AMOUNT;
            return false; // Remove UFO
          } else if (obstacle.type === 'FLYING_COW') {
            scoreIncrease += POINTS_PER_COW;
            if (onCowEaten) onCowEaten();
            return false; // Remove cow
          } else if (obstacle.type === 'CROCODILE') {
            scoreIncrease += POINTS_PER_CROCODILE;
            return false; // Remove crocodile
          }
        }

        // Remove obstacles off screen
        return obstacle.position.y < GRID_HEIGHT + 2 && obstacle.position.y > -3;
      });

      // Check boss collision
      let bossBonus = 0;
      if (prev.boss && prev.boss.active) {
        const bossGridX = Math.floor(prev.boss.position.x);
        const bossGridY = Math.floor(prev.boss.position.y);
        
        if (bossGridX === head.x && bossGridY === head.y) {
          bossBonus = POINTS_PER_PENGUIN;
        }
      }

      // Update snake segments
      newSnake.segments = [head, ...newSnake.segments.slice(0, -1)];
      
      // Grow snake if needed
      if (growthAmount > 0) {
        for (let i = 0; i < growthAmount; i++) {
          const tail = newSnake.segments[newSnake.segments.length - 1];
          newSnake.segments.push({ ...tail });
        }
      }

      // Clean up old VFX
      const now = Date.now();
      const activeLasers = prev.lasers.filter(l => now - l.createdAt < l.duration);
      const activeExplosions = prev.explosions.filter(e => now - e.createdAt < e.duration);

      const newState = {
        ...prev,
        snake: newSnake,
        obstacles: updatedObstacles,
        score: prev.score + scoreIncrease + bossBonus + 1,
        lasers: activeLasers,
        explosions: activeExplosions,
      };
      
      gameStateRef.current = newState;
      return newState;
    });
  }, [onCowEaten]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, now: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (starfieldRef.current) {
      starfieldRef.current.render(ctx);
    }

    const currentState = gameStateRef.current;

    // Only render sprites if they're loaded
    if (spritesLoadedRef.current) {
      // Render obstacles
      currentState.obstacles.forEach(obstacle => {
        const pixelX = obstacle.position.x * GRID_SIZE;
        const pixelY = obstacle.position.y * GRID_SIZE;

        if (obstacle.type === 'UFO_WITH_COW') {
          renderUFO(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
        } else if (obstacle.type === 'FLYING_COW') {
          renderCow(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
        } else if (obstacle.type === 'CROCODILE') {
          renderCrocodile(ctx, obstacle.position, obstacle.animationFrame || 0);
        }
      });

      // Render boss
      if (currentState.boss && currentState.boss.active) {
        const pixelX = currentState.boss.position.x * GRID_SIZE;
        const pixelY = currentState.boss.position.y * GRID_SIZE;
        renderPenguinBoss(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
      }

      // Render VFX
      currentState.lasers.forEach(laser => renderLaser(ctx, laser, now));
      currentState.explosions.forEach(explosion => renderExplosion(ctx, explosion, now));

      // Render snake with tongue animation
      const showTongue = (now - lastTongueRef.current) % TONGUE_CADENCE < 200;
      renderSnake(ctx, currentState.snake.segments, showTongue);
    } else {
      // Fallback: render simple colored rectangles if sprites aren't loaded
      ctx.fillStyle = '#00ff00';
      currentState.snake.segments.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      });
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    const currentState = gameStateRef.current;

    if (!currentState.isPaused && !currentState.isGameOver) {
      // Spawn UFOs
      if (now - lastUFOSpawnRef.current >= UFO_SPAWN_INTERVAL) {
        spawnUFOWithCow();
        lastUFOSpawnRef.current = now;
      }

      // Spawn crocodiles
      if (now - lastCrocodileSpawnRef.current >= CROCODILE_SPAWN_INTERVAL) {
        spawnCrocodile();
        lastCrocodileSpawnRef.current = now;
      }

      // Spawn boss
      if (!currentState.boss && currentState.level % BOSS_SPAWN_INTERVAL === 0 && currentState.level > 0) {
        spawnPenguinBoss();
      }
    }

    if (delta >= BASE_SPEED && !currentState.isPaused && !currentState.isGameOver) {
      updateGame();
      lastUpdateRef.current = now;
    }

    renderGame(ctx, now);

    if (!currentState.isGameOver && !currentState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [spawnUFOWithCow, spawnCrocodile, spawnPenguinBoss, updateGame, renderGame]);

  const startGame = useCallback(() => {
    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

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
      lasers: [],
      explosions: [],
    };
    setGameState(newState);
    gameStateRef.current = newState;
    setIsGameOver(false);
    lastUpdateRef.current = Date.now();
    lastUFOSpawnRef.current = Date.now();
    lastCrocodileSpawnRef.current = Date.now();
    lastTongueRef.current = Date.now();
    
    if (!starfieldRef.current && canvasRef.current) {
      starfieldRef.current = new StarfieldRenderer(
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    
    // Start the game loop immediately
    gameLoop();
  }, [gameLoop]);

  const pauseGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
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
  }, [gameLoop]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key);
    
    const currentState = gameStateRef.current;
    if (currentState.isPaused || currentState.isGameOver) return;

    let newDirection: Direction | null = null;

    if (e.key === 'ArrowUp' && currentState.snake.direction !== 'DOWN') {
      newDirection = 'UP';
    } else if (e.key === 'ArrowDown' && currentState.snake.direction !== 'UP') {
      newDirection = 'DOWN';
    } else if (e.key === 'ArrowLeft' && currentState.snake.direction !== 'RIGHT') {
      newDirection = 'LEFT';
    } else if (e.key === 'ArrowRight' && currentState.snake.direction !== 'LEFT') {
      newDirection = 'RIGHT';
    }

    if (newDirection) {
      setGameState(prev => {
        const newState = {
          ...prev,
          snake: {
            ...prev.snake,
            nextDirection: newDirection!,
          },
        };
        gameStateRef.current = newState;
        return newState;
      });
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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
    spritesLoaded,
    spriteLoadError,
  };
}
