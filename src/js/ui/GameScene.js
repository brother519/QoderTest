import { CONFIG } from '../utils/Config.js';
import { Player } from '../entities/Player.js';
import { InputManager } from '../core/InputManager.js';
import { Bullet } from '../entities/Bullet.js';
import { EnemyTypes } from '../entities/EnemyTypes.js';
import { Pool } from '../utils/Pool.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { LevelManager } from '../levels/LevelManager.js';
import { Level1 } from '../levels/Level1.js';
import { Level2 } from '../levels/Level2.js';
import { Level3 } from '../levels/Level3.js';
import { HUD } from './HUD.js';

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
    this.levelManager = new LevelManager();
    this.hud = new HUD();
    
    this.score = 0;
    this.currentTime = 0;
    
    this.levels = [Level1, Level2, Level3];
    this.currentLevelIndex = 0;
    
    this.spawnQueue = [];
    this.gameOver = false;
    this.levelTransition = false;
    this.levelTransitionTimer = 0;
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
    this.currentTime = 0;
    this.gameOver = false;
    this.levelTransition = false;
    
    this.currentLevelIndex = 0;
    this.levelManager.reset();
    this.levelManager.loadLevel(this.levels[this.currentLevelIndex]);
  }

  update(deltaTime) {
    if (this.gameOver) return;
    
    if (this.levelTransition) {
      this.levelTransitionTimer += deltaTime;
      if (this.levelTransitionTimer >= 3000) {
        this.levelTransition = false;
        this.levelTransitionTimer = 0;
        
        this.currentLevelIndex++;
        if (this.currentLevelIndex < this.levels.length) {
          this.levelManager.nextLevel();
          this.levelManager.loadLevel(this.levels[this.currentLevelIndex]);
        } else {
          console.log('Game completed! All levels cleared!');
          this.gameOver = true;
        }
      }
      return;
    }
    
    if (!this.player || !this.player.active) {
      this.gameOver = true;
      console.log('Game Over! Final Score:', this.score);
      return;
    }
    
    this.currentTime += deltaTime;
    
    this.player.update(deltaTime, this.inputManager);
    
    if (this.inputManager.isShootPressed() && this.player.canFire(this.currentTime)) {
      this.spawnPlayerBullets();
      this.player.fire(this.currentTime);
    }
    
    this.playerBulletPool.update(deltaTime);
    this.enemyBulletPool.update(deltaTime);
    
    this.updateEnemies(deltaTime);
    
    const enemiesToSpawn = this.levelManager.update(deltaTime, this.currentTime);
    if (enemiesToSpawn) {
      enemiesToSpawn.forEach(enemyData => {
        setTimeout(() => {
          this.spawnEnemyByType(enemyData.type);
        }, enemyData.delay);
      });
    }
    
    const collisionResults = this.collisionSystem.handleCollisions(
      this.playerBulletPool.getActiveObjects(),
      this.enemyBulletPool.getActiveObjects(),
      this.enemies,
      this.player
    );
    
    this.score += collisionResults.score;
    if (collisionResults.enemiesDestroyed > 0) {
      for (let i = 0; i < collisionResults.enemiesDestroyed; i++) {
        this.levelManager.onEnemyKilled();
      }
    }
    
    if (this.levelManager.isLevelComplete() && this.enemies.length === 0) {
      console.log('Level complete! Starting transition...');
      this.levelTransition = true;
      this.levelTransitionTimer = 0;
    }
    
    this.backgroundOffset += this.backgroundSpeed;
    if (this.backgroundOffset > CONFIG.CANVAS_HEIGHT) {
      this.backgroundOffset = 0;
    }
  }

  spawnEnemyByType(type) {
    let enemy;
    switch (type) {
      case 'small':
        enemy = EnemyTypes.createSmallEnemy(
          Math.random() * (CONFIG.CANVAS_WIDTH - 80) + 20,
          -50
        );
        break;
      case 'medium':
        enemy = EnemyTypes.createMediumEnemy(
          Math.random() * (CONFIG.CANVAS_WIDTH - 80) + 20,
          -50
        );
        break;
      case 'large':
        enemy = EnemyTypes.createLargeEnemy(
          Math.random() * (CONFIG.CANVAS_WIDTH - 100) + 20,
          -50
        );
        break;
    }
    if (enemy) {
      this.enemies.push(enemy);
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

  render(ctx) {
    this.renderBackground(ctx);
    
    this.playerBulletPool.render(ctx);
    this.enemyBulletPool.render(ctx);
    
    this.enemies.forEach(enemy => enemy.render(ctx));
    
    if (this.player) {
      this.player.render(ctx);
    }
    
    this.hud.render(ctx, {
      player: this.player,
      score: this.score,
      level: this.levelManager.getCurrentLevel(),
      levelProgress: this.levelManager.getProgress(),
      enemies: this.enemies.length
    });
    
    if (this.levelTransition) {
      this.renderLevelTransition(ctx);
    }
    
    if (this.gameOver) {
      this.renderGameOver(ctx);
    }
  }

  renderLevelTransition(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('关卡完成!', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`得分: ${this.score}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 10);
    
    if (this.currentLevelIndex + 1 < this.levels.length) {
      ctx.fillText('准备下一关...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 50);
    } else {
      ctx.fillStyle = '#ffff00';
      ctx.font = '36px Arial';
      ctx.fillText('恭喜通关!', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 50);
    }
  }

  renderGameOver(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.fillText(`最终得分: ${this.score}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 20);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('刷新页面重新开始', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 80);
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

  exit() {
    console.log('Exiting game scene...');
  }
}