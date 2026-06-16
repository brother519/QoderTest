/**
 * 滑动拼图游戏类型定义
 *
 * @module sliding-puzzle/types/game
 */

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'won';

/** 单个拼图块 */
export interface Tile {
    /** 方块显示数字（0 表示空白格） */
    value: number;
}

/** 游戏配置 */
export interface GameConfig {
    /** 棋盘尺寸（行数 = 列数） */
    size: number;
    /** 动画持续时间（毫秒） */
    moveDuration: number;
}

/** 本地存储的最佳记录 */
export interface BestRecord {
    /** 最佳步数 */
    moves: number | null;
    /** 最佳用时（秒） */
    time: number | null;
}
