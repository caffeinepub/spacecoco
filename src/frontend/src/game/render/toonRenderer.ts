import { getToonTextures, toonMaterials as materials, type ToonMaterial } from './toonMaterials';

export type QualityLevel = 'high' | 'medium' | 'low';

// Re-export toonMaterials for convenience
export { materials as toonMaterials };

interface ToonRenderOptions {
  quality: QualityLevel;
  brightness: number;
}

const defaultOptions: ToonRenderOptions = {
  quality: 'high',
  brightness: 1.2,
};

export class ToonRenderer {
  private ctx: CanvasRenderingContext2D;
  private options: ToonRenderOptions;
  private trailCanvas: HTMLCanvasElement | null = null;
  private trailCtx: CanvasRenderingContext2D | null = null;

  constructor(ctx: CanvasRenderingContext2D, options: Partial<ToonRenderOptions> = {}) {
    this.ctx = ctx;
    this.options = { ...defaultOptions, ...options };
    
    // Enable high-quality image smoothing for toon/vector style by default
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  setQuality(quality: QualityLevel) {
    this.options.quality = quality;
  }

  setImageSmoothing(enabled: boolean) {
    this.ctx.imageSmoothingEnabled = enabled;
  }

  drawGlow(x: number, y: number, radius: number, color: string, intensity: number = 1.0) {
    if (this.options.quality === 'low') return;

    const samples = this.options.quality === 'high' ? 3 : 2;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < samples; i++) {
      const r = radius * (1 - i / samples);
      const alpha = (intensity / samples) * 0.3;
      
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
      gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    
    this.ctx.restore();
  }

  drawOutline(path: Path2D, material: ToonMaterial) {
    this.ctx.save();
    this.ctx.strokeStyle = material.outlineColor;
    this.ctx.lineWidth = material.outlineWidth;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.stroke(path);
    this.ctx.restore();
  }

  drawFill(path: Path2D, material: ToonMaterial, gradient?: CanvasGradient) {
    this.ctx.save();
    this.ctx.fillStyle = gradient || material.baseColor;
    this.ctx.fill(path);
    this.ctx.restore();
  }

  createFakePBRGradient(x: number, y: number, width: number, height: number, baseColor: string): CanvasGradient {
    const gradient = this.ctx.createRadialGradient(
      x + width * 0.3,
      y + height * 0.3,
      0,
      x + width * 0.5,
      y + height * 0.5,
      Math.max(width, height) * 0.7
    );
    
    // Lighter highlight
    const highlight = this.adjustBrightness(baseColor, 1.4);
    gradient.addColorStop(0, highlight);
    gradient.addColorStop(0.5, baseColor);
    
    // Darker shadow
    const shadow = this.adjustBrightness(baseColor, 0.6);
    gradient.addColorStop(1, shadow);
    
    return gradient;
  }

  adjustBrightness(color: string, factor: number): string {
    // Simple brightness adjustment
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
    const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
    const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  drawCircleEntity(x: number, y: number, radius: number, material: ToonMaterial) {
    const path = new Path2D();
    path.arc(x, y, radius, 0, Math.PI * 2);
    
    // Glow
    this.drawGlow(x, y, material.glowRadius, material.glowColor, material.glowIntensity);
    
    // Gradient fill
    const gradient = this.createFakePBRGradient(x - radius, y - radius, radius * 2, radius * 2, material.baseColor);
    this.drawFill(path, material, gradient);
    
    // Outline
    this.drawOutline(path, material);
  }

  drawRectEntity(x: number, y: number, width: number, height: number, material: ToonMaterial) {
    const path = new Path2D();
    path.rect(x, y, width, height);
    
    // Glow
    this.drawGlow(x + width / 2, y + height / 2, material.glowRadius, material.glowColor, material.glowIntensity);
    
    // Gradient fill
    const gradient = this.createFakePBRGradient(x, y, width, height, material.baseColor);
    this.drawFill(path, material, gradient);
    
    // Outline
    this.drawOutline(path, material);
  }

  drawSnakeSegment(x: number, y: number, size: number, material: ToonMaterial, wave: number = 0) {
    this.ctx.save();
    this.ctx.translate(x + size / 2, y + size / 2 + wave);
    
    const path = new Path2D();
    path.arc(0, 0, size / 2, 0, Math.PI * 2);
    
    // Glow
    this.drawGlow(0, 0, material.glowRadius, material.glowColor, material.glowIntensity);
    
    // Gradient
    const gradient = this.createFakePBRGradient(-size / 2, -size / 2, size, size, material.baseColor);
    this.drawFill(path, material, gradient);
    
    // Outline
    this.drawOutline(path, material);
    
    this.ctx.restore();
  }

  drawTextureOverlay(x: number, y: number, width: number, height: number, texture: HTMLImageElement | null, alpha: number = 1.0) {
    if (!texture) return;
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(texture, x, y, width, height);
    this.ctx.restore();
  }

  applyGlobalBrightness() {
    if (this.options.brightness === 1.0) return;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = `rgba(255, 255, 255, ${(this.options.brightness - 1.0) * 0.15})`;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }

  drawMotionTrail(x: number, y: number, size: number, color: string, alpha: number = 0.3) {
    if (this.options.quality === 'low') return;
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
    this.ctx.restore();
  }
}
