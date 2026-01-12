export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  color: string;

  static readonly COLORS = [
    '#e94560',
    '#ff6b6b',
    '#feca57',
    '#48dbfb',
    '#1dd1a1',
    '#5f27cd',
  ];

  constructor(x: number, y: number, width: number, height: number, colorIndex: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.color = Brick.COLORS[colorIndex % Brick.COLORS.length];
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 3);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 3);
    ctx.stroke();
  }

  static createGrid(
    canvasWidth: number,
    rows: number = 5,
    cols: number = 10,
    padding: number = 5,
    topOffset: number = 50
  ): Brick[] {
    const bricks: Brick[] = [];
    const totalPadding = padding * (cols + 1);
    const brickWidth = (canvasWidth - totalPadding) / cols;
    const brickHeight = 20;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = padding + col * (brickWidth + padding);
        const y = topOffset + row * (brickHeight + padding);
        bricks.push(new Brick(x, y, brickWidth, brickHeight, row));
      }
    }

    return bricks;
  }
}
