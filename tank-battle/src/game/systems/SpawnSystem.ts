import { Tank, EnemyType, Position } from '../types';
import { MAX_ENEMIES_ON_SCREEN, SPAWN_INVINCIBILITY_FRAMES } from '../constants';
import { LevelManager } from '../levels/LevelManager';
import { AISystem } from './AISystem';

export class SpawnSystem {
  private static spawnTimer = 0;
  private static spawnPositions = LevelManager.getEnemySpawnPositions();
  private static nextSpawnIndex = 0;

  static canSpawn(currentEnemies: number, spawnQueue: number): boolean {
    return currentEnemies < MAX_ENEMIES_ON_SCREEN && spawnQueue > 0;
  }

  static trySpawn(enemies: Tank[], spawnQueue: number): Tank | null {
    this.spawnTimer++;

    if (this.spawnTimer < 180) {
      return null;
    }

    if (!this.canSpawn(enemies.length, spawnQueue)) {
      return null;
    }

    const spawnPos = this.getNextSpawnPosition(enemies);
    if (!spawnPos) {
      return null;
    }

    this.spawnTimer = 0;

    const enemyType = this.selectEnemyType();
    return this.createEnemy(spawnPos, enemyType);
  }

  private static getNextSpawnPosition(enemies: Tank[]): Position | null {
    for (let i = 0; i < this.spawnPositions.length; i++) {
      const pos = this.spawnPositions[this.nextSpawnIndex];
      this.nextSpawnIndex = (this.nextSpawnIndex + 1) % this.spawnPositions.length;

      const isOccupied = enemies.some(enemy => {
        const dx = Math.abs(enemy.position.x - pos.x);
        const dy = Math.abs(enemy.position.y - pos.y);
        return dx < 48 && dy < 48;
      });

      if (!isOccupied) {
        return pos;
      }
    }

    return null;
  }

  private static selectEnemyType(): EnemyType {
    const rand = Math.random();
    if (rand < 0.6) return 'basic';
    if (rand < 0.9) return 'fast';
    return 'armored';
  }

  private static createEnemy(position: Position, enemyType: EnemyType): Tank {
    return {
      id: `enemy_${Date.now()}_${Math.random()}`,
      type: 'enemy',
      position: { ...position },
      direction: 'down',
      speed: AISystem.getEnemySpeed(enemyType),
      isAlive: true,
      isSpawning: true,
      spawnTimer: SPAWN_INVINCIBILITY_FRAMES,
      shootCooldown: 0,
      health: AISystem.getEnemyHealth(enemyType),
      enemyType,
    };
  }

  static reset(): void {
    this.spawnTimer = 0;
    this.nextSpawnIndex = 0;
  }
}
