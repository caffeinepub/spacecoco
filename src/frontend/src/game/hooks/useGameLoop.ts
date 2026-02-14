import { useRef, useState, useCallback, useEffect } from 'react';
import type { GameState, Direction, Obstacle, Boss, SnakeSegment, OpponentSnake, ScorePopup, Snake } from '../types';
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
import { loadToonTextures } from '../render/toonMaterials';
import { ToonRenderer } from '../render/toonRenderer';
import { setupCanvasDpr } from '../render/canvasDpr';

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mode: string,
  isMuted: boolean = false,
  onLaserFired?: () => void,
  onCowEaten?: () => void,
  onElimination?: () => void,
  onTongueHiss?: () => void,
  beatPhase: number = 0
) {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);

  const createInitialSnake = (): Snake => {
    const segments: SnakeSegment[] = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      segments.push({ x: centerX - i, y: centerY });
    }
    return {
      segments,
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      skinId: 0,
      isAlive: true,
    };
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
    snake: createInitialSnake(),
    opponents: [],
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

  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const [spriteLoadError, setSpriteLoadError] = useState<string | null>(null);
  const gameStateRef = useRef(gameState);
  const starfieldRef = useRef<StarfieldRenderer | null>(null);
  const toonRendererRef = useRef<ToonRenderer | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const dprRef = useRef<number>(1);
  const tongueTimerRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const lastObstacleSpawnRef = useRef<number>(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const calculateGameplayIntensity = useCallback((): number => {
    const state = gameStateRef.current;
    const baseIntensity = Math.min(state.level / 10, 0.5);
    const obstacleIntensity = Math.min(state.obstacles.length / 20, 0.3);
    const bossIntensity = state.boss ? 0.2 : 0;
    return Math.min(baseIntensity + obstacleIntensity + bossIntensity, 1.0);
  }, []);

  const [gameplayIntensity, setGameplayIntensity] = useState(0.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameplayIntensity(calculateGameplayIntensity());
    }, 500);
    return () => clearInterval(interval);
  }, [calculateGameplayIntensity]);

  // RAF loop control
  const startLoop = useCallback(() => {
    if (rafIdRef.current !== null) return; // Already running

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const state = gameStateRef.current;

      // Update tongue timer for hiss cadence
      tongueTimerRef.current += deltaTime;
      const showTongue = tongueTimerRef.current % TONGUE_CADENCE < TONGUE_CADENCE / 2;
      if (tongueTimerRef.current >= TONGUE_CADENCE && onTongueHiss) {
        onTongueHiss();
        tongueTimerRef.current = 0;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / dprRef.current, canvas.height / dprRef.current);

      // Render starfield
      if (starfieldRef.current) {
        starfieldRef.current.render(ctx);
      }

      // Render game entities with coordinated animation
      const renderer = toonRendererRef.current;
      if (renderer) {
        // Calculate interaction intensity for enhanced feedback
        const hasLaser = state.lasers.length > 0;
        const hasExplosion = state.explosions.length > 0;
        const interactionBoost = (hasLaser ? 0.2 : 0) + (hasExplosion ? 0.3 : 0);
        
        // Obstacles with coordinated motion
        state.obstacles.forEach(obstacle => {
          if (obstacle.type === 'UFO') {
            renderUFO(renderer, ctx, obstacle, currentTime, beatPhase);
          } else if (obstacle.type === 'FLYING_COW') {
            renderCow(renderer, ctx, obstacle, beatPhase);
          } else if (obstacle.type === 'POINT_DROP') {
            renderPointDrop(renderer, ctx, obstacle, currentTime, beatPhase);
          } else if (obstacle.type === 'CROCODILE') {
            renderCrocodile(renderer, ctx, obstacle);
          }
        });

        // Boss with coordinated motion
        if (state.boss) {
          renderPenguinBoss(renderer, ctx, state.boss, beatPhase);
        }

        // Opponents with coordinated motion
        state.opponents.forEach(opponent => {
          if (opponent.isAlive) {
            renderOpponentSnake(renderer, ctx, opponent, currentTime, beatPhase);
          }
        });

        // Player snake with coordinated motion
        renderSnake(renderer, ctx, state.snake, currentTime, showTongue, beatPhase);

        // VFX with enhanced feedback
        state.lasers.forEach(laser => {
          renderLaser(renderer, ctx, laser, currentTime, beatPhase);
        });
        state.explosions.forEach(explosion => {
          renderExplosion(renderer, ctx, explosion, currentTime);
        });
        state.scorePopups.forEach(popup => {
          renderScorePopup(renderer, ctx, popup, currentTime);
        });

        renderer.applyGlobalBrightness();
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    lastFrameTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(loop);
  }, [canvasRef, onTongueHiss, beatPhase]);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Visibility/focus handling for pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        if (!gameStateRef.current.isPaused && !gameStateRef.current.isGameOver) {
          startLoop();
        }
      }
    };

    const handleBlur = () => {
      stopLoop();
    };

    const handleFocus = () => {
      if (!gameStateRef.current.isPaused && !gameStateRef.current.isGameOver) {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [startLoop, stopLoop]);

  // Initialize canvas with DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const logicalWidth = 1200;
    const logicalHeight = 800;

    dprRef.current = setupCanvasDpr({
      canvas,
      logicalWidth,
      logicalHeight,
    });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      starfieldRef.current = new StarfieldRenderer(logicalWidth, logicalHeight);
      toonRendererRef.current = new ToonRenderer(ctx, { 
        quality: 'high', 
        brightness: 1.5,
        contrast: 1.3,
        saturation: 1.4,
      });
    }

    // Handle resize
    const handleResize = () => {
      dprRef.current = setupCanvasDpr({
        canvas,
        logicalWidth,
        logicalHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  // Load assets
  useEffect(() => {
    Promise.all([
      loadAllSprites().catch(err => {
        console.warn('Sprite loading failed (non-critical):', err);
        return null;
      }),
      loadToonTextures().catch(err => {
        console.warn('Toon texture loading failed (non-critical):', err);
        return null;
      }),
    ])
      .then(() => {
        setSpritesLoaded(true);
      })
      .catch(err => {
        console.error('Critical asset loading error:', err);
        setSpriteLoadError(err.message || 'Unknown error');
      });
  }, []);

  const startGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    const opponents: OpponentSnake[] = [];
    
    if (mode === 'multiplayer') {
      opponents.push(createOpponentSnake('opp1', 10, 10));
      opponents.push(createOpponentSnake('opp2', GRID_WIDTH - 10, GRID_HEIGHT - 10));
    }

    const now = Date.now();
    lastMoveTimeRef.current = now;
    lastObstacleSpawnRef.current = now;

    setGameState({
      snake: initialSnake,
      opponents,
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

    tongueTimerRef.current = 0;
    startLoop();
  }, [mode, startLoop]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    stopLoop();
  }, [stopLoop]);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    lastMoveTimeRef.current = Date.now();
    startLoop();
  }, [startLoop]);

  // Keyboard controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (state.isPaused || state.isGameOver) return;

      const directionMap: { [key: string]: Direction } = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
      };

      const newDirection = directionMap[e.key];
      if (newDirection) {
        e.preventDefault();
        const opposites: { [key in Direction]: Direction } = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT',
        };

        if (newDirection !== opposites[state.snake.direction]) {
          setGameState(prev => ({ 
            ...prev, 
            snake: { ...prev.snake, nextDirection: newDirection }
          }));
        }
      }
    };

    canvas.addEventListener('keydown', handleKeyDown);
    canvas.focus();

    return () => {
      canvas.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef]);

  // Game logic update loop
  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver || !spritesLoaded) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const state = gameStateRef.current;

      if (now - lastMoveTimeRef.current < BASE_SPEED / state.level) return;

      // Move snake
      const head = state.snake.segments[0];
      let newHead: SnakeSegment;

      const actualDirection = state.snake.nextDirection;

      switch (actualDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
        setGameState(prev => ({ ...prev, isGameOver: true }));
        stopLoop();
        return;
      }

      // Check self collision
      if (state.snake.segments.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameState(prev => ({ ...prev, isGameOver: true }));
        stopLoop();
        return;
      }

      const newSegments = [newHead, ...state.snake.segments];
      let grow = false;
      let scoreGain = 0;
      const newObstacles = [...state.obstacles];
      const newScorePopups = [...state.scorePopups];

      // Check obstacle collision
      for (let i = newObstacles.length - 1; i >= 0; i--) {
        const obs = newObstacles[i];
        if (obs.position.x === newHead.x && obs.position.y === newHead.y) {
          if (obs.type === 'UFO') {
            grow = true;
            for (let j = 0; j < UFO_GROWTH_AMOUNT; j++) {
              newSegments.push(newSegments[newSegments.length - 1]);
            }
            scoreGain += 10;
            newScorePopups.push({
              id: `popup-${now}-${i}`,
              x: newHead.x * GRID_SIZE,
              y: newHead.y * GRID_SIZE,
              amount: 10,
              createdAt: now,
              duration: 1000,
              color: '#00ffaa',
            });
          } else if (obs.type === 'FLYING_COW') {
            scoreGain += POINTS_PER_COW;
            newScorePopups.push({
              id: `popup-${now}-${i}`,
              x: newHead.x * GRID_SIZE,
              y: newHead.y * GRID_SIZE,
              amount: POINTS_PER_COW,
              createdAt: now,
              duration: 1000,
              color: '#ff22ff',
            });
            if (onCowEaten) onCowEaten();
          } else if (obs.type === 'POINT_DROP') {
            grow = true;
            for (let j = 0; j < POINT_DROP_GROWTH_AMOUNT; j++) {
              newSegments.push(newSegments[newSegments.length - 1]);
            }
            scoreGain += POINTS_PER_POINT_DROP;
            newScorePopups.push({
              id: `popup-${now}-${i}`,
              x: newHead.x * GRID_SIZE,
              y: newHead.y * GRID_SIZE,
              amount: POINTS_PER_POINT_DROP,
              createdAt: now,
              duration: 1000,
              color: '#ffff22',
            });
          }
          newObstacles.splice(i, 1);
        }
      }

      if (!grow) {
        newSegments.pop();
      }

      // Spawn obstacles
      if (now - lastObstacleSpawnRef.current > UFO_SPAWN_INTERVAL) {
        const x = Math.floor(Math.random() * GRID_WIDTH);
        const y = Math.floor(Math.random() * GRID_HEIGHT);
        const type = Math.random() > 0.7 ? 'FLYING_COW' : 'UFO';
        newObstacles.push({ 
          id: `obs-${now}`,
          type, 
          position: { x, y },
          active: true,
        });
        lastObstacleSpawnRef.current = now;
      }

      // Update explosions and popups
      const newExplosions = state.explosions.filter(exp => now - exp.createdAt < 500);
      const filteredPopups = newScorePopups.filter(popup => now - popup.createdAt < 1000);

      lastMoveTimeRef.current = now;

      setGameState(prev => ({
        ...prev,
        snake: {
          ...prev.snake,
          segments: newSegments,
          direction: actualDirection,
        },
        obstacles: newObstacles,
        score: prev.score + scoreGain,
        level: Math.floor((prev.score + scoreGain) / 100) + 1,
        explosions: newExplosions,
        scorePopups: filteredPopups,
      }));
    }, 16);

    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.isGameOver, spritesLoaded, onCowEaten, stopLoop]);

  return {
    gameState,
    isGameOver: gameState.isGameOver,
    startGame,
    pauseGame,
    resumeGame,
    spritesLoaded,
    spriteLoadError,
    gameplayIntensity,
  };
}
