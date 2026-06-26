/**
 * Maze game controls component
 *
 * Displays difficulty selector, timer, best time, move count,
 * and action buttons.
 *
 * @module maze/components/GameControls
 */

'use client';

import { Difficulty, BestTimes, MazeGameStatus } from '../types/game';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../constants/config';

/** Format seconds to mm:ss display string */
function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface GameControlsProps {
    /** Current difficulty */
    difficulty: Difficulty;
    /** Current elapsed time in seconds */
    elapsedTime: number;
    /** Best times per difficulty */
    bestTimes: BestTimes;
    /** Total move count */
    moveCount: number;
    /** Current game status */
    status: MazeGameStatus;
    /** Callback to change difficulty and generate new maze */
    onDifficultyChange: (difficulty: Difficulty) => void;
    /** Callback to generate a new maze at current difficulty */
    onNewMaze: () => void;
}

export function GameControls({
    difficulty,
    elapsedTime,
    bestTimes,
    moveCount,
    status,
    onDifficultyChange,
    onNewMaze,
}: GameControlsProps) {
    const bestTime = bestTimes[difficulty];

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
            {/* Difficulty selector */}
            <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                    <button
                        key={d}
                        onClick={() => onDifficultyChange(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            difficulty === d
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                    >
                        {DIFFICULTY_LABELS[d]}
                    </button>
                ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm">
                {/* Timer */}
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">⏱️</span>
                    <span className="text-white font-mono font-medium">
                        {formatTime(elapsedTime)}
                    </span>
                </div>

                {/* Best time */}
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">🏆</span>
                    <span className="text-amber-400 font-mono font-medium">
                        {bestTime !== null ? formatTime(bestTime) : '--:--'}
                    </span>
                </div>

                {/* Move count */}
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50">👣</span>
                    <span className="text-white font-mono font-medium">{moveCount}</span>
                </div>
            </div>

            {/* New maze button */}
            <button
                onClick={onNewMaze}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium
                           transition-all duration-200 shadow-md shadow-teal-800/30 hover:shadow-teal-600/30"
            >
                {status === 'won' ? '🎮 再来一局' : '🔄 新迷宫'}
            </button>
        </div>
    );
}
