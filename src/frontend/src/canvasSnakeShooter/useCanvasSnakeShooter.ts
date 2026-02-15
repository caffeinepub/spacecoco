import { useEffect, useRef, useState, RefObject } from 'react';
import { useDocumentVisibility } from '@/hooks/useDocumentVisibility';
import { GameState, Snake, Vector2, Enemy, Laser, Particle, Food, Star, Meteorite, RainbowBurst, SnakeSegment } from './types';
import { renderGame } from './render';
import { updateBackground, initBackground } from './background';

const GRID_SIZE = 20;
const SNAKE_SPEED = 3;
const INITIAL_LENGTH = 5;
const GROWTH_AMOUNT = 2;
const ENEMY_SPAWN_INTERVAL = 3000;
const MAX_ENEMIES = 8;

function createInitialSnake(canvasWidth: number, canvasHeight: number): Snake {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  const segments: SnakeSegment[] = [];
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    segments.push({
      x: centerX - i * GRID_SIZE,
      y: centerY,
      angle: 0
    });
  }

  return {
    segments,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    growthPending: 0,
    speed: SNAKE_SPEED
  };
}

function createFood(canvasWidth: number, canvasHeight: number): Food {
  return {
    x: Math.random() * (canvasWidth - 100) + 50,
    y: Math.random() * (canvasHeight - 100) + 50,
    radius: 10
  };
}

function createEnemy(canvasWidth: number, canvasHeight: number, id: number): Enemy {
  const types: Array<'UFO' | 'COW' | 'PENGUIN'> = ['UFO', 'COW', 'PENGUIN'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const side = Math.floor(Math.random() * 4);
  let x = 0, y = 0, vx = 0, vy = 0;
  
  switch (side) {
    case 0: // top
      x = Math.random() * canvasWidth;
      y = -50;
      vy = 1;
      break;
    case 1: // right
      x = canvasWidth + 50;
      y = Math.random() * canvasHeight;
      vx = -1;
      break;
    case 2: // bottom
      x = Math.random() * canvasWidth;
      y = canvasHeight + 50;
      vy = -1;
      break;
    case 3: // left
      x = -50;
      y = Math.random() * canvasHeight;
      vx = 1;
      break;
  }

  return {
    id,
    type,
    x,
    y,
    vx: vx * (1 + Math.random()),
    vy: vy * (1 + Math.random()),
    shootTimer: 0,
    shootCooldown: 2000 + Math.random() * 2000,
    phase: Math.random() * Math.PI * 2,
    seed: Math.random(),
    radius: 25
  };
}

function spawnParticleBurst(x: number, y: number, count: number = 20): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80', '#ff8000'];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 3 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 3
    });
  }
  
  return particles;
}

function checkCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

function checkLaserCollision(laser: Laser, x: number, y: number, radius: number): boolean {
  const dx = laser.x2 - laser.x1;
  const dy = laser.y2 - laser.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return false;
  
  const dot = ((x - laser.x1) * dx + (y - laser.y1) * dy) / (length * length);
  const closestX = laser.x1 + dot * dx;
  const closestY = laser.y1 + dot * dy;
  
  const onSegment = dot >= 0 && dot <= 1;
  if (!onSegment) return false;
  
  const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
  return dist < radius;
}

export function useCanvasSnakeShooter(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const isVisible = useDocumentVisibility();
  const [gameState, setGameState] = useState<GameState>({
    snake: { segments: [], direction: { x: 1, y: 0 }, nextDirection: { x: 1, y: 0 }, growthPending: 0, speed: SNAKE_SPEED },
    food: null,
    enemies: [],
    lasers: [],
    particles: [],
    background: { stars: [], meteorites: [], rainbowBursts: [] },
    score: 0,
    isGameOver: false,
    time: 0
  });

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);
  const nextEnemyIdRef = useRef<number>(0);
  const nextLaserIdRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const restart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGameState({
      snake: createInitialSnake(canvas.width, canvas.height),
      food: createFood(canvas.width, canvas.height),
      enemies: [],
      lasers: [],
      particles: [],
      background: initBackground(canvas.width, canvas.height),
      score: 0,
      isGameOver: false,
      time: 0
    });
    
    lastEnemySpawnRef.current = 0;
    nextEnemyIdRef.current = 0;
    nextLaserIdRef.current = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      if (gameState.snake.segments.length === 0) {
        setGameState(prev => ({
          ...prev,
          snake: createInitialSnake(canvas.width, canvas.height),
          food: createFood(canvas.width, canvas.height),
          background: initBackground(canvas.width, canvas.height)
        }));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [canvasRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (!gameState.isGameOver) {
        const { direction, nextDirection } = gameState.snake;
        let newDir: Vector2 | null = null;

        if ((e.key === 'ArrowUp' || e.key === 'w') && direction.y === 0) {
          newDir = { x: 0, y: -1 };
        } else if ((e.key === 'ArrowDown' || e.key === 's') && direction.y === 0) {
          newDir = { x: 0, y: 1 };
        } else if ((e.key === 'ArrowLeft' || e.key === 'a') && direction.x === 0) {
          newDir = { x: -1, y: 0 };
        } else if ((e.key === 'ArrowRight' || e.key === 'd') && direction.x === 0) {
          newDir = { x: 1, y: 0 };
        }

        if (newDir) {
          setGameState(prev => ({
            ...prev,
            snake: { ...prev.snake, nextDirection: newDir! }
          }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isGameOver, gameState.snake.direction]);

  useEffect(() => {
    if (!isVisible || gameState.isGameOver) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime > 100) {
        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      setGameState(prev => {
        const newState = { ...prev };
        newState.time = timestamp;

        // Update snake
        const snake = { ...newState.snake };
        snake.direction = snake.nextDirection;

        const head = snake.segments[0];
        const newHead: SnakeSegment = {
          x: head.x + snake.direction.x * snake.speed,
          y: head.y + snake.direction.y * snake.speed,
          angle: Math.atan2(snake.direction.y, snake.direction.x)
        };

        snake.segments.unshift(newHead);

        if (snake.growthPending > 0) {
          snake.growthPending--;
        } else {
          snake.segments.pop();
        }

        // Wrap around screen
        if (newHead.x < 0) newHead.x = canvas.width;
        if (newHead.x > canvas.width) newHead.x = 0;
        if (newHead.y < 0) newHead.y = canvas.height;
        if (newHead.y > canvas.height) newHead.y = 0;

        newState.snake = snake;

        // Check food collision
        if (newState.food && checkCollision(newHead.x, newHead.y, 10, newState.food.x, newState.food.y, newState.food.radius)) {
          newState.snake.growthPending += GROWTH_AMOUNT;
          newState.score += 10;
          newState.particles.push(...spawnParticleBurst(newState.food.x, newState.food.y));
          newState.food = createFood(canvas.width, canvas.height);
        }

        // Update enemies
        newState.enemies = newState.enemies.map(enemy => {
          const e = { ...enemy };
          e.phase += 0.02;
          e.shootTimer += deltaTime;

          // Apply motion patterns
          if (e.type === 'UFO') {
            e.x += e.vx;
            e.y += e.vy + Math.sin(e.phase) * 2;
          } else if (e.type === 'COW') {
            e.x += e.vx + Math.sin(e.phase * 2) * 0.5;
            e.y += e.vy + Math.cos(e.phase * 1.5) * 0.5;
          } else if (e.type === 'PENGUIN') {
            e.x += e.vx + Math.sin(e.phase * 3) * 1.5;
            e.y += e.vy;
          }

          // Shoot lasers
          if (e.shootTimer >= e.shootCooldown) {
            e.shootTimer = 0;
            const angle = Math.atan2(newHead.y - e.y, newHead.x - e.x);
            const laserLength = 1000;
            newState.lasers.push({
              id: nextLaserIdRef.current++,
              x1: e.x,
              y1: e.y,
              x2: e.x + Math.cos(angle) * laserLength,
              y2: e.y + Math.sin(angle) * laserLength,
              createdAt: timestamp,
              lifetime: 500,
              enemyId: e.id
            });
          }

          return e;
        });

        // Check enemy collision
        for (let i = newState.enemies.length - 1; i >= 0; i--) {
          const enemy = newState.enemies[i];
          if (checkCollision(newHead.x, newHead.y, 10, enemy.x, enemy.y, enemy.radius)) {
            newState.snake.growthPending += GROWTH_AMOUNT;
            newState.score += 25;
            newState.particles.push(...spawnParticleBurst(enemy.x, enemy.y, 30));
            newState.enemies.splice(i, 1);
          }
        }

        // Remove off-screen enemies
        newState.enemies = newState.enemies.filter(e => 
          e.x > -100 && e.x < canvas.width + 100 && e.y > -100 && e.y < canvas.height + 100
        );

        // Spawn new enemies
        if (timestamp - lastEnemySpawnRef.current > ENEMY_SPAWN_INTERVAL && newState.enemies.length < MAX_ENEMIES) {
          newState.enemies.push(createEnemy(canvas.width, canvas.height, nextEnemyIdRef.current++));
          lastEnemySpawnRef.current = timestamp;
        }

        // Update lasers
        newState.lasers = newState.lasers.filter(laser => timestamp - laser.createdAt < laser.lifetime);

        // Check laser collision with snake head
        for (const laser of newState.lasers) {
          if (checkLaserCollision(laser, newHead.x, newHead.y, 10)) {
            newState.isGameOver = true;
            break;
          }
        }

        // Update particles
        newState.particles = newState.particles.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02
        })).filter(p => p.life > 0);

        // Update background
        newState.background = updateBackground(newState.background, canvas.width, canvas.height, deltaTime, timestamp);

        return newState;
      });

      renderGame(canvas, gameState);

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isVisible, gameState.isGameOver, canvasRef]);

  return { gameState, restart };
}
