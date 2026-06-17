'use client';

import { Difficulty, BestRecord } from '../types/game';
import { DIFFICULTY_LABELS } from '../constants/config';
import { formatTime } from '@/lib/utils/format';

interface GameControlsProps {
    moves: number;
    time: number;
    combo: number;
    maxCombo: number;
    difficulty: Difficulty;
    bestRecord: BestRecord;
    onRestart: () => void;
    onSetDifficulty: (d: Difficulty) => void;
}

export function GameControls({
    moves,
    time,
    combo,
    maxCombo,
    difficulty,
    bestRecord,
    onRestart,
    onSetDifficulty,
}: GameControlsProps) {
    const difficulties = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            {/* 统计面板 */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">步数</span>
                    <span className="text-sky-400 font-bold text-base">{moves}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">时间</span>
                    <span className="text-white font-bold text-base">{formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">连击</span>
                    <span className={`font-bold text-base ${combo >= 3 ? 'text-yellow-400' : combo >= 2 ? 'text-orange-400' : 'text-white'}`}>
                        {combo}
                        {combo >= 3 && ' 🔥'}
                    </span>
                </div>
                {maxCombo > 1 && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-white/50">最高连击</span>
                        <span className="text-amber-400 font-bold text-base">{maxCombo}</span>
                    </div>
                )}
            </div>

            {/* 最佳记录 */}
            {(bestRecord.moves !== null || bestRecord.time !== null) && (
                <div className="text-xs text-white/40">
                    最佳记录：
                    {bestRecord.moves !== null && `${bestRecord.moves} 步`}
                    {bestRecord.moves !== null && bestRecord.time !== null && ' / '}
                    {bestRecord.time !== null && formatTime(bestRecord.time)}
                </div>
            )}

            {/* 难度选择 + 重开 */}
            <div className="flex items-center gap-2">
                {difficulties.map((d) => (
                    <button
                        key={d}
                        onClick={() => onSetDifficulty(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${d === difficulty
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30'
                                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                            }`}
                    >
                        {DIFFICULTY_LABELS[d]}
                    </button>
                ))}

                <button
                    onClick={onRestart}
                    className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium
                        bg-white/10 text-white/60 hover:bg-white/20 hover:text-white
                        transition-all active:scale-95"
                >
                    重新开始
                </button>
            </div>
        </div>
    );
}
