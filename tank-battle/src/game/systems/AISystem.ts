import type { Tank, Direction, EnemyType, Position, GameMap } from '../types';
import { ENEMY_THINK_INTERVAL, TANK_SPEED } from '../constants';
import { PathfindingSystem } from './PathfindingSystem';

export class AISystem {
  private static thinkTimers = new Map<string, number>();
  private static currentDirections = new Map<string, Direction>();
  private static pathfindingMode = new Map<string, boolean>();

  static updateEnemy(enemy: Tank, playerPos: Position | null, map: GameMap): { newDirection?: Direction; shouldShoot: boolean } {
    if (!this.thinkTimers.has(enemy.id)) {
      this.thinkTimers.set(enemy.id, ENEMY_THINK_INTERVAL);
      this.currentDirections.set(enemy.id, enemy.direction);
      this.pathfindingMode.set(enemy.id, Math.random() < 0.4);
    }

    let timer = this.thinkTimers.get(enemy.id)!;
    timer--;
    this.thinkTimers.set(enemy.id, timer);

    let newDirection: Direction | undefined;

    if (timer <= 0) {
      const usePathfinding = this.pathfindingMode.get(enemy.id) && playerPos;
      
      if (usePathfinding && playerPos) {
        const pathDirection = PathfindingSystem.findPath(enemy.position, playerPos, map);
        if (pathDirection) {
          newDirection = pathDirection;
        } else {
          newDirection = this.getRandomDirection();
        }
      } else {
        const shouldChange = Math.random() < 0.3;
        if (shouldChange) {
          newDirection = this.getRandomDirection();
        } else {
          newDirection = this.currentDirections.get(enemy.id) || enemy.direction;
        }
      }
      
      this.currentDirections.set(enemy.id, newDirection);
      this.thinkTimers.set(enemy.id, ENEMY_THINK_INTERVAL);
    }

    const shouldShoot = this.decideShooting(enemy, playerPos);

    return { newDirection, shouldShoot };
  }

  static handleCollision(enemy: Tank): Direction {
    const newDirection = this.getRandomDirection();
    this.currentDirections.set(enemy.id, newDirection);
    this.thinkTimers.set(enemy.id, ENEMY_THINK_INTERVAL);
    return newDirection;
  }

  static cleanup(enemyId: string): void {
    this.thinkTimers.delete(enemyId);
    this.currentDirections.delete(enemyId);
    this.pathfindingMode.delete(enemyId);
  }

  private static getRandomDirection(): Direction {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  private static decideShooting(enemy: Tank, playerPos: Position | null): boolean {
    if (Math.random() < 0.02) {
      return true;
    }

    if (!playerPos) return false;

    const distance = Math.sqrt(
      Math.pow(enemy.position.x - playerPos.x, 2) + 
      Math.pow(enemy.position.y - playerPos.y, 2)
    );
    
    if (distance > 300) return false;

    const isAlignedX = Math.abs(enemy.position.x - playerPos.x) < 32;
    const isAlignedY = Math.abs(enemy.position.y - playerPos.y) < 32;

    if (isAlignedX && enemy.direction === 'up' && playerPos.y < enemy.position.y) {
      return Math.random() < 0.15;
    }
    if (isAlignedX && enemy.direction === 'down' && playerPos.y > enemy.position.y) {
      return Math.random() < 0.15;
    }
    if (isAlignedY && enemy.direction === 'left' && playerPos.x < enemy.position.x) {
      return Math.random() < 0.15;
    }
    if (isAlignedY && enemy.direction === 'right' && playerPos.x > enemy.position.x) {
      return Math.random() < 0.15;
    }

    if (isAlignedX || isAlignedY) {
      return Math.random() < 0.05;
    }

    return false;
  }

  static getEnemySpeed(enemyType: EnemyType): number {
    switch (enemyType) {
      case 'fast':
        return TANK_SPEED * 1.5;
      case 'basic':
      case 'armored':
      default:
        return TANK_SPEED;
    }
  }

  static getEnemyHealth(enemyType: EnemyType): number {
    return enemyType === 'armored' ? 2 : 1;
  }
}