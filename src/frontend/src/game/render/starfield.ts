export class StarfieldRenderer {
  private stars: Array<{ x: number; y: number; baseAlpha: number; phase: number }> = [];
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
    private starCount: number = 200
  ) {
    this.generateStars();
  }

  private generateStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseAlpha: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const now = Date.now();
    const millis = now - this.startTime;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Render twinkling stars
    this.stars.forEach(star => {
      const twinkle = Math.sin(millis * 0.002 + star.phase) * 0.4 + 0.6;
      const alpha = star.baseAlpha * twinkle;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(star.x, star.y, 1, 1);
    });

    // Spawn shooting star every ~7 seconds
    if (now - this.lastShootingStarTime > 7000) {
      this.spawnShootingStar();
      this.lastShootingStarTime = now;
    }

    // Render shooting stars
    this.shootingStars = this.shootingStars.filter(star => {
      if (!star.active || star.opacity <= 0) return false;

      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Fade out
      star.opacity -= 0.02;

      // Draw trail
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.vx * 20, star.y - star.vy * 20);
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
