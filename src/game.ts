import { Paddle } from './entities/paddle.ts';
import { Ball } from './entities/ball.ts';
import { Brick } from './entities/brick.ts';
import { ParticleSystem } from './entities/particle.ts';
import { checkWallCollision, checkPaddleCollision, checkBrickCollision } from './utils/collision.ts';
import { Sound } from './utils/sound.ts';

type GameState = 'playing' | 'paused' | 'won' | 'lost';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private paddle: Paddle;
  private ball: Ball;
  private bricks: Brick[];
  private score: number;
  private state: GameState;
  private keys: Set<string>;

  private scoreElement: HTMLElement;
  private overlayElement: HTMLElement;
  private messageElement: HTMLElement;
  private restartBtn: HTMLElement;
  private sound: Sound;
  private particles: ParticleSystem;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.canvas.width = 800;
    this.canvas.height = 600;

    this.paddle = new Paddle(this.canvas.width, this.canvas.height);
    this.ball = new Ball(this.canvas.width, this.canvas.height);
    this.bricks = Brick.createGrid(this.canvas.width);
    this.score = 0;
    this.state = 'playing';
    this.keys = new Set();

    this.scoreElement = document.getElementById('score')!;
    this.overlayElement = document.getElementById('overlay')!;
    this.messageElement = document.getElementById('message')!;
    this.restartBtn = document.getElementById('restart-btn')!;
    this.sound = new Sound();
    this.particles = new ParticleSystem();

    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      } else {
        this.keys.add(e.key);
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.paddle.moveTo(mouseX);
    });

    this.restartBtn.addEventListener('click', () => {
      this.reset();
    });
  }

  private togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sound.pauseMusic();
      this.showOverlay('Paused', false);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.sound.resumeMusic();
      this.hideOverlay();
    }
  }

  private handleInput(): void {
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) {
      this.paddle.moveLeft();
    }
    if (this.keys.has('ArrowRight') || this.keys.has('d')) {
      this.paddle.moveRight();
    }
  }

  private update(): void {
    if (this.state !== 'playing') return;


    this.handleInput();
    this.ball.update();

    const wallHit = checkWallCollision(this.ball, this.canvas.width, this.canvas.height);
    if (wallHit === 'left' || wallHit === 'right') {
      this.ball.bounceX();
      this.sound.wall();
    } else if (wallHit === 'top') {
      this.ball.bounceY();
      this.sound.wall();
    } else if (wallHit === 'bottom') {
      this.state = 'lost';
      this.sound.stopMusic();
      this.sound.gameOver();
      this.showOverlay('Game Over!');
      return;
    }

    if (checkPaddleCollision(this.ball, this.paddle)) {
      this.sound.paddle();
    }

    for (const brick of this.bricks) {
      if (checkBrickCollision(this.ball, brick)) {
        this.score += 10;
        this.updateScore();
        this.sound.brick();
        this.particles.emit(
          brick.x + brick.width / 2,
          brick.y + brick.height / 2,
          brick.color
        );
      }
    }

    this.particles.update();

    if (this.bricks.every((b) => !b.active)) {
      this.state = 'won';
      this.sound.stopMusic();
      this.sound.win();
      this.showOverlay('You Win!');
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) {
      brick.render(this.ctx);
    }

    this.particles.render(this.ctx);
    this.paddle.render(this.ctx);
    this.ball.render(this.ctx);
  }

  private updateScore(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  private showOverlay(message: string, showRestart: boolean = true): void {
    this.messageElement.textContent = message;
    this.restartBtn.style.display = showRestart ? 'block' : 'none';
    this.overlayElement.classList.remove('hidden');
  }

  private hideOverlay(): void {
    this.overlayElement.classList.add('hidden');
  }

  reset(): void {
    this.paddle.reset(this.canvas.width, this.canvas.height);
    this.ball.reset(this.canvas.width, this.canvas.height);
    this.bricks = Brick.createGrid(this.canvas.width);
    this.particles = new ParticleSystem();
    this.score = 0;
    this.state = 'playing';
    this.updateScore();
    this.hideOverlay();
    this.sound.startMusic();
  }

  start(): void {
    // Start music on first user interaction (browser autoplay policy)
    const startMusic = (): void => {
      this.sound.startMusic();
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
    };
    document.addEventListener('click', startMusic);
    document.addEventListener('keydown', startMusic);

    const gameLoop = (): void => {
      this.update();
      this.render();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
}
