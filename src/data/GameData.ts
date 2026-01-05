import { ILevelConfig, EnemyType } from './Types';

// 关卡数据配置
export const LEVEL_DATA: ILevelConfig[] = [
  {
    level: 1,
    scoreThreshold: 1000,
    spawnInterval: 2000,
    enemySpeedMultiplier: 1.0,
    enemyTypes: ['basic']
  },
  {
    level: 2,
    scoreThreshold: 2000,
    spawnInterval: 1800,
    enemySpeedMultiplier: 1.1,
    enemyTypes: ['basic', 'fast']
  },
  {
    level: 3,
    scoreThreshold: 3000,
    spawnInterval: 1600,
    enemySpeedMultiplier: 1.2,
    enemyTypes: ['basic', 'fast']
  },
  {
    level: 4,
    scoreThreshold: 4000,
    spawnInterval: 1500,
    enemySpeedMultiplier: 1.3,
    enemyTypes: ['basic', 'fast']
  },
  {
    level: 5,
    scoreThreshold: 5000,
    spawnInterval: 1400,
    enemySpeedMultiplier: 1.4,
    enemyTypes: ['basic', 'fast']
  },
  {
    level: 6,
    scoreThreshold: 6000,
    spawnInterval: 1300,
    enemySpeedMultiplier: 1.5,
    enemyTypes: ['basic', 'fast', 'boss']
  },
  {
    level: 7,
    scoreThreshold: 7000,
    spawnInterval: 1200,
    enemySpeedMultiplier: 1.6,
    enemyTypes: ['basic', 'fast', 'boss']
  },
  {
    level: 8,
    scoreThreshold: 8000,
    spawnInterval: 1100,
    enemySpeedMultiplier: 1.7,
    enemyTypes: ['basic', 'fast', 'boss']
  },
  {
    level: 9,
    scoreThreshold: 9000,
    spawnInterval: 1000,
    enemySpeedMultiplier: 1.8,
    enemyTypes: ['basic', 'fast', 'boss']
  },
  {
    level: 10,
    scoreThreshold: 10000,
    spawnInterval: 900,
    enemySpeedMultiplier: 2.0,
    enemyTypes: ['basic', 'fast', 'boss']
  }
];

// 敌机数据配置
export const ENEMY_DATA = {
  basic: {
    health: 1,
    speed: 150,
    score: 10,
    color: 0xcc0000 // 红色
  },
  fast: {
    health: 1,
    speed: 250,
    score: 20,
    color: 0xff6600 // 橙色
  },
  boss: {
    health: 20,
    speed: 100,
    score: 100,
    color: 0x9933cc // 紫色
  }
};

// 道具数据配置
export const POWERUP_DATA = {
  health: {
    type: 'health' as const,
    value: 1,
    color: 0x00cc66, // 绿色
    effect: '恢复生命值'
  },
  weapon: {
    type: 'weapon' as const,
    value: 1,
    color: 0xffcc00, // 金色
    effect: '升级武器'
  }
};