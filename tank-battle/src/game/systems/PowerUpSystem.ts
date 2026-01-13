import type { PowerUp, PowerUpType, Position, Tank } from '../types';
import { POWERUP_LIFETIME, TILE_SIZE } from '../constants';

export class PowerUpSystem {
  private static spawnTimer = 0;
  private static readonly SPAWN_INTERVAL = 1200;

  static trySpawnPowerUp(enemies: Tank[], powerUps: PowerUp[]): PowerUp | null {
    this.spawnTimer++;

    if (this.spawnTimer < this.SPAWN_INTERVAL) {
      return null;
    }

    if (powerUps.length >= 1) {
      return null;
    }

    if (Math.random() > 0.3) {
      return null;
    }

    this.spawnTimer = 0;

    const type = this.selectPowerUpType();
    const position = this.getRandomPosition(enemies);

    return {
      id: `powerup_${Date.now()}_${Math.random()}`,
      type,
      position,
      spawnTime: Date.now(),
    };
  }

  static checkExpiredPowerUps(powerUps: PowerUp[]): PowerUp[] {
    const now = Date.now();
    return powerUps.filter(powerUp => (now - powerUp.spawnTime) < POWERUP_LIFETIME);
  }

  static checkPowerUpCollection(powerUp: PowerUp, tank: Tank): boolean {
    const dx = Math.abs(tank.position.x + 16 - powerUp.position.x);
    const dy = Math.abs(tank.position.y + 16 - powerUp.position.y);
    return dx < 24 && dy < 24;
  }

  static applyPowerUp(tank: Tank, powerUpType: PowerUpType): Tank {
    const updatedTank = { ...tank };

    switch (powerUpType) {
      case 'shield':
        updatedTank.hasShield = true;
        updatedTank.shieldTimer = 300;
        break;
      case 'rapidFire':
        updatedTank.rapidFire = true;
        updatedTank.rapidFireTimer = 600;
        break;
      case 'extraLife':
        break;
    }

    return updatedTank;
  }

  static updatePowerUpTimers(tank: Tank): Tank {
    const updatedTank = { ...tank };

    if (updatedTank.shieldTimer && updatedTank.shieldTimer > 0) {
      updatedTank.shieldTimer--;
      if (updatedTank.shieldTimer === 0) {
        updatedTank.hasShield = false;
      }
    }

    if (updatedTank.rapidFireTimer && updatedTank.rapidFireTimer > 0) {
      updatedTank.rapidFireTimer--;
      if (updatedTank.rapidFireTimer === 0) {
        updatedTank.rapidFire = false;
      }
    }

    return updatedTank;
  }

  private static selectPowerUpType(): PowerUpType {
    const rand = Math.random();
    if (rand < 0.4) return 'shield';
    if (rand < 0.7) return 'rapidFire';
    return 'extraLife';
  }

  private static getRandomPosition(enemies: Tank[]): Position {
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * 20 + 3) * TILE_SIZE;
      const y = Math.floor(Math.random() * 20 + 3) * TILE_SIZE;

      const tooCloseToEnemy = enemies.some(enemy => {
        const dx = Math.abs(enemy.position.x - x);
        const dy = Math.abs(enemy.position.y - y);
        return dx < 100 && dy < 100;
      });

      if (!tooCloseToEnemy) {
        return { x, y };
      }

      attempts++;
    }

    return { x: 200, y: 200 };
  }

  static reset(): void {
    this.spawnTimer = 0;
  }
}
