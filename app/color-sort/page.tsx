'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks';
import { useColorSortGame } from './hooks/useColorSortGame';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { formatTime } from '@/lib/utils/format';

const KEY_MAP: Record<string, string> = {
    r: 'restart',
    R: 'restart',
    z: 'undo',
    Z: 'undo',
};

export default function ColorSortPage() {
    const game = useColorSortGame('easy');

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (action === 'restart') game.restart();
            if (action === 'undo') game.undo();
        },
    });

    return (
        <GameLayout
            title="颜色排序"
            className="bg-gradient-to-b from-violet-950 via-fuchsia-950 to-violet-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="颜色排序"
                icon="🧪"
                colorClass="text-fuchsia-400"
                subtitle="点击试管选球，相同颜色才能放在一起"
            />

            <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-3xl">
                <GameControls
                    moves={game.moves}
                    time={game.time}
                    difficulty={game.difficulty}
                    bestRecord={game.bestRecord}
                    canUndo={game.canUndo}
                    status={game.status}
                    onUndo={game.undo}
                    onRestart={game.restart}
                    onSetDifficulty={game.setDifficulty}
                />

                <div className="relative">
                    <Board
                        tubes={game.tubes}
                        selectedTube={game.selectedTube}
                        canPlace={game.canPlace}
                        onTubeClick={game.selectTube}
                    />

                    <GameOverlay
                        visible={game.status === 'won'}
                        bgClass="bg-violet-950/80 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-yellow-300 text-4xl font-bold drop-shadow-lg">
                                🎉 排序完成！
                            </div>
                            <div className="text-white/80 text-lg">
                                用了{' '}
                                <span className="font-bold text-fuchsia-400">
                                    {game.moves}
                                </span>{' '}
                                步，耗时{' '}
                                <span className="font-bold text-white">
                                    {formatTime(game.time)}
                                </span>
                            </div>
                            {game.bestRecord.moves === game.moves && (
                                <div className="text-yellow-400 text-sm animate-pulse">
                                    🏆 新纪录！
                                </div>
                            )}
                            <button
                                onClick={game.restart}
                                className="mt-2 px-6 py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-all active:scale-95 shadow-lg shadow-fuchsia-500/30"
                            >
                                再来一局
                            </button>
                        </div>
                    </GameOverlay>
                </div>

                <ControlHints
                    hints={['点击试管选球/放球', 'Z 撤销', 'R 重新开始']}
                    className="text-fuchsia-300/50 text-xs"
                />
            </div>
        </GameLayout>
    );
}
