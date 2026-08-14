/**
 * 数独游戏主页面
 *
 * @module sudoku/page
 */

'use client';

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useSudokuGame } from './hooks/useSudokuGame';
import { Board } from './components/Board';
import { NumberPad } from './components/NumberPad';
import { GameInfo } from './components/GameInfo';
import { SudokuDifficulty } from './types/game';
import { DIFFICULTY_LABELS } from './constants/config';

function DifficultySelector({
    current,
    onSelect,
}: {
    current: SudokuDifficulty;
    onSelect: (d: SudokuDifficulty) => void;
}) {
    const difficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard'];

    return (
        <div className="flex gap-2">
            {difficulties.map((d) => (
                <button
                    key={d}
                    onClick={() => onSelect(d)}
                    className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${
                            current === d
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }
                    `}
                >
                    {DIFFICULTY_LABELS[d]}
                </button>
            ))}
        </div>
    );
}

function GameArea({ difficulty }: { difficulty: SudokuDifficulty }) {
    const game = useSudokuGame(difficulty);

    return (
        <div className="flex flex-col items-center gap-4">
            <GameInfo timer={game.timer} mistakes={game.mistakes} difficulty={difficulty} />

            <div className="relative">
                <Board board={game.board} selectedCell={game.selectedCell} onSelectCell={game.selectCell} />

                <GameOverlay visible={game.status === 'won'} bgClass="bg-slate-900/90">
                    <div className="text-indigo-300 text-3xl font-bold drop-shadow-lg">🎉 恭喜完成！</div>
                    <div className="text-white/80 text-sm">
                        用时 {Math.floor(game.timer / 60)} 分 {game.timer % 60} 秒
                    </div>
                    <button
                        onClick={game.reset}
                        className="mt-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium transition-all"
                    >
                        再来一局
                    </button>
                </GameOverlay>

                <GameOverlay visible={game.status === 'lost'} bgClass="bg-slate-900/90">
                    <div className="text-red-400 text-3xl font-bold drop-shadow-lg">游戏结束</div>
                    <div className="text-white/80 text-sm">错误次数已达上限</div>
                    <button
                        onClick={game.reset}
                        className="mt-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium transition-all"
                    >
                        重新开始
                    </button>
                </GameOverlay>
            </div>

            <NumberPad
                board={game.board}
                notesMode={game.notesMode}
                onInputNumber={game.inputNumber}
                onToggleNotes={game.toggleNotes}
                onErase={game.eraseCell}
                onUndo={game.undo}
                canUndo={game.canUndo}
            />

            <button
                onClick={game.reset}
                className="px-4 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
                重新开始
            </button>
        </div>
    );
}

export default function SudokuPage() {
    const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');

    return (
        <GameLayout
            title="数独"
            className="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader title="数独" icon="🔢" colorClass="text-indigo-400" subtitle="填入 1-9，使每行、每列、每个 3x3 宫格都包含全部数字" />

            <DifficultySelector current={difficulty} onSelect={setDifficulty} />

            <div className="mt-4">
                <GameArea key={difficulty} difficulty={difficulty} />
            </div>

            <ControlHints hints={['1-9 填数', 'Backspace 擦除', 'N 切换笔记', 'Ctrl+Z 撤销']} className="text-slate-500 text-xs" />
        </GameLayout>
    );
}
