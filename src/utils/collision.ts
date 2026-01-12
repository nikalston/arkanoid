import { Ball } from '../entities/ball.ts';
import { Paddle } from '../entities/paddle.ts';
import { Brick } from '../entities/brick.ts';

export function checkWallCollision(ball: Ball, canvasWidth: number, canvasHeight: number): 'left' | 'right' | 'top' | 'bottom' | null {
  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    return 'left';
  }
  if (ball.x + ball.radius >= canvasWidth) {
    ball.x = canvasWidth - ball.radius;
    return 'right';
  }
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    return 'top';
  }
  if (ball.y + ball.radius >= canvasHeight) {
    return 'bottom';
  }
  return null;
}

export function checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.dy > 0
  ) {
    const hitPoint = (ball.x - paddle.x) / paddle.width;
    const angle = (hitPoint - 0.5) * Math.PI * 0.7;

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = speed * Math.sin(angle);
    ball.dy = -speed * Math.cos(angle);

    ball.y = paddle.y - ball.radius;
    return true;
  }
  return false;
}

export function checkBrickCollision(ball: Ball, brick: Brick): boolean {
  if (!brick.active) return false;

  const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
  const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance <= ball.radius) {
    brick.active = false;

    const overlapLeft = ball.x + ball.radius - brick.x;
    const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - brick.y;
    const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapX < minOverlapY) {
      ball.bounceX();
    } else {
      ball.bounceY();
    }

    return true;
  }
  return false;
}
