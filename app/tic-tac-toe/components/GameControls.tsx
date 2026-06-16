'use client';

/**
 * 井字棋控制面板
 *
 * @module tic-tac-toe/components/GameControls
 */

import { Player, GameMode, Difficulty } from '../types/game';

interface GameControlsProps {
    wins: { X: number; O: number; draw: number };
    currentPlayer: Player;
    isAI: boolean;
    mode: GameMode;
    difficulty: Difficulty;
    onModeChange: (mode: GameMode) => void;
    onDifficultyChange: (difficulty: Difficulty) => void;
    onReset: () => void;
}

export function GameControls({
    wins,
    currentPlayer,
    isAI,
    mode,
    difficulty,
    onModeChange,
    onDifficultyChange,
    onReset,
}: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            {/* 计分板 */}
            <div className="flex gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">
                        {isAI ? '你 (O)' : 'O'}
                    </span>
                    <span className="text-lg font-bold text-violet-400 tabular-nums">{wins.O}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">平局</span>
                    <span className="text-lg font-bold text-slate-400 tabular-nums">{wins.draw}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">
                        {isAI ? 'AI (X)' : 'X'}
                    </span>
                    <span className="text-lg font-bold text-orange-400 tabular-nums">{wins.X}</span>
                </div>
            </div>

            {/* 当前回合 */}
            <div className="text-sm text-slate-400">
                {isAI && currentPlayer === 'X' ? (
                    <span className="text-indigo-400">AI 思考中...</span>
                ) : (
                    <>
                        轮到:{' '}
                        <span className={currentPlayer === 'X' ? 'text-orange-400 font-bold' : 'text-violet-400 font-bold'}>
                            {currentPlayer}
                        </span>
                    </>
                )}
            </div>

            {/* 模式选择 */}
            <div className="flex gap-2">
                <button
                    onClick={() => onModeChange('pve')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        mode === 'pve'
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    人机对战
                </button>
                <button
                    onClick={() => onModeChange('pvp')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        mode === 'pvp'
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    双人对战
                </button>
            </div>

            {/* 难度选择（仅 PvE 模式） */}
            {isAI && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onDifficultyChange('easy')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            difficulty === 'easy'
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                    >
                        简单
                    </button>
                    <button
                        onClick={() => onDifficultyChange('hard')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            difficulty === 'hard'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                    >
                        困难
                    </button>
                </div>
            )}

            {/* 重置按钮 */}
            <button
                onClick={onReset}
                className="px-4 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-all active:scale-95"
            >
                重新开始 (R)
            </button>
        </div>
    );
}
