'use client';

import { Player, GomokuStatus } from '../types/game';

interface GomokuInfoProps {
    currentPlayer: Player;
    moveCount: number;
    status: GomokuStatus;
    winner: Player | null;
    canUndo: boolean;
    onUndo: () => void;
    onStart: () => void;
    onRestart: () => void;
}

export function GomokuInfo({
    currentPlayer,
    moveCount,
    status,
    winner,
    canUndo,
    onUndo,
    onStart,
    onRestart,
}: GomokuInfoProps) {
    const getStatusText = () => {
        switch (status) {
            case 'idle':
                return '等待开始';
            case 'playing':
                return '对弈中';
            case 'won':
                return winner === 'black' ? '⚫ 黑方胜' : '⚪ 白方胜';
            case 'draw':
                return '🤝 平局';
        }
    };

    return (
        <div className="flex items-center justify-between w-full max-w-[552px] mb-3 px-2">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white/60">执棋:</span>
                    <span className="text-lg">
                        {currentPlayer === 'black' ? '⚫' : '⚪'}
                    </span>
                    <span className="text-sm text-white/80">
                        {currentPlayer === 'black' ? '黑方' : '白方'}
                    </span>
                </div>
                <div className="text-sm text-white/60">
                    步数: <span className="text-white/90 font-mono">{moveCount}</span>
                </div>
                <div className="text-sm text-amber-300 font-medium">{getStatusText()}</div>
            </div>
            <div className="flex items-center gap-2">
                {status === 'playing' && (
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20
                                   text-white/80 hover:text-white disabled:opacity-30
                                   disabled:cursor-not-allowed transition-all"
                    >
                        悔棋
                    </button>
                )}
                {status === 'idle' ? (
                    <button
                        onClick={onStart}
                        className="px-4 py-1.5 text-xs rounded-md bg-amber-600 hover:bg-amber-500
                                   text-white font-medium transition-all"
                    >
                        开始游戏
                    </button>
                ) : (
                    <button
                        onClick={onRestart}
                        className="px-4 py-1.5 text-xs rounded-md bg-amber-600 hover:bg-amber-500
                                   text-white font-medium transition-all"
                    >
                        重新开始
                    </button>
                )}
            </div>
        </div>
    );
}
