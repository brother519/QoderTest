import { GameObject } from './GameObject.js';

export class Enemy extends GameObject {
  constructor(x, y, width, height, config) {
    super(x, y, width, height);
    
    this.health = config.health || 1;
    this.maxHealth = this.health;
    this.speed = config.speed || 2;
    this.score = config.score || 10;
    this.color = config.color || '#ff0000';
    
    this.vy = this.speed;
    
    this.canShoot = config.canShoot || false;
    this.shootInterval = config.shootInterval || 1500;
    this.lastShootTime = 0;
    
    this.movementPattern = config.movementPattern || 'straight';
    this.movementTime = 0;
    this.movementAmplitude = config.movementAmplitude || 50;
    this.movementFrequency = config.movementFrequency || 0.002;
  }

  update(deltaTime) {
    this.movementTime += deltaTime;
    
    switch (this.movementPattern) {
      case 'straight':
        this.vx = 0;
        break;
      
      case 'sine':
        this.vx = Math.sin(this.movementTime * this.movementFrequency) * this.movementAmplitude * 0.01;
        break;
      
      case 'zigzag':
        this.vx = (Math.floor(this.movementTime / 500) % 2 === 0 ? 1 : -1) * 2;
        break;
    }
    
    super.update(deltaTime);
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x + 10, this.y + this.height, 10, 10);
    ctx.fillRect(this.x + this.width - 20, this.y + this.height, 10, 10);
    
    if (this.health < this.maxHealth) {
      const healthBarWidth = this.width;
      const healthBarHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      
      ctx.fillStyle = '#333333';
      ctx.fillRect(this.x, this.y - 8, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x, this.y - 8, healthBarWidth * healthPercent, healthBarHeight);
    }
  }

  shouldShoot(currentTime) {
    if (!this.canShoot) return false;
    
    if (currentTime - this.lastShootTime >= this.shootInterval) {
      this.lastShootTime = currentTime;
      return true;
    }
    
    return false;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
