export class Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.radius = 8;
    this.speed = 5;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 50;
    this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    this.dy = -this.speed;
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }

  bounceX(): void {
    this.dx = -this.dx;
  }

  bounceY(): void {
    this.dy = -this.dy;
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 50;
    this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    this.dy = -this.speed;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
