/**
 * Canvas DPR (Device Pixel Ratio) utility for crisp high-DPI rendering.
 * Scales the canvas backing store while keeping CSS size consistent.
 */

const MAX_DPR = 2; // Clamp to avoid performance issues on very high DPI displays

export interface CanvasDprConfig {
  canvas: HTMLCanvasElement;
  logicalWidth: number;
  logicalHeight: number;
}

export function setupCanvasDpr(config: CanvasDprConfig): number {
  const { canvas, logicalWidth, logicalHeight } = config;
  
  // Get device pixel ratio, clamped to MAX_DPR
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  
  // Set CSS size (logical size)
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  
  // Set backing store size (physical pixels)
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  
  // Scale context to match DPR
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  
  return dpr;
}

export function getLogicalSize(canvas: HTMLCanvasElement, dpr: number): { width: number; height: number } {
  return {
    width: canvas.width / dpr,
    height: canvas.height / dpr,
  };
}
