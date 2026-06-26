'use client';

import { useEffect, useCallback } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { useKlotskiGame } from './hooks/useKlotskiGame';
import { Board } from './components/Board';
import { LevelSelect } from './components/LevelSelect';
import { ControlPanel } from './components/ControlPanel';
import { CELL_SIZE, GAP } from './constants/config';
import { LEVELS } from './constants/levels';

// Keyboard key-to-action mapping for directional movement
const KEY_MAP: Record<string, string> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    W: 'up',
    s: 'down',
    S: 'down',
    a: 'left',
    A: 'left',
    d: 'right',
    D: 'right',
};

/**
 * Compute star rating based on player steps vs par steps.
 * 3 stars: steps <= parSteps
 * 2 stars: steps <= parSteps * 1.5
 * 1 star: otherwise
 */
function getStarRating(steps: number, parSteps: number): number {
    if (steps <= parSteps) return 3;
    if (steps <= parSteps * 1.5) return 2;
    return 1;
}

export default function KlotskiPage() {
    const game = useKlotskiGame();

    // Directional keyboard controls via shared hook
    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (game.status !== 'playing') return;
            const dirMap: Record<string, [number, number]> = {
                up: [-1, 0],
                down: [1, 0],
                left: [0, -1],
                right: [0, 1],
            };
            const dir = dirMap[action];
            if (dir) game.moveSelected(dir[0], dir[1]);
        },
    });

    // Special key handling: Tab to cycle blocks, Ctrl/Cmd+Z for undo
    const handleSpecialKeys = useCallback(
        (e: KeyboardEvent) => {
            if (game.status !== 'playing') return;

            if (e.key === 'Tab') {
                e.preventDefault();
                const ids = game.blocks.map((b) => b.id);
                const idx = game.selectedBlockId
                    ? ids.indexOf(game.selectedBlockId)
                    : -1;
                const next = (idx + 1) % ids.length;
                game.selectBlock(ids[next]);
            }

            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                game.undo();
            }
        },
        [game]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleSpecialKeys);
        return () => window.removeEventListener('keydown', handleSpecialKeys);
    }, [handleSpecialKeys]);

    // Derive current and next level info
    const currentLevel = LEVELS.find((l) => l.id === game.currentLevelId);
    const currentLevelIndex = currentLevel ? LEVELS.indexOf(currentLevel) : -1;
    const nextLevel =
        currentLevel && game.status === 'won' && currentLevelIndex < LEVELS.length - 1
            ? LEVELS[currentLevelIndex + 1]
            : null;

    // Best steps and par steps for the current level
    const bestSteps = game.currentLevelId
        ? game.bestStepsMap[game.currentLevelId] ?? null
        : null;
    const parSteps = currentLevel?.parSteps ?? 0;

    // Star rating for victory overlay
    const starCount =
        game.status === 'won' && parSteps > 0
            ? getStarRating(game.steps, parSteps)
            : 0;

    return (
        <GameLayout
            title="华容道"
            className="bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center py-6 px-4"
        >
            {game.status === 'selecting' ? (
                <LevelSelect
                    levels={LEVELS}
                    bestStepsMap={game.bestStepsMap}
                    onSelectLevel={game.startLevel}
                />
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <GamePageHeader
                        title="华容道"
                        icon="🏯"
                        colorClass="text-red-400"
                    />

                    <ControlPanel
                        steps={game.steps}
                        bestSteps={bestSteps}
                        parSteps={parSteps}
                        canUndo={game.canUndo}
                        onUndo={game.undo}
                        onReset={game.reset}
                        onBack={game.goBackToSelect}
                    />

                    <div className="relative mx-auto" style={{ width: 'fit-content' }}>
                        <Board
                            blocks={game.blocks}
                            selectedBlockId={game.selectedBlockId}
                            cellSize={CELL_SIZE}
                            gap={GAP}
                            onSelectBlock={game.selectBlock}
                            onDragMove={game.dragMove}
                        />

                        <GameOverlay visible={game.status === 'won'} bgClass="bg-black/70">
                            <div className="text-yellow-300 text-4xl font-bold drop-shadow-lg">
                                突围成功！
                            </div>
                            <div className="text-white text-lg mt-1">
                                用了{' '}
                                <span className="font-bold text-yellow-400">
                                    {game.steps}
                                </span>{' '}
                                步
                            </div>

                            {/* Star rating */}
                            <div className="text-3xl mt-2" aria-label={`${starCount} stars`}>
                                {Array.from({ length: 3 }, (_, i) => (
                                    <span
                                        key={i}
                                        className={
                                            i < starCount
                                                ? 'text-yellow-400'
                                                : 'text-white/20'
                                        }
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            {/* New record indicator */}
                            {game.wonLevelId &&
                                game.bestStepsMap[game.wonLevelId] === game.steps && (
                                    <div className="text-yellow-400 text-sm animate-pulse">
                                        新纪录！
                                    </div>
                                )}

                            <div className="flex gap-3 mt-3">
                                {nextLevel && (
                                    <button
                                        onClick={() => game.startLevel(nextLevel.id)}
                                        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold shadow-md transition-all active:scale-95"
                                    >
                                        下一关
                                    </button>
                                )}
                                <button
                                    onClick={game.reset}
                                    className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold transition-all active:scale-95"
                                >
                                    再玩一次
                                </button>
                                <button
                                    onClick={game.goBackToSelect}
                                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold transition-all active:scale-95"
                                >
                                    选关
                                </button>
                            </div>
                        </GameOverlay>
                    </div>

                    <ControlHints
                        hints={[
                            '拖拽方块移动',
                            'Tab 切换方块',
                            '方向键/WASD 移动',
                            'Ctrl+Z 撤销',
                        ]}
                        className="text-white/40 text-xs"
                    />
                </div>
            )}

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>{`
                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    20% {
                        transform: translateX(-4px);
                    }
                    40% {
                        transform: translateX(4px);
                    }
                    60% {
                        transform: translateX(-3px);
                    }
                    80% {
                        transform: translateX(3px);
                    }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </GameLayout>
    );
}
