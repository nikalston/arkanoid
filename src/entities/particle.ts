export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;

    // Random velocity in all directions
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2; // Slight upward bias

    this.size = 3 + Math.random() * 4;
    this.maxLife = 30 + Math.random() * 20;
    this.life = this.maxLife;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // Gravity
    this.vx *= 0.98; // Friction
    this.life--;
    this.size *= 0.96;
  }

  get alive(): boolean {
    return this.life > 0 && this.size > 0.5;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(x: number, y: number, color: string, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update(): void {
    this.particles = this.particles.filter(p => {
      p.update();
      return p.alive;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }
}
