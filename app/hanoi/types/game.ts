/**
 * Hanoi Tower Game Types
 *
 * @module hanoi/types/game
 */

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed';

/** 柱子索引 (0, 1, 2) */
export type PegIndex = 0 | 1 | 2;

/** 圆盘数据 */
export interface Disk {
    /** 圆盘大小 (1 最小) */
    size: number;
    /** 圆盘颜色 */
    color: string;
}

/** 游戏状态 */
export interface HanoiState {
    /** 三根柱子的圆盘分布 */
    pegs: number[][];
    /** 当前步数 */
    moveCount: number;
    /** 游戏开始时间戳 */
    startTime: number;
    /** 游戏状态 */
    status: GameStatus;
    /** 当前选中的柱子 (点击模式) */
    selectedPeg: PegIndex | null;
    /** 当前层数 (3-8) */
    level: number;
}

/** 游戏统计 */
export interface HanoiStats {
    /** 最高解锁层数 */
    unlockedLevels: number;
    /** 每层最佳步数 */
    bestMoves: Record<number, number>;
    /** 总游戏次数 */
    totalGames: number;
    /** 总游戏时长 (秒) */
    totalTime: number;
}

/** 游戏配置 */
export interface HanoiConfig {
    /** 最小层数 */
    minLevel: number;
    /** 最大层数 */
    maxLevel: number;
    /** 圆盘颜色列表 */
    diskColors: string[];
    /** 动画持续时间 (ms) */
    animationDuration: number;
}
