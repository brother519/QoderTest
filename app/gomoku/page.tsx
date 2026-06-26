'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { ControlHints } from '@/lib/components/ControlHints';
import { useGomokuGame } from './hooks/useGomokuGame';
import { GomokuBoard } from './components/GomokuBoard';
import { GomokuInfo } from './components/GomokuInfo';
import { DEFAULT_CONFIG } from './constants/config';

export default function GomokuPage() {
    const game = useGomokuGame(DEFAULT_CONFIG);

    return (
        <GameLayout
            title="五子棋"
            className="bg-gradient-to-b from-gray-950 via-amber-950/30 to-gray-950
                       flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="五子棋"
                icon="⚫"
                colorClass="text-amber-400"
                subtitle="经典双人对弈，先连成五子者获胜"
            />

            <GomokuInfo
                currentPlayer={game.currentPlayer}
                moveCount={game.moveCount}
                status={game.status}
                winner={game.winner}
                canUndo={game.status === 'playing' && game.moveCount > 0}
                onUndo={game.undo}
                onStart={game.start}
                onRestart={game.restart}
            />

            <div className="relative">
                <GomokuBoard
                    board={game.board}
                    config={DEFAULT_CONFIG}
                    lastMove={game.lastMove}
                    winLine={game.winLine}
                    disabled={game.status !== 'playing'}
                    onCellClick={game.makeMove}
                />

                <GameOverlay visible={game.status === 'idle'}>
                    <div className="text-xl font-bold text-white">⚫ 五子棋</div>
                    <button
                        onClick={game.start}
                        className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500
                                   text-white font-medium transition-all"
                    >
                        开始游戏
                    </button>
                </GameOverlay>

                <GameOverlay visible={game.status === 'won' || game.status === 'draw'}>
                    {game.status === 'won' && (
                        <div className="text-xl font-bold text-amber-300">
                            {game.winner === 'black' ? '⚫ 黑方胜利！' : '⚪ 白方胜利！'}
                        </div>
                    )}
                    {game.status === 'draw' && (
                        <div className="text-xl font-bold text-white/80">🤝 平局</div>
                    )}
                    <button
                        onClick={game.restart}
                        className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500
                                   text-white font-medium transition-all"
                    >
                        再来一局
                    </button>
                </GameOverlay>
            </div>

            <ControlHints
                hints={['点击棋盘落子', '黑方先行']}
                className="text-amber-200/40 text-xs"
            />
        </GameLayout>
    );
}
