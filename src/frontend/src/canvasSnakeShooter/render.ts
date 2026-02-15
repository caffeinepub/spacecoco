import { GameState, Enemy, Particle, Star, Meteorite, RainbowBurst } from './types';

const GRID_SIZE = 20;

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawStarfield(ctx: CanvasRenderingContext2D, stars: Star[]) {
  stars.forEach(star => {
    const brightness = star.brightness * (0.5 + 0.5 * Math.sin(star.twinklePhase));
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.shadowBlur = star.size * 2;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawMeteorites(ctx: CanvasRenderingContext2D, meteorites: Meteorite[]) {
  meteorites.forEach(met => {
    ctx.save();
    ctx.translate(met.x, met.y);
    ctx.rotate(met.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, met.size);
    gradient.addColorStop(0, '#ff8800');
    gradient.addColorStop(0.5, '#ff4400');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4400';
    ctx.beginPath();
    ctx.arc(0, 0, met.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.restore();
  });
}

function drawRainbowBursts(ctx: CanvasRenderingContext2D, bursts: RainbowBurst[]) {
  bursts.forEach(burst => {
    burst.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
  });
}

function drawSnake(ctx: CanvasRenderingContext2D, snake: GameState['snake'], time: number) {
  if (snake.segments.length === 0) return;

  snake.segments.forEach((segment, i) => {
    const ratio = i / snake.segments.length;
    const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, 12);
    gradient.addColorStop(0, `hsl(${280 + ratio * 80}, 100%, 60%)`);
    gradient.addColorStop(1, `hsl(${280 + ratio * 80}, 100%, 30%)`);
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${280 + ratio * 80}, 100%, 50%)`;
    
    const wave = Math.sin(time * 0.005 + i * 0.3) * 2;
    ctx.beginPath();
    ctx.arc(segment.x + wave, segment.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw head with eyes
  const head = snake.segments[0];
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(head.x - 4, head.y - 3, 2, 0, Math.PI * 2);
  ctx.arc(head.x + 4, head.y - 3, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  
  const pulse = 1 + Math.sin(enemy.phase) * 0.1;
  ctx.scale(pulse, pulse);

  if (enemy.type === 'UFO') {
    // UFO body
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0088ff');
    gradient.addColorStop(1, '#0044ff');
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dome
    ctx.fillStyle = '#88ffff';
    ctx.beginPath();
    ctx.arc(0, -5, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Lights
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + time * 0.003;
      const x = Math.cos(angle) * 20;
      const y = Math.sin(angle) * 8;
      ctx.fillStyle = i % 2 === 0 ? '#ff00ff' : '#ffff00';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (enemy.type === 'COW') {
    // Cow body
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI * 2);
    ctx.arc(8, 3, 6, 0, Math.PI * 2);
    ctx.arc(0, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(-6, -8, 3, 0, Math.PI * 2);
    ctx.arc(6, -8, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (enemy.type === 'PENGUIN') {
    // Penguin body
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Belly
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(0, 5, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -10, 4, 0, Math.PI * 2);
    ctx.arc(6, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-6, -10, 2, 0, Math.PI * 2);
    ctx.arc(6, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawLaser(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, time: number) {
  const pulse = 0.7 + 0.3 * Math.sin(time * 0.01);
  
  ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ff0000';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  ctx.strokeStyle = `rgba(255, 100, 100, ${pulse * 0.5})`;
  ctx.lineWidth = 8;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}

export function renderGame(canvas: HTMLCanvasElement, state: GameState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background gradient
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  gradient.addColorStop(0, '#0a0015');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background layers
  drawStarfield(ctx, state.background.stars);
  drawMeteorites(ctx, state.background.meteorites);
  drawRainbowBursts(ctx, state.background.rainbowBursts);

  // Draw grid
  drawGrid(ctx, canvas.width, canvas.height);

  // Draw food
  if (state.food) {
    const gradient = ctx.createRadialGradient(state.food.x, state.food.y, 0, state.food.x, state.food.y, state.food.radius);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, '#008800');
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff00';
    ctx.beginPath();
    ctx.arc(state.food.x, state.food.y, state.food.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw snake
  drawSnake(ctx, state.snake, state.time);

  // Draw enemies
  state.enemies.forEach(enemy => drawEnemy(ctx, enemy, state.time));

  // Draw lasers
  state.lasers.forEach(laser => drawLaser(ctx, laser.x1, laser.y1, laser.x2, laser.y2, state.time));

  // Draw particles
  drawParticles(ctx, state.particles);
}
