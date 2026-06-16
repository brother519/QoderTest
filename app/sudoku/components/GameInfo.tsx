/**
 * 游戏信息面板组件
 *
 * 显示计时器、错误次数和难度信息。
 *
 * @module sudoku/components/GameInfo
 */

import { SudokuDifficulty } from '../types/game';
import { MAX_MISTAKES, DIFFICULTY_LABELS } from '../constants/config';

interface GameInfoProps {
    timer: number;
    mistakes: number;
    difficulty: SudokuDifficulty;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameInfo({ timer, mistakes, difficulty }: GameInfoProps) {
    return (
        <div className="flex gap-6 text-sm">
            <div className="text-center">
                <div className="text-slate-400 text-xs">难度</div>
                <div className="text-indigo-300 font-medium">{DIFFICULTY_LABELS[difficulty]}</div>
            </div>
            <div className="text-center">
                <div className="text-slate-400 text-xs">时间</div>
                <div className="text-white font-mono">{formatTime(timer)}</div>
            </div>
            <div className="text-center">
                <div className="text-slate-400 text-xs">错误</div>
                <div className={`font-medium ${mistakes > 0 ? 'text-red-400' : 'text-white'}`}>
                    {mistakes}/{MAX_MISTAKES}
                </div>
            </div>
        </div>
    );
}
