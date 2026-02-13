import { useRef, useState, useCallback, useEffect } from 'react';
import type { GameState, Direction, Obstacle, Boss, SnakeSegment, OpponentSnake, ScorePopup } from '../types';
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
  POINTS_PER_ELIMINATION,
  POINTS_PER_POINT_DROP,
  POINT_DROP_GROWTH_AMOUNT,
  ELIMINATION_POINT_DROPS,
  TONGUE_CADENCE,
} from '../constants';
import { StarfieldRenderer } from '../render/starfield';
import { renderUFO, renderCow, renderPenguinBoss, renderPointDrop } from '../render/obstacles';
import { renderSnake, renderCrocodile, renderOpponentSnake } from '../render/entities';
import { renderLaser, renderExplosion, renderScorePopup } from '../render/vfx';
import { loadAllSprites } from '../render/sprites';

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mode: string,
  isMuted: boolean = false,
  onLaserFired?: () => void,
  onCowEaten?: () => void,
  onElimination?: () => void
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

  const createOpponentSnake = (id: string, startX: number, startY: number): OpponentSnake => {
    const segments: SnakeSegment[] = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      segments.push({ x: startX - i, y: startY });
    }
    return {
      id,
      segments,
      direction: 'RIGHT',
      isAlive: true,
    };
  };

  const [gameState, setGameState] = useState<GameState>({
    snake: {
      segments: createInitialSnake(),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      skinId: 0,
      isAlive: true,
    },
    opponents: [
      createOpponentSnake('opp1', Math.floor(GRID_WIDTH * 0.25), Math.floor(GRID_HEIGHT * 0.3)),
      createOpponentSnake('opp2', Math.floor(GRID_WIDTH * 0.75), Math.floor(GRID_HEIGHT * 0.7)),
    ],
    score: 0,
    level: 1,
    eliminations: 0,
    planet: 'MARS',
    gravityMode: 'NORMAL',
    powerUps: [],
    obstacles: [],
    boss: null,
    isGameOver: false,
    isPaused: false,
    lasers: [],
    explosions: [],
    scorePopups: [],
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

  const spawnPointDrops = useCallback((x: number, y: number, count: number) => {
    const drops: Obstacle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = 2;
      drops.push({
        id: `drop-${Date.now()}-${i}`,
        type: 'POINT_DROP',
        position: {
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
        },
        active: true,
        pointValue: POINTS_PER_POINT_DROP,
      });
    }

    setGameState(prev => {
      const newState = {
        ...prev,
        obstacles: [...prev.obstacles, ...drops],
      };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  const addScorePopup = useCallback((x: number, y: number, amount: number, color: string) => {
    const popup: ScorePopup = {
      id: `popup-${Date.now()}-${Math.random()}`,
      x,
      y,
      amount,
      createdAt: Date.now(),
      duration: 1500,
      color,
    };

    setGameState(prev => {
      const newState = {
        ...prev,
        scorePopups: [...prev.scorePopups, popup],
      };
      gameStateRef.current = newState;
      return newState;
    });
  }, []);

  const updateOpponents = useCallback((opponents: OpponentSnake[]): OpponentSnake[] => {
    return opponents.map(opp => {
      if (!opp.isAlive) return opp;

      const head = { ...opp.segments[0] };
      
      // Simple AI: move towards nearest food or random direction
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const validDirections = directions.filter(dir => {
        if (dir === 'UP' && opp.direction === 'DOWN') return false;
        if (dir === 'DOWN' && opp.direction === 'UP') return false;
        if (dir === 'LEFT' && opp.direction === 'RIGHT') return false;
        if (dir === 'RIGHT' && opp.direction === 'LEFT') return false;
        return true;
      });

      if (Math.random() < 0.1 && validDirections.length > 0) {
        opp.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      }

      switch (opp.direction) {
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

      // Wrap around borders for opponents
      if (head.x < 0) head.x = GRID_WIDTH - 1;
      if (head.x >= GRID_WIDTH) head.x = 0;
      if (head.y < 0) head.y = GRID_HEIGHT - 1;
      if (head.y >= GRID_HEIGHT) head.y = 0;

      return {
        ...opp,
        segments: [head, ...opp.segments.slice(0, -1)],
      };
    });
  }, []);

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

      // Check collisions with opponents (body-on-head elimination)
      let eliminationCount = 0;
      const updatedOpponents = prev.opponents.map(opp => {
        if (!opp.isAlive) return opp;

        const oppHead = opp.segments[0];
        
        // Check if player body hits opponent head
        const playerBodyHitsOppHead = newSnake.segments.slice(1).some(
          seg => seg.x === oppHead.x && seg.y === oppHead.y
        );

        if (playerBodyHitsOppHead) {
          eliminationCount++;
          spawnPointDrops(oppHead.x, oppHead.y, ELIMINATION_POINT_DROPS);
          addScorePopup(oppHead.x * GRID_SIZE, oppHead.y * GRID_SIZE, POINTS_PER_ELIMINATION, '#ff0066');
          if (onElimination) onElimination();
          
          // Respawn opponent
          return createOpponentSnake(
            opp.id,
            Math.floor(Math.random() * (GRID_WIDTH - 10)) + 5,
            Math.floor(Math.random() * (GRID_HEIGHT - 10)) + 5
          );
        }

        // Check if opponent body hits player head
        const oppBodyHitsPlayerHead = opp.segments.slice(1).some(
          seg => seg.x === head.x && seg.y === head.y
        );

        if (oppBodyHitsPlayerHead) {
          const newState = { ...prev, isGameOver: true };
          gameStateRef.current = newState;
          setIsGameOver(true);
          return opp;
        }

        return opp;
      });

      // Update opponent movement
      const movedOpponents = updateOpponents(updatedOpponents);

      // Check collisions with obstacles
      let scoreIncrease = 0;
      let growthAmount = 0;
      const updatedObstacles = prev.obstacles.map(obstacle => {
        if (obstacle.velocity) {
          const newPos = {
            x: obstacle.position.x + obstacle.velocity.x,
            y: obstacle.position.y + obstacle.velocity.y,
          };
          
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
        const gridX = Math.floor(obstacle.position.x);
        const gridY = Math.floor(obstacle.position.y);
        
        if (gridX === head.x && gridY === head.y) {
          if (obstacle.type === 'UFO_WITH_COW') {
            growthAmount += UFO_GROWTH_AMOUNT;
            return false;
          } else if (obstacle.type === 'FLYING_COW') {
            scoreIncrease += POINTS_PER_COW;
            addScorePopup(gridX * GRID_SIZE, gridY * GRID_SIZE, POINTS_PER_COW, '#00ff88');
            if (onCowEaten) onCowEaten();
            return false;
          } else if (obstacle.type === 'CROCODILE') {
            scoreIncrease += POINTS_PER_CROCODILE;
            addScorePopup(gridX * GRID_SIZE, gridY * GRID_SIZE, POINTS_PER_CROCODILE, '#ffaa00');
            return false;
          } else if (obstacle.type === 'POINT_DROP') {
            scoreIncrease += obstacle.pointValue || POINTS_PER_POINT_DROP;
            growthAmount += POINT_DROP_GROWTH_AMOUNT;
            addScorePopup(gridX * GRID_SIZE, gridY * GRID_SIZE, obstacle.pointValue || POINTS_PER_POINT_DROP, '#00ddff');
            return false;
          }
        }

        return obstacle.position.y < GRID_HEIGHT + 2 && obstacle.position.y > -3;
      });

      // Check boss collision
      let bossBonus = 0;
      if (prev.boss && prev.boss.active) {
        const bossGridX = Math.floor(prev.boss.position.x);
        const bossGridY = Math.floor(prev.boss.position.y);
        
        if (bossGridX === head.x && bossGridY === head.y) {
          bossBonus = POINTS_PER_PENGUIN;
          addScorePopup(bossGridX * GRID_SIZE, bossGridY * GRID_SIZE, POINTS_PER_PENGUIN, '#ff00ff');
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
      const activePopups = prev.scorePopups.filter(p => now - p.createdAt < p.duration);

      const newState = {
        ...prev,
        snake: newSnake,
        opponents: movedOpponents,
        obstacles: updatedObstacles,
        score: prev.score + scoreIncrease + bossBonus + (eliminationCount * POINTS_PER_ELIMINATION) + 1,
        eliminations: prev.eliminations + eliminationCount,
        lasers: activeLasers,
        explosions: activeExplosions,
        scorePopups: activePopups,
      };
      
      gameStateRef.current = newState;
      return newState;
    });
  }, [onCowEaten, onElimination, spawnPointDrops, addScorePopup, updateOpponents, createOpponentSnake]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, now: number) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (starfieldRef.current) {
      starfieldRef.current.render(ctx);
    }

    const currentState = gameStateRef.current;

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
        } else if (obstacle.type === 'POINT_DROP') {
          renderPointDrop(ctx, pixelX + GRID_SIZE / 2, pixelY + GRID_SIZE / 2);
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
      currentState.scorePopups.forEach(popup => renderScorePopup(ctx, popup, now));

      // Render opponents
      currentState.opponents.forEach(opp => {
        if (opp.isAlive) {
          renderOpponentSnake(ctx, opp.segments);
        }
      });

      // Render player snake with tongue animation
      const showTongue = (now - lastTongueRef.current) % TONGUE_CADENCE < 200;
      renderSnake(ctx, currentState.snake.segments, showTongue);
    } else {
      // Fallback rendering
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
      if (now - lastUFOSpawnRef.current >= UFO_SPAWN_INTERVAL) {
        spawnUFOWithCow();
        lastUFOSpawnRef.current = now;
      }

      if (now - lastCrocodileSpawnRef.current >= CROCODILE_SPAWN_INTERVAL) {
        spawnCrocodile();
        lastCrocodileSpawnRef.current = now;
      }

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
      opponents: [
        createOpponentSnake('opp1', Math.floor(GRID_WIDTH * 0.25), Math.floor(GRID_HEIGHT * 0.3)),
        createOpponentSnake('opp2', Math.floor(GRID_WIDTH * 0.75), Math.floor(GRID_HEIGHT * 0.7)),
      ],
      score: 0,
      level: 1,
      eliminations: 0,
      planet: 'MARS',
      gravityMode: 'NORMAL',
      powerUps: [],
      obstacles: [],
      boss: null,
      isGameOver: false,
      isPaused: false,
      lasers: [],
      explosions: [],
      scorePopups: [],
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
    
    gameLoop();
  }, [gameLoop, createOpponentSnake]);

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
