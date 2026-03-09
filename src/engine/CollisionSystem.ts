import type { Entity, Bullet } from '../types/game';
import { TileType, Direction } from '../types/game';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../constants/config';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function entityOverlap(a: Entity, b: Entity): boolean {
  return aabbOverlap(a, b);
}

/**
 * Get tiles that an entity overlaps with.
 * Returns array of {row, col} grid coordinates.
 */
export function getOverlappingTiles(entity: AABB): { row: number; col: number }[] {
  const tiles: { row: number; col: number }[] = [];
  const startCol = Math.floor(entity.x / TILE_SIZE);
  const endCol = Math.floor((entity.x + entity.width - 0.01) / TILE_SIZE);
  const startRow = Math.floor(entity.y / TILE_SIZE);
  const endRow = Math.floor((entity.y + entity.height - 0.01) / TILE_SIZE);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
        tiles.push({ row, col });
      }
    }
  }
  return tiles;
}

/**
 * Check if a moving entity would collide with solid tiles.
 */
export function canMove(
  entity: AABB,
  dx: number,
  dy: number,
  mapData: number[][],
): boolean {
  const newBox: AABB = {
    x: entity.x + dx,
    y: entity.y + dy,
    width: entity.width,
    height: entity.height,
  };

  // Map bounds
  if (newBox.x < 0 || newBox.y < 0 ||
      newBox.x + newBox.width > MAP_COLS * TILE_SIZE ||
      newBox.y + newBox.height > MAP_ROWS * TILE_SIZE) {
    return false;
  }

  const tiles = getOverlappingTiles(newBox);
  for (const { row, col } of tiles) {
    const tile = mapData[row]?.[col];
    if (tile === TileType.BRICK || tile === TileType.STEEL ||
        tile === TileType.WATER || tile === TileType.BASE) {
      return false;
    }
  }
  return true;
}

/**
 * Check bullet collision with map tiles.
 * Returns hit tile info or null.
 */
export function bulletTileCollision(
  bullet: Bullet,
  mapData: number[][],
): { row: number; col: number; tileType: TileType } | null {
  const tiles = getOverlappingTiles(bullet);
  for (const { row, col } of tiles) {
    const tile = mapData[row]?.[col];
    if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.BASE) {
      return { row, col, tileType: tile as TileType };
    }
  }
  return null;
}

/**
 * Get movement delta from direction.
 */
export function directionDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case Direction.UP: return { dx: 0, dy: -1 };
    case Direction.DOWN: return { dx: 0, dy: 1 };
    case Direction.LEFT: return { dx: -1, dy: 0 };
    case Direction.RIGHT: return { dx: 1, dy: 0 };
  }
}

/**
 * Snap entity to grid alignment for smoother turning.
 */
export function snapToGrid(value: number, gridSize: number = TILE_SIZE / 2): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if entity is out of map bounds.
 */
export function isOutOfBounds(entity: AABB): boolean {
  return (
    entity.x + entity.width < 0 ||
    entity.x > MAP_COLS * TILE_SIZE ||
    entity.y + entity.height < 0 ||
    entity.y > MAP_ROWS * TILE_SIZE
  );
}

/**
 * Check if two tanks collide (for tank vs tank blocking).
 */
export function tanksCollide(
  movingTank: AABB,
  dx: number,
  dy: number,
  otherTanks: Entity[],
): boolean {
  const newBox: AABB = {
    x: movingTank.x + dx,
    y: movingTank.y + dy,
    width: movingTank.width,
    height: movingTank.height,
  };

  for (const other of otherTanks) {
    if (aabbOverlap(newBox, other)) {
      return true;
    }
  }
  return false;
}
