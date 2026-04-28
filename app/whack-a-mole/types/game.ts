/**
 * 打地鼠游戏类型定义
 *
 * 定义地鼠类型、洞状态、游戏配置和统计数据等核心类型。
 *
 * @module whack-a-mole/types/game
 */

/** 地鼠类型 */
export type MoleType = 'normal' | 'golden' | 'bomb';

/** 洞状态 */
export type HoleState = 'empty' | 'rising' | 'up' | 'falling' | 'hit';

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 地鼠洞数据 */
export interface HoleData {
  /** 洞状态 */
  state: HoleState;
  /** 地鼠类型（仅在 state 不为 empty 时有意义） */
  moleType: MoleType;
  /** 唯一标识，用于触发动画重置 */
  key: number;
}

/** 地鼠洞位置 */
export interface HolePosition {
  row: number;
  col: number;
}

/** 游戏配置 */
export interface GameConfig {
  /** 地鼠洞行数 */
  rows: number;
  /** 地鼠洞列数 */
  cols: number;
  /** 游戏时长（秒） */
  gameDuration: number;
  /** 初始地鼠出现间隔（毫秒） */
  baseMoleInterval: number;
  /** 最小地鼠出现间隔（毫秒） */
  minMoleInterval: number;
  /** 地鼠停留时间（毫秒） */
  moleStayDuration: number;
  /** 最小地鼠停留时间（毫秒） */
  minMoleStayDuration: number;
  /** 每次加速减少的间隔（毫秒） */
  speedStep: number;
  /** 每隔多少秒加速一次 */
  speedThreshold: number;
  /** 金色地鼠出现概率 (0-1) */
  goldenMoleChance: number;
  /** 炸弹地鼠出现概率 (0-1) */
  bombMoleChance: number;
  /** 地鼠升起动画时长（毫秒） */
  riseDuration: number;
  /** 地鼠落下动画时长（毫秒） */
  fallDuration: number;
  /** 击中效果显示时长（毫秒） */
  hitEffectDuration: number;
}

/** 游戏统计 */
export interface GameStats {
  /** 击中次数 */
  hits: number;
  /** 未击中次数（点击空洞） */
  misses: number;
  /** 地鼠逃跑次数（未点击就消失） */
  escapes: number;
  /** 最高连击 */
  maxCombo: number;
}

/** 分数弹出数据 */
export interface ScorePopup {
  /** 唯一ID */
  id: number;
  /** 洞的行 */
  row: number;
  /** 洞的列 */
  col: number;
  /** 分数值（正数加分，负数扣分） */
  score: number;
  /** 是否为金色地鼠 */
  isGolden: boolean;
}
