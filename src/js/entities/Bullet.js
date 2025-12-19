import { GameObject } from './GameObject.js';
import { CONFIG } from '../utils/Config.js';

export class Bullet extends GameObject {
  constructor(x, y, isPlayerBullet = true) {
    super(x, y, CONFIG.BULLET.WIDTH, CONFIG.BULLET.HEIGHT);
    
    this.isPlayerBullet = isPlayerBullet;
    this.damage = CONFIG.BULLET.DAMAGE;
    this.speed = CONFIG.BULLET.SPEED;
    this.color = isPlayerBullet ? CONFIG.BULLET.COLOR : '#ff0000';
    
    this.vy = isPlayerBullet ? -this.speed : this.speed;
    
    this.penetration = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    if (this.isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
      this.destroy();
    }
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    if (this.isPlayerBullet) {
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height / 2);
    }
  }

  hit() {
    if (this.penetration > 0) {
      this.penetration--;
    } else {
      this.destroy();
    }
  }
}
