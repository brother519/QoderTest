import { Tank, Direction, Position, GameMap } from '../types';
import { TANK_SPEED, BULLET_SPEED } from '../constants';
import { CollisionSystem } from './CollisionSystem';

export class PhysicsSystem {
  static moveTank(tank: Tank, direction: Direction, map: GameMap): Position | null {
    const newPos = { ...tank.position };
    
    switch (direction) {
      case 'up':
        newPos.y -= tank.speed;
        break;
      case 'down':
        newPos.y += tank.speed;
        break;
      case 'left':
        newPos.x -= tank.speed;
        break;
      case 'right':
        newPos.x += tank.speed;
        break;
    }
    
    const testTank: Tank = { ...tank, position: newPos };
    
    if (CollisionSystem.checkTankMapCollision(testTank, map)) {
      return null;
    }
    
    return newPos;
  }

  static moveBullet(bulletPos: Position, direction: Direction, speed: number): Position {
    const newPos = { ...bulletPos };
    
    switch (direction) {
      case 'up':
        newPos.y -= speed;
        break;
      case 'down':
        newPos.y += speed;
        break;
      case 'left':
        newPos.x -= speed;
        break;
      case 'right':
        newPos.x += speed;
        break;
    }
    
    return newPos;
  }

  static isOutOfBounds(pos: Position, canvasWidth: number, canvasHeight: number): boolean {
    return pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight;
  }
}
