'use client';

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { ControlHints } from '@/lib/components/ControlHints';
import { useReversiGame } from './hooks/useReversiGame';
import { ReversiBoard } from './components/ReversiBoard';
import { ReversiInfo } from './components/ReversiInfo';
import { DEFAULT_CONFIG } from './constants/config';
import { Difficulty, GameMode, Player } from './types/game';

export default function ReversiPage() {
    const [mode, setMode] = useState<GameMode>('pve');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [humanColor, setHumanColor] = useState<Player>('black');
    const [showHints, setShowHints] = useState(true);

    const game = useReversiGame({
        config: DEFAULT_CONFIG,
        mode,
        difficulty,
        humanColor,
    });

    const boardDisabled =
        game.status !== 'playing' ||
        game.aiThinking ||
        (mode === 'pve' && game.currentPlayer !== humanColor);

    return (
        <GameLayout
            title="黑白棋"
            className="bg-gradient-to-b from-gray-950 via-emerald-950/30 to-gray-950
                       flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="黑白棋"
                icon="⚫⚪"
                colorClass="text-emerald-300"
                subtitle="夹住即翻，终局子多者胜"
            />

            <ReversiInfo
                currentPlayer={game.currentPlayer}
                status={game.status}
                winner={game.winner}
                score={game.score}
                aiThinking={game.aiThinking}
                passInfo={game.passInfo}
                canUndo={game.canUndo}
                mode={mode}
                difficulty={difficulty}
                humanColor={humanColor}
                showHints={showHints}
                onUndo={game.undo}
                onStart={game.start}
                onRestart={game.restart}
                onModeChange={setMode}
                onDifficultyChange={setDifficulty}
                onHumanColorChange={setHumanColor}
                onToggleHints={() => setShowHints((v) => !v)}
            />

            <div className="relative">
                <ReversiBoard
                    board={game.board}
                    config={DEFAULT_CONFIG}
                    legalMoves={game.legalMoves}
                    lastMove={game.lastMove}
                    disabled={boardDisabled}
                    showHints={showHints && !boardDisabled}
                    onCellClick={game.makeMove}
                />

                <GameOverlay visible={game.status === 'idle'}>
                    <div className="text-xl font-bold text-white">⚫⚪ 黑白棋</div>
                    <div className="text-sm text-white/70 max-w-xs text-center">
                        选择模式与难度，点击「开始游戏」落下第一子。夹住对手棋子即可翻转。
                    </div>
                    <button
                        onClick={game.start}
                        className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                   text-white font-medium transition-all"
                    >
                        开始游戏
                    </button>
                </GameOverlay>

                <GameOverlay visible={game.status === 'won' || game.status === 'draw'}>
                    {game.status === 'won' && (
                        <div className="text-xl font-bold text-emerald-200">
                            {game.winner === 'black' ? '⚫ 黑方胜利！' : '⚪ 白方胜利！'}
                        </div>
                    )}
                    {game.status === 'draw' && (
                        <div className="text-xl font-bold text-white/80">🤝 平局</div>
                    )}
                    <div className="text-sm text-white/80 font-mono">
                        ⚫ {game.score.black} : {game.score.white} ⚪
                    </div>
                    <button
                        onClick={game.restart}
                        className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                   text-white font-medium transition-all"
                    >
                        再来一局
                    </button>
                </GameOverlay>
            </div>

            <ControlHints
                hints={[
                    '黑方先行',
                    '点击高亮点落子',
                    '无子可下时自动跳过',
                ]}
                className="text-emerald-200/40 text-xs"
            />
        </GameLayout>
    );
}
