'use client';

import { useCallback } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { formatTime } from '@/lib/utils/format';
import { useTangramGame } from './hooks/useTangramGame';
import { PUZZLES } from './constants/puzzles';
import { TangramBoard } from './components/TangramBoard';
import { PuzzleSelector } from './components/PuzzleSelector';
import { GameControls } from './components/GameControls';

const KEY_MAP: Record<string, string> = {
    r: 'rotate',
    R: 'rotate',
    f: 'flip',
    F: 'flip',
    z: 'undo',
    y: 'redo',
};

export default function TangramPage() {
    const game = useTangramGame(PUZZLES[0]);

    const handleRotate = useCallback(() => {
        if (game.selectedPieceId) game.rotatePiece(game.selectedPieceId);
    }, [game]);

    const handleFlip = useCallback(() => {
        if (game.selectedPieceId) game.flipPiece(game.selectedPieceId);
    }, [game]);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            switch (action) {
                case 'rotate':
                    handleRotate();
                    break;
                case 'flip':
                    handleFlip();
                    break;
                case 'undo':
                    game.undo();
                    break;
                case 'redo':
                    game.redo();
                    break;
            }
        },
    });

    return (
        <GameLayout
            title="七巧板"
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center py-6 px-4 gap-4"
        >
            <GamePageHeader
                title="七巧板"
                icon="🔷"
                subtitle={`关卡：${game.currentPuzzle.name} (${game.currentPuzzle.difficulty})`}
                colorClass="text-cyan-400"
            />

            <div className="flex items-center gap-6 text-slate-300 text-sm">
                <span className="flex items-center gap-1.5">
                    <span className="text-cyan-400">⏱</span>
                    {formatTime(game.elapsedTime)}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="text-cyan-400">🧩</span>
                    {game.pieces.length} 块
                </span>
            </div>

            <div className="relative">
                <TangramBoard
                    pieces={game.pieces}
                    puzzle={game.currentPuzzle}
                    selectedPieceId={game.selectedPieceId}
                    onSelectPiece={game.selectPiece}
                    onDragMove={game.movePieceBy}
                    onDragEnd={() => {}}
                    onDeselectAll={game.deselectAll}
                />

                <GameOverlay visible={game.status === 'idle'} bgClass="bg-black/40">
                    <div className="text-center">
                        <p className="text-white text-xl font-bold mb-2">
                            {game.currentPuzzle.icon} {game.currentPuzzle.name}
                        </p>
                        <p className="text-white/60 text-sm mb-4">
                            拖拽七巧板拼出目标图形
                        </p>
                        <button
                            onClick={game.start}
                            className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
                        >
                            开始挑战
                        </button>
                    </div>
                </GameOverlay>

                <GameOverlay visible={game.status === 'won'} bgClass="bg-black/50">
                    <div className="text-center">
                        <p className="text-4xl mb-2">🎉</p>
                        <p className="text-white text-2xl font-bold mb-1">恭喜过关！</p>
                        <p className="text-cyan-300 text-lg mb-4">
                            用时 {formatTime(game.elapsedTime)}
                        </p>
                        <button
                            onClick={game.restart}
                            className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
                        >
                            再来一次
                        </button>
                    </div>
                </GameOverlay>
            </div>

            <GameControls
                selectedPieceId={game.selectedPieceId}
                onRotate={handleRotate}
                onFlip={handleFlip}
                onUndo={game.undo}
                onRedo={game.redo}
                onRestart={game.restart}
            />

            <PuzzleSelector currentPuzzle={game.currentPuzzle} onSelect={game.setPuzzle} />

            <ControlHints
                hints={[
                    '拖拽移动拼图块',
                    'R 旋转',
                    'F 翻转',
                    'Ctrl+Z 撤销',
                    'Ctrl+Y 重做',
                ]}
                className="text-slate-500 text-xs"
            />
        </GameLayout>
    );
}
