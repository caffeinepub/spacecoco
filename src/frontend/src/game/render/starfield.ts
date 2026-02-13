// Starfield renderer for animated space background
export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export class StarfieldRenderer {
  private stars: Star[] = [];
  private time: number = 0;

  constructor(width: number, height: number, starCount: number = 150) {
    // Generate random stars
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    this.time += 0.016; // Approximate frame time

    this.stars.forEach(star => {
      // Calculate twinkling effect
      const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle drift
      star.x += Math.sin(this.time * 0.001 + star.twinkleOffset) * 0.05;
      star.y += Math.cos(this.time * 0.001 + star.twinkleOffset) * 0.05;

      // Wrap around edges
      if (star.x < 0) star.x = ctx.canvas.width;
      if (star.x > ctx.canvas.width) star.x = 0;
      if (star.y < 0) star.y = ctx.canvas.height;
      if (star.y > ctx.canvas.height) star.y = 0;
    });
  }
}
