/**
 * 井字棋游戏类型定义
 *
 * @module tic-tac-toe/types/game
 */

/** 格子内容 */
export type Cell = 'X' | 'O' | null;

/** 玩家标识 */
export type Player = 'X' | 'O';

/** 游戏状态 */
export type TicTacToeStatus = Extract<
    import('@/lib/types/game').GameStatus,
    'playing' | 'won' | 'over'
>;

/** 游戏模式 */
export type GameMode = 'pvp' | 'pve';

/** AI 难度 */
export type Difficulty = 'easy' | 'hard';
