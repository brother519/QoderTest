export const GAME_WIDTH = 832;
export const GAME_HEIGHT = 832;
export const TILE_SIZE = 32;
export const GRID_SIZE = 26;

export const TANK_SPEED = 100;
export const BULLET_SPEED = 300;
export const SHOOT_COOLDOWN = 500;

export const PLAYER_LIVES = 3;
export const ENEMY_SPAWN_DELAY = 3000;

export const COLORS = {
  PLAYER1: 0x0066ff,
  PLAYER2: 0x00ff66,
  ENEMY: 0xff0000,
  BRICK: 0x8b4513,
  STEEL: 0x808080,
  BASE: 0xffff00,
  BULLET: 0xffffff,
};

export enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
}

export enum TerrainType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
}
