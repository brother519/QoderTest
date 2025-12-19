import { CONFIG } from '../utils/Config.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../core/InputManager.js';
import { Bullet } from '../entities/Bullet.js';
import { EnemyTypes } from '../entities/EnemyTypes.js';
import { Pool } from '../utils/Pool.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';

export class GameScene {
  constructor(game) {
    this.game = game;
    this.inputManager = new InputManager();
    this.player = null;
    
    this.backgroundOffset = 0;
    this.backgroundSpeed = 1;
    
    this.playerBulletPool = new Pool(() => new Bullet(0, 0, true), 100);
    this.enemyBulletPool = new Pool(() => new Bullet(0, 0, false), 100);
    this.enemies = [];
    
    this.collisionSystem = new CollisionSystem();
    
    this.score = 0;
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 1500;
    
    this.currentTime = 0;
  }

  enter() {
    console.log('Entering game scene...');
    
    const playerX = CONFIG.CANVAS_WIDTH / 2 - CONFIG.PLAYER.WIDTH / 2;
    const playerY = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER.HEIGHT - 50;
    this.player = new Player(playerX, playerY);
    
    this.score = 0;
    this.enemies = [];
    this.playerBulletPool.releaseAll();
    this.enemyBulletPool.releaseAll();
  }

  update(deltaTime) {
    if (!this.player || !this.player.active) return;
    
    this.currentTime += deltaTime;
    
    this.player.update(deltaTime, this.inputManager);
    
    if (this.inputManager.isShootPressed() && this.player.canFire(this.currentTime)) {
      this.spawnPlayerBullets();
      this.player.fire(this.currentTime);
    }
    
    this.playerBulletPool.update(deltaTime);
    this.enemyBulletPool.update(deltaTime);
    
    this.updateEnemies(deltaTime);
    
    this.spawnEnemies(deltaTime);
    
    const collisionResults = this.collisionSystem.handleCollisions(
      this.playerBulletPool.getActiveObjects(),
      this.enemyBulletPool.getActiveObjects(),
      this.enemies,
      this.player
    );
    
    this.score += collisionResults.score;
    
    this.backgroundOffset += this.backgroundSpeed;
    if (this.backgroundOffset > CONFIG.CANVAS_HEIGHT) {
      this.backgroundOffset = 0;
    }
  }

  spawnPlayerBullets() {
    const centerX = this.player.getCenterX();
    const topY = this.player.y;
    
    if (this.player.firePower === 1) {
      const bullet = this.playerBulletPool.get();
      bullet.x = centerX - bullet.width / 2;
      bullet.y = topY - bullet.height;
      bullet.vy = -CONFIG.BULLET.SPEED;
    } else if (this.player.firePower === 2) {
      const bullet1 = this.playerBulletPool.get();
      bullet1.x = this.player.x + 10;
      bullet1.y = topY - bullet1.height;
      bullet1.vy = -CONFIG.BULLET.SPEED;
      
      const bullet2 = this.playerBulletPool.get();
      bullet2.x = this.player.x + this.player.width - 10 - bullet2.width;
      bullet2.y = topY - bullet2.height;
      bullet2.vy = -CONFIG.BULLET.SPEED;
    } else if (this.player.firePower >= 3) {
      const bullet1 = this.playerBulletPool.get();
      bullet1.x = centerX - bullet1.width / 2;
      bullet1.y = topY - bullet1.height;
      bullet1.vy = -CONFIG.BULLET.SPEED;
      
      const bullet2 = this.playerBulletPool.get();
      bullet2.x = this.player.x + 5;
      bullet2.y = topY;
      bullet2.vy = -CONFIG.BULLET.SPEED;
      bullet2.vx = -1;
      
      const bullet3 = this.playerBulletPool.get();
      bullet3.x = this.player.x + this.player.width - 5 - bullet3.width;
      bullet3.y = topY;
      bullet3.vy = -CONFIG.BULLET.SPEED;
      bullet3.vx = 1;
    }
  }

  updateEnemies(deltaTime) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      enemy.update(deltaTime);
      
      if (enemy.shouldShoot(this.currentTime)) {
        this.spawnEnemyBullet(enemy);
      }
      
      if (!enemy.active || enemy.isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
        this.enemies.splice(i, 1);
      }
    }
  }

  spawnEnemyBullet(enemy) {
    const bullet = this.enemyBulletPool.get();
    bullet.x = enemy.getCenterX() - bullet.width / 2;
    bullet.y = enemy.y + enemy.height;
    bullet.vy = CONFIG.BULLET.SPEED * 0.7;
  }

  spawnEnemies(deltaTime) {
    this.enemySpawnTimer += deltaTime;
    
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;
      
      const enemy = EnemyTypes.createRandomEnemy(CONFIG.CANVAS_WIDTH);
      this.enemies.push(enemy);
    }
  }

  render(ctx) {
    this.renderBackground(ctx);
    
    this.playerBulletPool.render(ctx);
    this.enemyBulletPool.render(ctx);
    
    this.enemies.forEach(enemy => enemy.render(ctx));
    
    if (this.player) {
      this.player.render(ctx);
    }
    
    this.renderHUD(ctx);
  }

  renderBackground(ctx) {
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 73) % CONFIG.CANVAS_WIDTH;
      const y = ((i * 137) % CONFIG.CANVAS_HEIGHT + this.backgroundOffset) % CONFIG.CANVAS_HEIGHT;
      const size = (i % 3) + 1;
      ctx.fillRect(x, y, size, size);
    }
  }

  renderHUD(ctx) {
    if (!this.player) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText(`生命: ${this.player.health}/${this.player.maxHealth}`, 10, 30);
    
    ctx.fillStyle = '#ff0000';
    const barWidth = 200;
    const barHeight = 20;
    const barX = 10;
    const barY = 40;
    
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    const healthPercent = this.player.health / this.player.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`火力等级: ${this.player.firePower}`, 10, 85);
    ctx.fillText(`分数: ${this.score}`, 10, 110);
    ctx.fillText(`敌机: ${this.enemies.length}`, 10, 135);
  }

  exit() {
    console.log('Exiting game scene...');
  }
}