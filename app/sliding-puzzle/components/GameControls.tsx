/**
 * 滑动拼图控制面板组件
 *
 * @module sliding-puzzle/components/GameControls
 */

'use client';

import { GameStatus, BestRecord } from '../types/game';

interface GameControlsProps {
    moves: number;
    time: number;
    status: GameStatus;
    bestRecord: BestRecord;
    onRestart: () => void;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameControls({ moves, time, status, bestRecord, onRestart }: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex gap-6 text-emerald-100">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500/70 text-sm">步数</span>
                    <span className="text-lg font-bold text-emerald-400 tabular-nums">{moves}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500/70 text-sm">时间</span>
                    <span className="text-lg font-bold text-white font-mono tabular-nums">{formatTime(time)}</span>
                </div>
                {bestRecord.moves !== null && (
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-500/70 text-sm">最佳</span>
                        <span className="text-lg font-bold text-yellow-400 tabular-nums">{bestRecord.moves} 步</span>
                    </div>
                )}
            </div>

            <button
                onClick={onRestart}
                className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-all active:scale-95 shadow-md shadow-emerald-700/30"
            >
                ↻ 重新开始 (R)
            </button>

            {status === 'idle' && (
                <div className="text-emerald-500/60 text-xs text-center">
                    点击与空白相邻的方块开始移动
                </div>
            )}
        </div>
    );
}
