/**
 * GameStatus component — displays game progress and end-state messages
 *
 * @module hanzi-wordle/components/GameStatus
 */

import { GameStatus } from '../types/game';
import { MAX_GUESSES } from '../constants/config';

interface GameStatusProps {
    gameStatus: GameStatus;
    guessCount: number;
    answer: string;
    onReset: () => void;
}

export function GameStatusBar({ gameStatus, guessCount, answer, onReset }: GameStatusProps) {
    if (gameStatus === 'won') {
        return (
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="text-3xl">🎉</div>
                <p className="text-emerald-400 font-bold text-lg">
                    恭喜！用了 {guessCount} 次猜中了「{answer}」
                </p>
                <button
                    onClick={onReset}
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                               text-white font-medium transition-all duration-200"
                >
                    再来一局
                </button>
            </div>
        );
    }

    if (gameStatus === 'lost') {
        return (
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="text-3xl">😔</div>
                <p className="text-red-400 font-bold text-lg">
                    很遗憾，正确答案是「<span className="text-white">{answer}</span>」
                </p>
                <button
                    onClick={onReset}
                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                               text-white font-medium transition-all duration-200"
                >
                    再试一次
                </button>
            </div>
        );
    }

    // Playing state — show progress hint
    return (
        <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-slate-400 text-sm">
                第 {guessCount + 1} / {MAX_GUESSES} 次猜测
            </span>
        </div>
    );
}
