/**
 * 2048 游戏类型定义
 *
 * 定义方块、棋盘、游戏状态、移动方向等核心类型。
 *
 * @module puzzle-2048/types/game
 */

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'won' | 'over';

/** 滑动方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * 单个数字方块
 *
 * 通过稳定的 id 实现跨帧追踪，从而对位置变化做 CSS 过渡动画；
 * isNew/isMerged 是仅用于动画的瞬时标记（动画播放完即由组件忽略）。
 */
export interface Tile {
  /** 稳定唯一 id（自增） */
  id: number;
  /** 当前数值（2、4、8、…） */
  value: number;
  /** 当前所在行（0 起） */
  row: number;
  /** 当前所在列（0 起） */
  col: number;
  /** 是否本回合刚生成（用于出现动画） */
  isNew?: boolean;
  /** 是否本回合是合并产物（用于弹出动画） */
  isMerged?: boolean;
}

/** 一次移动的结果 */
export interface MoveResult {
  /** 移动后的方块列表 */
  tiles: Tile[];
  /** 本次移动获得的分数（合并产物之和） */
  gained: number;
  /** 棋盘是否发生了变化（决定是否生成新方块） */
  moved: boolean;
  /** 本次移动后是否首次合成 2048（用于触发胜利状态） */
  reached2048: boolean;
}

/** 游戏配置 */
export interface GameConfig {
  /** 棋盘尺寸（行数 = 列数） */
  size: number;
  /** 胜利目标值 */
  winValue: number;
  /** 每次新方块为 4 的概率（其余为 2） */
  fourChance: number;
  /** 滑动动画时长（毫秒），用于节流连续输入 */
  moveDuration: number;
}
