/**
 * 飞机大战游戏配置常量
 *
 * 定义游戏中所有常量配置，包括画布尺寸、玩家属性、子弹参数、
 * 敌机类型（小/中/大/Boss）、难度递增规则、道具效果等。
 *
 * @module aircraft-battle/constants/config
 */

import { AircraftGameConfig } from '../types/game';

/** 游戏核心配置 */
export const AIRCRAFT_CONFIG: AircraftGameConfig = {
  // 画布尺寸
  width: 400,
  height: 600,

  // 玩家配置
  playerSpeed: 5,
  initialLives: 3,
  baseFireRate: 150, // ms
  invincibleDuration: 2000, // ms

  // 子弹配置
  playerBulletSpeed: 8,
  enemyBulletSpeed: 4,
  playerBulletSize: { w: 4, h: 10 },
  enemyBulletSize: { w: 6, h: 6 },

  // 敌机生成配置
  baseSpawnInterval: 1000, // ms
  powerUpDropRate: 0.15, // 15% 掉落概率

  // 难度递增配置
  difficultyStep: 0.1, // 每级难度增加10%速度
  difficultyScoreThreshold: 1000, // 每1000分增加难度
  bossScoreThreshold: 5000, // 每5000分出现Boss

  // 敌机类型配置
  enemyTypes: {
    small: {
      width: 30,
      height: 24,
      speedMin: 2,
      speedMax: 3,
      hp: 1,
      points: 100,
      shootInterval: 0, // 不射击
      spawnWeight: 60, // 60% 生成概率
    },
    medium: {
      width: 46,
      height: 36,
      speedMin: 1.5,
      speedMax: 2,
      hp: 3,
      points: 300,
      shootInterval: 2000, // ms
      spawnWeight: 25, // 25% 生成概率
    },
    large: {
      width: 60,
      height: 50,
      speedMin: 1,
      speedMax: 1.5,
      hp: 8,
      points: 500,
      shootInterval: 1500, // ms
      spawnWeight: 10, // 10% 生成概率
    },
    boss: {
      width: 80,
      height: 70,
      speedMin: 0.5,
      speedMax: 1,
      hp: 30,
      points: 2000,
      shootInterval: 800, // ms
      spawnWeight: 5, // 5% 生成概率（受分数门槛限制）
    },
  },
};

// 玩家飞机尺寸
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 48;

// 道具尺寸
export const POWERUP_WIDTH = 24;
export const POWERUP_HEIGHT = 24;

// 爆炸动画配置
export const EXPLOSION_MAX_FRAMES = 12;
export const EXPLOSION_BASE_RADIUS = 20;

// 背景星星配置
export const STAR_COUNT = 50;
export const STAR_SPEED_MIN = 0.5;
export const STAR_SPEED_MAX = 2;

// 按键映射
export const KEY_MAP = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  SHOOT: [' ', 'j', 'J'],
};

// 子弹伤害配置
export const BULLET_DAMAGE = {
  normal: 1,
  spread: 1,
  laser: 2,
  enemy: 1,
};

// 道具效果配置
export const POWERUP_EFFECTS = {
  life: { lives: 1 },
  fireRate: { fireRateMultiplier: 0.85 }, // 射速提升15%
  spread: { bulletType: 'spread' as const },
  bomb: { clearScreen: true },
};
