import { BackgroundState, Star, Meteorite, RainbowBurst, Particle } from './types';

const STAR_COUNT = 200;
const METEORITE_SPAWN_INTERVAL = 2000;
const RAINBOW_BURST_LIFETIME = 2000;

export function initBackground(width: number, height: number): BackgroundState {
  const stars: Star[] = [];
  
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      vx: -0.5 - Math.random() * 0.5
    });
  }

  return {
    stars,
    meteorites: [],
    rainbowBursts: []
  };
}

function spawnMeteorite(width: number, height: number): Meteorite {
  return {
    x: width + 50,
    y: Math.random() * height,
    vx: -3 - Math.random() * 3,
    vy: 1 + Math.random() * 2,
    size: 8 + Math.random() * 12,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0.05 + Math.random() * 0.1
  };
}

function createRainbowBurst(x: number, y: number, timestamp: number): RainbowBurst {
  const particles: Particle[] = [];
  const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff00ff'];
  const count = 30;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 4
    });
  }

  return {
    x,
    y,
    particles,
    createdAt: timestamp
  };
}

export function updateBackground(
  background: BackgroundState,
  width: number,
  height: number,
  deltaTime: number,
  timestamp: number
): BackgroundState {
  const newBackground = { ...background };

  // Update stars
  newBackground.stars = background.stars.map(star => {
    let newX = star.x + star.vx;
    if (newX < 0) newX = width;
    
    return {
      ...star,
      x: newX,
      twinklePhase: star.twinklePhase + 0.05
    };
  });

  // Update meteorites
  newBackground.meteorites = background.meteorites.map(met => ({
    ...met,
    x: met.x + met.vx,
    y: met.y + met.vy,
    rotation: met.rotation + met.rotationSpeed
  })).filter(met => met.x > -100 && met.y < height + 100);

  // Spawn new meteorites
  if (Math.random() < deltaTime / METEORITE_SPAWN_INTERVAL) {
    newBackground.meteorites.push(spawnMeteorite(width, height));
  }

  // Check for meteorite impacts and create rainbow bursts
  const impactedMeteorites = newBackground.meteorites.filter(met => met.y > height - 50);
  impactedMeteorites.forEach(met => {
    newBackground.rainbowBursts.push(createRainbowBurst(met.x, height - 50, timestamp));
  });
  newBackground.meteorites = newBackground.meteorites.filter(met => met.y < height - 50);

  // Update rainbow bursts
  newBackground.rainbowBursts = background.rainbowBursts.map(burst => ({
    ...burst,
    particles: burst.particles.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.1, // gravity
      life: p.life - 0.015
    })).filter(p => p.life > 0)
  })).filter(burst => timestamp - burst.createdAt < RAINBOW_BURST_LIFETIME && burst.particles.length > 0);

  return newBackground;
}
