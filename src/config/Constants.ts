export const GAME_WIDTH = 832;
export const GAME_HEIGHT = 832;

export const GRID_SIZE = 26;
export const TILE_SIZE = 16;

export const MAP_WIDTH = GRID_SIZE * TILE_SIZE;
export const MAP_HEIGHT = GRID_SIZE * TILE_SIZE;

export const PLAYER_SPEED = 100;
export const BULLET_SPEED = 200;

export const MAX_PLAYER_BULLETS = 2;
export const MAX_ENEMY_BULLETS = 1;

export const SHOOT_COOLDOWN = 300;

export const PLAYER_LIVES = 3;

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum TankType {
  PLAYER = 'PLAYER',
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
  SPECIAL = 'SPECIAL'
}

export enum TerrainType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  RIVER = 3,
  GRASS = 4
}

export enum PowerUpType {
  TANK = 'TANK',
  GRENADE = 'GRENADE',
  STAR = 'STAR',
  SHOVEL = 'SHOVEL',
  HELMET = 'HELMET',
  CLOCK = 'CLOCK'
}
