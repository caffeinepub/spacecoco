export class StarfieldRenderer {
  private stars: Array<{ x: number; y: number; baseAlpha: number; phase: number; size: number }> = [];
  private shootingStars: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
    active: boolean;
  }> = [];
  private lastShootingStarTime: number = 0;
  private startTime: number = Date.now();

  constructor(
    private width: number,
    private height: number,
    private starCount: number = 250
  ) {
    this.generateStars();
  }

  private generateStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseAlpha: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() > 0.9 ? 2 : 1,
      });
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const now = Date.now();
    const millis = now - this.startTime;

    // Deep space gradient background with nebula tint
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#000814');
    gradient.addColorStop(0.5, '#001233');
    gradient.addColorStop(1, '#000814');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Render twinkling stars with brighter intensity
    this.stars.forEach(star => {
      const twinkle = Math.sin(millis * 0.002 + star.phase) * 0.5 + 0.5;
      const alpha = star.baseAlpha * (0.5 + twinkle * 0.5);
      
      // Brighter star colors
      const brightness = 200 + Math.floor(twinkle * 55);
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, 255, ${alpha})`;
      
      if (star.size === 2) {
        ctx.fillRect(star.x - 0.5, star.y - 0.5, 2, 2);
      } else {
        ctx.fillRect(star.x, star.y, 1, 1);
      }
      
      // Add subtle glow to brighter stars
      if (star.baseAlpha > 0.8 && twinkle > 0.7) {
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, 255, ${alpha * 0.3})`;
        ctx.fillRect(star.x - 1, star.y - 1, 3, 3);
      }
    });

    // Spawn shooting star every ~7 seconds
    if (now - this.lastShootingStarTime > 7000) {
      this.spawnShootingStar();
      this.lastShootingStarTime = now;
    }

    // Render shooting stars with brighter trails
    this.shootingStars = this.shootingStars.filter(star => {
      if (!star.active || star.opacity <= 0) return false;

      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Fade out
      star.opacity -= 0.015;

      // Draw brighter trail with glow
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(200, 220, 255, ${star.opacity * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.vx * 25, star.y - star.vy * 25);
      ctx.stroke();
      ctx.restore();

      return star.opacity > 0;
    });
  }

  private spawnShootingStar() {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0, vx = 0, vy = 0;

    switch (side) {
      case 0: // Top
        x = Math.random() * this.width;
        y = 0;
        vx = (Math.random() - 0.5) * 10;
        vy = 5 + Math.random() * 5;
        break;
      case 1: // Right
        x = this.width;
        y = Math.random() * this.height;
        vx = -(5 + Math.random() * 5);
        vy = (Math.random() - 0.5) * 10;
        break;
      case 2: // Bottom
        x = Math.random() * this.width;
        y = this.height;
        vx = (Math.random() - 0.5) * 10;
        vy = -(5 + Math.random() * 5);
        break;
      case 3: // Left
        x = 0;
        y = Math.random() * this.height;
        vx = 5 + Math.random() * 5;
        vy = (Math.random() - 0.5) * 10;
        break;
    }

    this.shootingStars.push({
      x,
      y,
      vx,
      vy,
      opacity: 1.0,
      active: true,
    });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.generateStars();
  }
}
