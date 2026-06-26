/**
 * 魔方控制面板组件
 *
 * @module rubiks-cube/components/GameControls
 */

'use client';

import { Move } from '../types/game';
import { MOVES } from '../constants/config';
import { GameStatus } from '@/lib/types/game';

interface GameControlsProps {
    /** 当前步数 */
    moves: number;
    /** 已用时间（秒） */
    time: number;
    /** 最高分 */
    highScore: number;
    /** 游戏状态 */
    status: GameStatus;
    /** 是否正在动画 */
    isAnimating: boolean;
    /** 打乱回调 */
    onScramble: () => void;
    /** 重置回调 */
    onReset: () => void;
    /** 操作回调 */
    onMove: (move: Move) => void;
}

export function GameControls({
    status,
    isAnimating,
    onScramble,
    onReset,
    onMove,
}: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
            {/* 主控制按钮 */}
            <div className="flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={onScramble}
                    disabled={isAnimating}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800/50
                               text-white rounded-lg font-medium transition-colors"
                >
                    打乱
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    disabled={isAnimating}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800/50
                               text-white rounded-lg font-medium transition-colors"
                >
                    重置
                </button>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-6 gap-2">
                {MOVES.map(({ move, label }) => (
                    <button
                        key={move}
                        type="button"
                        onClick={() => onMove(move as Move)}
                        disabled={isAnimating || status === 'won'}
                        className="px-3 py-2 bg-indigo-600/80 hover:bg-indigo-500
                                   disabled:bg-indigo-900/40 disabled:text-white/40
                                   text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
