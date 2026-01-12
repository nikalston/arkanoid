export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  canvasWidth: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.width = 100;
    this.height = 12;
    this.canvasWidth = canvasWidth;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 20;
    this.speed = 8;
  }

  moveLeft(): void {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight(): void {
    this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
  }

  moveTo(mouseX: number): void {
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, mouseX - this.width / 2));
  }

  reset(canvasWidth: number, canvasHeight: number): void {
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 20;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.fill();
  }
}
