/**
 * 猜数字游戏类型定义
 *
 * @module guess-number/types/game
 */

import { GameStatus } from '@/lib/types/game';

/** 游戏使用的状态子集 */
export type GuessNumberStatus = Extract<GameStatus, 'idle' | 'playing' | 'won' | 'lost'>;

/** 难度等级 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 单次猜测的反馈结果 */
export interface GuessResult {
    /** 玩家猜测的数字串 */
    guess: string;
    /** A - 数字和位置都正确的个数 */
    bulls: number;
    /** B - 数字正确但位置不对的个数 */
    cows: number;
}

/** 难度配置 */
export interface DifficultyConfig {
    /** 密码长度 */
    codeLength: number;
    /** 最大猜测次数 */
    maxAttempts: number;
    /** 可选数字范围 (0~digitRange-1) */
    digitRange: number;
}
