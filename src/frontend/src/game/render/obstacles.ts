// Obstacle rendering helpers for UFOs and cows
export function renderUFO(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 40
) {
  // UFO body (saucer shape)
  ctx.fillStyle = '#8B8B8B';
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // UFO dome
  ctx.fillStyle = '#A0A0A0';
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.5, size * 0.3, 0, 0, Math.PI, true);
  ctx.fill();

  // UFO lights
  const lightColors = ['#FF0000', '#00FF00', '#0000FF'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = lightColors[i];
    ctx.beginPath();
    ctx.arc(
      x + (i - 1) * size * 0.5,
      y + size * 0.2,
      size * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

export function renderCow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 30
) {
  // Cow body
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - size * 0.4, y - size * 0.3, size * 0.8, size * 0.6);

  // Cow spots
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y + size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Cow head
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - size * 0.5, y - size * 0.5, size * 0.3, size * 0.3);

  // Cow eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - size * 0.45, y - size * 0.45, size * 0.08, size * 0.08);
  ctx.fillRect(x - size * 0.3, y - size * 0.45, size * 0.08, size * 0.08);
}

export function renderPenguinBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 60
) {
  // Penguin body (black)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Penguin belly (white)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.4, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Penguin head
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.6, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Penguin eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.65, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.65, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Penguin pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.65, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.65, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Penguin beak (orange)
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55);
  ctx.lineTo(x - size * 0.1, y - size * 0.5);
  ctx.lineTo(x + size * 0.1, y - size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Penguin feet
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.ellipse(x - size * 0.25, y + size * 0.8, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.25, y + size * 0.8, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}
