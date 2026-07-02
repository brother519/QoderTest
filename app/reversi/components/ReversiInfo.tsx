'use client';

import { Difficulty, GameMode, Player, ReversiStatus, Score } from '../types/game';

interface ReversiInfoProps {
    currentPlayer: Player;
    status: ReversiStatus;
    winner: Player | null;
    score: Score;
    aiThinking: boolean;
    passInfo: Player | null;
    canUndo: boolean;
    mode: GameMode;
    difficulty: Difficulty;
    humanColor: Player;
    showHints: boolean;
    onUndo: () => void;
    onStart: () => void;
    onRestart: () => void;
    onModeChange: (m: GameMode) => void;
    onDifficultyChange: (d: Difficulty) => void;
    onHumanColorChange: (c: Player) => void;
    onToggleHints: () => void;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};

export function ReversiInfo({
    currentPlayer,
    status,
    winner,
    score,
    aiThinking,
    passInfo,
    canUndo,
    mode,
    difficulty,
    humanColor,
    showHints,
    onUndo,
    onStart,
    onRestart,
    onModeChange,
    onDifficultyChange,
    onHumanColorChange,
    onToggleHints,
}: ReversiInfoProps) {
    const statusText = () => {
        if (status === 'idle') return '等待开始';
        if (status === 'won') return winner === 'black' ? '⚫ 黑方胜' : '⚪ 白方胜';
        if (status === 'draw') return '🤝 平局';
        if (aiThinking) return '🤖 AI 思考中…';
        if (passInfo) return `${passInfo === 'black' ? '⚫ 黑方' : '⚪ 白方'} 无子可下，跳过`;
        return '对弈中';
    };

    const settingsDisabled = status === 'playing';

    return (
        <div className="w-full max-w-[calc(8*56px+40px)] mb-3 space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">⚫</span>
                        <span className="font-mono text-white/90 text-lg">{score.black}</span>
                    </div>
                    <div className="text-white/40">:</div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white/90 text-lg">{score.white}</span>
                        <span className="text-lg">⚪</span>
                    </div>
                    <div className="text-sm text-emerald-300 font-medium ml-2">{statusText()}</div>
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
                    <button
                        onClick={onToggleHints}
                        className="px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20
                                   text-white/80 hover:text-white transition-all"
                    >
                        {showHints ? '隐藏提示' : '显示提示'}
                    </button>
                    {status === 'idle' ? (
                        <button
                            onClick={onStart}
                            className="px-4 py-1.5 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500
                                       text-white font-medium transition-all"
                        >
                            开始游戏
                        </button>
                    ) : (
                        <button
                            onClick={onRestart}
                            className="px-4 py-1.5 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500
                                       text-white font-medium transition-all"
                        >
                            重新开始
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-white/70">
                <div className="flex items-center gap-1.5">
                    <span>模式:</span>
                    <SegButton
                        active={mode === 'pvp'}
                        disabled={settingsDisabled}
                        onClick={() => onModeChange('pvp')}
                    >
                        双人
                    </SegButton>
                    <SegButton
                        active={mode === 'pve'}
                        disabled={settingsDisabled}
                        onClick={() => onModeChange('pve')}
                    >
                        人机
                    </SegButton>
                </div>

                {mode === 'pve' && (
                    <>
                        <div className="flex items-center gap-1.5">
                            <span>难度:</span>
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                                <SegButton
                                    key={d}
                                    active={difficulty === d}
                                    disabled={settingsDisabled}
                                    onClick={() => onDifficultyChange(d)}
                                >
                                    {DIFFICULTY_LABEL[d]}
                                </SegButton>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>执子:</span>
                            <SegButton
                                active={humanColor === 'black'}
                                disabled={settingsDisabled}
                                onClick={() => onHumanColorChange('black')}
                            >
                                ⚫ 黑
                            </SegButton>
                            <SegButton
                                active={humanColor === 'white'}
                                disabled={settingsDisabled}
                                onClick={() => onHumanColorChange('white')}
                            >
                                ⚪ 白
                            </SegButton>
                        </div>
                    </>
                )}

                <div className="ml-auto flex items-center gap-1.5">
                    <span>当前:</span>
                    <span className="text-lg leading-none">
                        {currentPlayer === 'black' ? '⚫' : '⚪'}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface SegButtonProps {
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

function SegButton({ active, disabled, onClick, children }: SegButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                'px-2 py-0.5 rounded text-xs transition-colors',
                active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/15',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
        >
            {children}
        </button>
    );
}
