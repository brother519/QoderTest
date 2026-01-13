import type { Tank, GameMap, Position } from '../types';
import { TileType } from '../types';
import { TILE_SIZE, TANK_SIZE } from '../constants';

export class CollisionSystem {
  static checkTankMapCollision(tank: Tank, map: GameMap): boolean {
    const corners = this.getTankCorners(tank.position);
    
    for (const corner of corners) {
      const gridX = Math.floor(corner.x / TILE_SIZE);
      const gridY = Math.floor(corner.y / TILE_SIZE);
      
      if (gridX < 0 || gridX >= map[0].length || gridY < 0 || gridY >= map.length) {
        return true;
      }
      
      const tile = map[gridY][gridX];
      if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.WATER || tile === TileType.BASE) {
        return true;
      }
    }
    
    return false;
  }

  static checkTankTankCollision(tank1: Tank, tank2: Tank): boolean {
    return this.checkAABB(
      tank1.position,
      { x: TANK_SIZE, y: TANK_SIZE },
      tank2.position,
      { x: TANK_SIZE, y: TANK_SIZE }
    );
  }

  static checkBulletMapCollision(bulletPos: Position, map: GameMap): { hit: boolean; gridPos: { x: number; y: number } | null } {
    const gridX = Math.floor(bulletPos.x / TILE_SIZE);
    const gridY = Math.floor(bulletPos.y / TILE_SIZE);
    
    if (gridX < 0 || gridX >= map[0].length || gridY < 0 || gridY >= map.length) {
      return { hit: true, gridPos: null };
    }
    
    const tile = map[gridY][gridX];
    if (tile === TileType.BRICK || tile === TileType.STEEL) {
      return { hit: true, gridPos: { x: gridX, y: gridY } };
    }
    
    if (tile === TileType.BASE) {
      return { hit: true, gridPos: { x: gridX, y: gridY } };
    }
    
    return { hit: false, gridPos: null };
  }

  static checkBulletTankCollision(bulletPos: Position, tank: Tank): boolean {
    const bulletSize = 8;
    return this.checkAABB(
      { x: bulletPos.x - bulletSize / 2, y: bulletPos.y - bulletSize / 2 },
      { x: bulletSize, y: bulletSize },
      tank.position,
      { x: TANK_SIZE, y: TANK_SIZE }
    );
  }

  private static getTankCorners(pos: Position): Position[] {
    return [
      { x: pos.x, y: pos.y },
      { x: pos.x + TANK_SIZE - 1, y: pos.y },
      { x: pos.x, y: pos.y + TANK_SIZE - 1 },
      { x: pos.x + TANK_SIZE - 1, y: pos.y + TANK_SIZE - 1 },
    ];
  }

  private static checkAABB(pos1: Position, size1: { x: number; y: number }, pos2: Position, size2: { x: number; y: number }): boolean {
    return (
      pos1.x < pos2.x + size2.x &&
      pos1.x + size1.x > pos2.x &&
      pos1.y < pos2.y + size2.y &&
      pos1.y + size1.y > pos2.y
    );
  }
}