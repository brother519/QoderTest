// 游戏类型定义

export type MovementPattern = 'straight' | 'zigzag' | 'curve' | 'horizontal';

export type PowerUpType = 'health' | 'weapon';

export type EnemyType = 'basic' | 'fast' | 'boss';

export interface IEnemy {
  health: number;
  speed: number;
  score: number;
  movementPattern: MovementPattern;
}

export interface IPowerUp {
  type: PowerUpType;
  speed: number;
}

export interface IWeaponConfig {
  level: number;
  bulletCount: number;
  fireRate: number;
}

export interface ILevelConfig {
  level: number;
  scoreThreshold: number;
  spawnInterval: number;
  enemySpeedMultiplier: number;
  enemyTypes: EnemyType[];
}

export interface IScoreData {
  score: number;
  name: string;
  date: string;
}
