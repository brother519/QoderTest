'use client';

import { Difficulty, BestRecord, GameStatus } from '../types/game';
import { DIFFICULTY_LABELS } from '../constants/config';
import { formatTime } from '@/lib/utils/format';

interface GameControlsProps {
    moves: number;
    time: number;
    difficulty: Difficulty;
    bestRecord: BestRecord;
    canUndo: boolean;
    status: GameStatus;
    onUndo: () => void;
    onRestart: () => void;
    onSetDifficulty: (d: Difficulty) => void;
}

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

export function GameControls({
    moves,
    time,
    difficulty,
    bestRecord,
    canUndo,
    status,
    onUndo,
    onRestart,
    onSetDifficulty,
}: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-lg">
            <div className="flex gap-2">
                {difficulties.map((d) => (
                    <button
                        key={d}
                        onClick={() => onSetDifficulty(d)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            d === difficulty
                                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30'
                                : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600'
                        }`}
                    >
                        {DIFFICULTY_LABELS[d]}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 text-sm tabular-nums">
                <span className="text-white/70">
                    步数: <span className="text-fuchsia-400 font-bold">{moves}</span>
                </span>
                <span className="text-white/30">|</span>
                <span className="text-white/70">
                    时间: <span className="text-white font-bold">{formatTime(time)}</span>
                </span>
                <span className="text-white/30">|</span>
                <span className="text-white/70">
                    最佳:{' '}
                    <span className="text-yellow-400 font-bold">
                        {bestRecord.moves !== null ? `${bestRecord.moves}步` : '--'}
                    </span>
                </span>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="px-4 py-1.5 rounded-lg text-sm bg-slate-700/60 text-slate-300 hover:bg-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ↩ 撤销 (Z)
                </button>
                <button
                    onClick={onRestart}
                    className="px-4 py-1.5 rounded-lg text-sm bg-slate-700/60 text-slate-300 hover:bg-slate-600 transition-all"
                >
                    ↻ 重新开始 (R)
                </button>
            </div>

            {status === 'idle' && (
                <p className="text-white/30 text-xs">点击试管选取顶部的彩球开始排序</p>
            )}
        </div>
    );
}
