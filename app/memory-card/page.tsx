'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks';
import { useMemoryCard } from './hooks/useMemoryCard';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { formatTime } from '@/lib/utils/format';

const KEY_MAP: Record<string, string> = {
    r: 'restart',
    R: 'restart',
};

export default function MemoryCardPage() {
    const game = useMemoryCard('easy');

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (action === 'restart') game.restart();
        },
    });

    return (
        <GameLayout
            title="记忆翻牌"
            className="bg-gradient-to-b from-emerald-950 via-teal-950 to-emerald-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="记忆翻牌"
                icon="🃏"
                colorClass="text-emerald-400"
                subtitle="翻开卡牌找配对，考验你的记忆力"
            />

            <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-3xl">
                <GameControls
                    moves={game.moves}
                    time={game.time}
                    combo={game.combo}
                    maxCombo={game.maxCombo}
                    difficulty={game.difficulty}
                    bestRecord={game.bestRecord}
                    onRestart={game.restart}
                    onSetDifficulty={game.setDifficulty}
                />

                <div className="relative">
                    {game.mounted ? (
                        <Board
                            cards={game.cards}
                            config={game.config}
                            disabled={game.disabled}
                            onCardClick={game.flipCard}
                        />
                    ) : (
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 rounded-lg bg-teal-700/30 animate-pulse"
                                />
                            ))}
                        </div>
                    )}

                    <GameOverlay
                        visible={game.status === 'won'}
                        bgClass="bg-emerald-950/80 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-yellow-300 text-4xl font-bold drop-shadow-lg">
                                🎉 全部配对！
                            </div>
                            <div className="text-white/80 text-lg">
                                用了{' '}
                                <span className="font-bold text-emerald-400">
                                    {game.moves}
                                </span>{' '}
                                步，耗时{' '}
                                <span className="font-bold text-white">
                                    {formatTime(game.time)}
                                </span>
                            </div>
                            {game.maxCombo >= 2 && (
                                <div className="text-orange-400 text-sm">
                                    最高连击：{game.maxCombo} 连！
                                </div>
                            )}
                            {game.bestRecord.moves === game.moves && (
                                <div className="text-yellow-400 text-sm animate-pulse">
                                    🏆 新纪录！
                                </div>
                            )}
                            <button
                                onClick={game.restart}
                                className="mt-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                            >
                                再来一局
                            </button>
                        </div>
                    </GameOverlay>
                </div>

                <ControlHints
                    hints={['点击卡牌翻面', '找到相同图案配对', 'R 重新开始']}
                    className="text-emerald-300/50 text-xs"
                />
            </div>
        </GameLayout>
    );
}
