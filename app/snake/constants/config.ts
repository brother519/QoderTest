/**
 * 贪吃蛇游戏配置常量
 *
 * @module snake/constants/config
 */

import { GameConfig } from '../types/game';

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  cols: 20,
  rows: 20,
  gridSize: 20,
  baseInterval: 150,
  minInterval: 50,
  speedStep: 10,
  speedThreshold: 50,
};

/** 每次吃到食物获得的分数 */
export const SCORE_PER_FOOD = 10;
