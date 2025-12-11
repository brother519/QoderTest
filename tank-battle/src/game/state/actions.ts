import { GameAction, Position, Direction } from '../types';

export const startGame = (): GameAction => ({
  type: 'START_GAME',
});

export const initLevel = (level: number, map: any[][], enemyCount: number): GameAction => ({
  type: 'INIT_LEVEL',
  payload: { level, map, enemyCount },
});

export const shootBullet = (owner: 'player' | 'enemy', position: Position, direction: Direction): GameAction => ({
  type: 'SHOOT_BULLET',
  payload: { owner, position, direction },
});

export const destroyEnemy = (enemyId: string): GameAction => ({
  type: 'DESTROY_ENEMY',
  payload: { enemyId },
});

export const damagePlayer = (): GameAction => ({
  type: 'DAMAGE_PLAYER',
});

export const destroyTile = (x: number, y: number): GameAction => ({
  type: 'DESTROY_TILE',
  payload: { x, y },
});

export const nextLevel = (): GameAction => ({
  type: 'NEXT_LEVEL',
});

export const gameOver = (): GameAction => ({
  type: 'GAME_OVER',
});

export const pause = (): GameAction => ({
  type: 'PAUSE',
});

export const resume = (): GameAction => ({
  type: 'RESUME',
});
