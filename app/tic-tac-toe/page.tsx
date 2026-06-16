'use client';

/**
 * 井字棋游戏主页面
 *
 * @module tic-tac-toe/page
 */

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { GameMode, Difficulty } from './types/game';
import { useTicTacToe } from './hooks/useTicTacToe';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';

interface GameAreaProps {
    mode: GameMode;
    difficulty: Difficulty;
    onModeChange: (mode: GameMode) => void;
    onDifficultyChange: (difficulty: Difficulty) => void;
}

function GameArea({ mode, difficulty, onModeChange, onDifficultyChange }: GameAreaProps) {
    const game = useTicTacToe(mode, difficulty);

    useKeyboard(
        { r: 'reset', R: 'reset' },
        { onKeyDown: (action) => { if (action === 'reset') game.reset(); } },
    );

    const showOverlay = game.status !== 'playing';

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Board
                    board={game.board}
                    winningLine={game.winningLine}
                    disabled={game.status !== 'playing' || (game.isAI && game.currentPlayer !== game.humanMark)}
                    onCellClick={game.makeMove}
                />

                {showOverlay && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-xl gap-2 z-10">
                        {game.status === 'won' && game.winner && (
                            <>
                                <div className={`text-6xl font-black drop-shadow-lg ${
                                    game.winner === 'X' ? 'text-orange-400' : 'text-violet-400'
                                }`}>
                                    {game.winner}
                                </div>
                                <div className="text-xl font-bold text-indigo-300">
                                    {game.isAI
                                        ? game.winner === game.humanMark ? '🎉 你赢了！' : '😅 AI 获胜'
                                        : `${game.winner} 获胜！`}
                                </div>
                            </>
                        )}
                        {game.status === 'over' && (
                            <div className="text-xl font-bold text-slate-300">🤝 平局</div>
                        )}
                    </div>
                )}
            </div>

            <GameControls
                wins={game.wins}
                currentPlayer={game.currentPlayer}
                isAI={game.isAI}
                mode={mode}
                difficulty={difficulty}
                onModeChange={onModeChange}
                onDifficultyChange={onDifficultyChange}
                onReset={game.reset}
            />
        </div>
    );
}

export default function TicTacToePage() {
    const [mode, setMode] = useState<GameMode>('pve');
    const [difficulty, setDifficulty] = useState<Difficulty>('hard');
    const [gameKey, setGameKey] = useState(0);

    const handleModeChange = (newMode: GameMode): void => {
        setMode(newMode);
        setGameKey((k) => k + 1);
    };

    const handleDifficultyChange = (newDifficulty: Difficulty): void => {
        setDifficulty(newDifficulty);
        setGameKey((k) => k + 1);
    };

    return (
        <GameLayout
            title="井字棋"
            className="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="井字棋"
                icon="⭕"
                colorClass="text-indigo-400"
                subtitle="在 3×3 棋盘上连成一线即可获胜"
            />

            <GameArea
                key={gameKey}
                mode={mode}
                difficulty={difficulty}
                onModeChange={handleModeChange}
                onDifficultyChange={handleDifficultyChange}
            />

            <ControlHints
                hints={['X 先手', '率先连成横/竖/斜一线者获胜', '按 R 重新开始']}
                className="text-slate-500 text-xs"
            />
        </GameLayout>
    );
}
