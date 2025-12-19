import { Enemy } from './Enemy.js';
import { CONFIG } from '../utils/Config.js';

export class EnemyTypes {
  static createSmallEnemy(x, y) {
    return new Enemy(x, y, CONFIG.ENEMY.SMALL.WIDTH, CONFIG.ENEMY.SMALL.HEIGHT, {
      health: CONFIG.ENEMY.SMALL.HEALTH,
      speed: CONFIG.ENEMY.SMALL.SPEED,
      score: CONFIG.ENEMY.SMALL.SCORE,
      color: CONFIG.ENEMY.SMALL.COLOR,
      canShoot: false,
      movementPattern: 'straight'
    });
  }

  static createMediumEnemy(x, y) {
    return new Enemy(x, y, CONFIG.ENEMY.MEDIUM.WIDTH, CONFIG.ENEMY.MEDIUM.HEIGHT, {
      health: CONFIG.ENEMY.MEDIUM.HEALTH,
      speed: CONFIG.ENEMY.MEDIUM.SPEED,
      score: CONFIG.ENEMY.MEDIUM.SCORE,
      color: CONFIG.ENEMY.MEDIUM.COLOR,
      canShoot: true,
      shootInterval: 2000,
      movementPattern: 'zigzag'
    });
  }

  static createLargeEnemy(x, y) {
    return new Enemy(x, y, CONFIG.ENEMY.LARGE.WIDTH, CONFIG.ENEMY.LARGE.HEIGHT, {
      health: CONFIG.ENEMY.LARGE.HEALTH,
      speed: CONFIG.ENEMY.LARGE.SPEED,
      score: CONFIG.ENEMY.LARGE.SCORE,
      color: CONFIG.ENEMY.LARGE.COLOR,
      canShoot: true,
      shootInterval: 1500,
      movementPattern: 'sine',
      movementAmplitude: 100
    });
  }

  static createRandomEnemy(canvasWidth) {
    const x = Math.random() * (canvasWidth - 80) + 20;
    const y = -50;
    
    const rand = Math.random();
    
    if (rand < 0.6) {
      return this.createSmallEnemy(x, y);
    } else if (rand < 0.9) {
      return this.createMediumEnemy(x, y);
    } else {
      return this.createLargeEnemy(x, y);
    }
  }
}
