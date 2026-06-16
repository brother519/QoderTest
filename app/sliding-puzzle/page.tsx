/**
 * 滑动拼图游戏主页面
 *
 * @module sliding-puzzle/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { useSlidingPuzzleGame } from './hooks/useSlidingPuzzleGame';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { DEFAULT_CONFIG } from './constants/config';

const CELL_SIZE = 80;
const GAP = 8;

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
    r: 'restart',
    R: 'restart',
};

export default function SlidingPuzzlePage() {
    const game = useSlidingPuzzleGame(DEFAULT_CONFIG);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (action === 'restart') {
                game.restart();
                return;
            }

            if (game.status === 'won') return;

            const emptyIndex = game.board.indexOf(0);
            const size = game.size;
            const row = Math.floor(emptyIndex / size);
            const col = emptyIndex % size;

            let targetIndex: number | null = null;

            switch (action) {
                case 'up':
                    if (row < size - 1) targetIndex = emptyIndex + size;
                    break;
                case 'down':
                    if (row > 0) targetIndex = emptyIndex - size;
                    break;
                case 'left':
                    if (col < size - 1) targetIndex = emptyIndex + 1;
                    break;
                case 'right':
                    if (col > 0) targetIndex = emptyIndex - 1;
                    break;
            }

            if (targetIndex !== null) {
                game.moveTile(targetIndex);
            }
        },
    });

    return (
        <GameLayout
            title="滑动拼图"
            className="bg-gradient-to-b from-emerald-950 via-teal-950 to-emerald-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="滑动拼图"
                icon="🧩"
                colorClass="text-emerald-400"
                subtitle="把数字按 1-15 顺序排列，空白格停在右下角"
            />

            <div className="flex flex-col items-center gap-4 mt-4">
                <GameControls
                    moves={game.moves}
                    time={game.time}
                    status={game.status}
                    bestRecord={game.bestRecord}
                    onRestart={game.restart}
                />

                <div className="relative">
                    <Board
                        board={game.board}
                        size={game.size}
                        canMove={game.canMove}
                        selectedIndex={game.selectedIndex}
                        cellSize={CELL_SIZE}
                        gap={GAP}
                        moveDuration={DEFAULT_CONFIG.moveDuration}
                        onTileClick={game.moveTile}
                    />

                    <GameOverlay visible={game.status === 'won'} bgClass="bg-emerald-950/80 backdrop-blur-sm">
                        <div className="text-yellow-300 text-4xl font-bold drop-shadow-lg">🎉 拼图完成！</div>
                        <div className="text-white/80 text-sm">
                            用了 <span className="font-bold text-emerald-400">{game.moves}</span> 步，
                            耗时 <span className="font-bold text-white">{game.time}</span> 秒
                        </div>
                        {game.bestRecord.moves === game.moves && (
                            <div className="text-yellow-400 text-sm animate-pulse">🏆 新纪录！</div>
                        )}
                        <button
                            onClick={game.restart}
                            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95"
                        >
                            再玩一次
                        </button>
                    </GameOverlay>
                </div>

                <ControlHints
                    hints={['点击与空白相邻的方块移动', '方向键 / WASD 移动', 'R 重新开始']}
                    className="text-emerald-300/50 text-xs"
                />
            </div>
        </GameLayout>
    );
}
