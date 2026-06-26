/**
 * Maze game main page
 *
 * @module maze/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { useMaze } from './hooks/useMaze';
import { MazeBoard } from './components/MazeBoard';
import { GameControls } from './components/GameControls';
import { CELL_SIZES } from './constants/config';
import { MazeDirection } from './types/game';

export default function MazePage() {
    const game = useMaze('easy');

    // Keyboard controls for movement and restart
    useKeyboard(
        {
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
            r: 'restart',
            R: 'restart',
        },
        {
            onKeyDown: (action) => {
                if (action === 'restart') {
                    game.restart();
                } else {
                    game.move(action as MazeDirection);
                }
            },
        },
    );

    const cellSize = CELL_SIZES[game.difficulty];

    /** Format seconds to mm:ss */
    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <GameLayout
            title="迷宫"
            className="bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="迷宫"
                icon="🏁"
                colorClass="text-emerald-400"
                subtitle="使用方向键控制角色到达终点"
            />

            <div className="flex flex-col items-center gap-4">
                {/* Game controls above the board */}
                <GameControls
                    difficulty={game.difficulty}
                    elapsedTime={game.elapsedTime}
                    bestTimes={game.bestTimes}
                    moveCount={game.moveCount}
                    status={game.status}
                    onDifficultyChange={(d) => game.newMaze(d)}
                    onNewMaze={() => game.newMaze(game.difficulty)}
                />

                {/* Maze board with overlay */}
                <div className="relative">
                    <MazeBoard
                        grid={game.grid}
                        playerPosition={game.playerPosition}
                        exitPosition={game.exitPosition}
                        cellSize={cellSize}
                    />

                    {/* Win overlay */}
                    <GameOverlay visible={game.status === 'won'} bgClass="bg-slate-900/85">
                        <div className="text-5xl mb-2">🎉</div>
                        <div className="text-xl font-bold text-emerald-300">
                            恭喜通关！
                        </div>
                        <div className="text-white/70 text-sm">
                            用时 {formatTime(game.elapsedTime)} · {game.moveCount} 步
                        </div>
                        {game.bestTimes[game.difficulty] === game.elapsedTime && (
                            <div className="text-amber-400 text-sm font-medium mt-1">
                                🏆 新纪录！
                            </div>
                        )}
                        <button
                            onClick={() => game.newMaze(game.difficulty)}
                            className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                       text-white text-sm font-medium transition-all duration-200"
                        >
                            再来一局
                        </button>
                    </GameOverlay>
                </div>
            </div>

            <ControlHints
                hints={['方向键/WASD 移动', '按 R 重置位置', '到达 🏁 即为通关']}
                className="text-slate-500 text-xs"
            />
        </GameLayout>
    );
}
