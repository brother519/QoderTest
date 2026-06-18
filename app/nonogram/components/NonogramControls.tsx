'use client';

import { formatTime } from '@/lib/utils';
import type { Difficulty, NonogramStatus } from '../types/game';
import { DIFFICULTY_CONFIG } from '../constants/config';

interface NonogramControlsProps {
    status: NonogramStatus;
    difficulty: Difficulty;
    timer: number;
    errors: number;
    highScore: number;
    puzzleName: string;
    onStart: () => void;
    onRestart: () => void;
    onNextPuzzle: () => void;
    onChangeDifficulty: (d: Difficulty) => void;
}

export function NonogramControls({
    status,
    difficulty,
    timer,
    errors,
    highScore,
    puzzleName,
    onStart,
    onRestart,
    onNextPuzzle,
    onChangeDifficulty,
}: NonogramControlsProps): React.JSX.Element {
    return (
        <div className="flex flex-col gap-3 items-center w-full max-w-lg">
            {/* Difficulty selector */}
            <div className="flex gap-2">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
                    <button
                        key={d}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            difficulty === d
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => onChangeDifficulty(d)}
                        disabled={status === 'playing'}
                    >
                        {DIFFICULTY_CONFIG[d].label}
                    </button>
                ))}
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>⏱ {formatTime(timer)}</span>
                <span>❌ 错误: {errors}</span>
                {highScore > 0 && <span>🏆 最佳: {formatTime(highScore)}</span>}
                {puzzleName && <span className="font-medium text-indigo-600 dark:text-indigo-400">{puzzleName}</span>}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                {status === 'idle' && (
                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                        onClick={onStart}
                    >
                        开始游戏
                    </button>
                )}
                {status === 'playing' && (
                    <>
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            onClick={onRestart}
                        >
                            重置
                        </button>
                        <button
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                            onClick={onNextPuzzle}
                        >
                            换一题
                        </button>
                    </>
                )}
                {status === 'won' && (
                    <button
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                        onClick={onNextPuzzle}
                    >
                        下一题
                    </button>
                )}
            </div>
        </div>
    );
}
