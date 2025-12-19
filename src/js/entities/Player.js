import { GameObject } from './GameObject.js';
import { CONFIG } from '../utils/Config.js';

export class Player extends GameObject {
  constructor(x, y) {
    super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT);
    
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.speed = CONFIG.PLAYER.SPEED;
    this.color = CONFIG.PLAYER.COLOR;
    
    this.firePower = 1;
    this.lastFireTime = 0;
    this.fireRate = CONFIG.PLAYER.FIRE_RATE;
    
    this.isInvincible = false;
    this.hasShield = false;
    
    this.canvasWidth = CONFIG.CANVAS_WIDTH;
    this.canvasHeight = CONFIG.CANVAS_HEIGHT;
  }

  update(deltaTime, inputManager) {
    this.vx = 0;
    this.vy = 0;
    
    if (inputManager.isUpPressed()) {
      this.vy = -this.speed;
    }
    if (inputManager.isDownPressed()) {
      this.vy = this.speed;
    }
    if (inputManager.isLeftPressed()) {
      this.vx = -this.speed;
    }
    if (inputManager.isRightPressed()) {
      this.vx = this.speed;
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    this.x = Math.max(0, Math.min(this.x, this.canvasWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.canvasHeight - this.height));
  }

  render(ctx) {
    if (!this.visible) return;
    
    if (this.hasShield) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.getCenterX(), this.getCenterY(), this.width / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x + 10, this.y - 10, 10, 15);
    ctx.fillRect(this.x + this.width - 20, this.y - 10, 10, 15);
    
    if (this.isInvincible) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
      ctx.globalAlpha = 1;
    }
  }

  canFire(currentTime) {
    return currentTime - this.lastFireTime >= this.fireRate;
  }

  fire(currentTime) {
    this.lastFireTime = currentTime;
  }

  upgradeFire() {
    this.firePower = Math.min(this.firePower + 1, 3);
  }

  addShield() {
    this.hasShield = true;
  }

  removeShield() {
    this.hasShield = false;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  takeDamage(damage) {
    if (this.isInvincible) return;
    
    if (this.hasShield) {
      this.hasShield = false;
      return;
    }
    
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
    }
  }
}
