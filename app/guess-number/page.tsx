'use client';

/**
 * 猜数字游戏主页面
 *
 * @module guess-number/page
 */

import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { ControlHints } from '@/lib/components/ControlHints';
import { useGuessNumberGame } from './hooks/useGuessNumberGame';
import { GuessInput } from './components/GuessInput';
import { GuessHistory } from './components/GuessHistory';
import { DIFFICULTY_LABELS } from './constants/config';
import { Difficulty } from './types/game';
import { formatTime } from '@/lib/utils/format';

export default function GuessNumberPage() {
    const game = useGuessNumberGame('medium');

    const isGameOver = game.status === 'won' || game.status === 'lost';

    return (
        <GameLayout
            title="猜数字"
            className="bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="猜数字"
                icon="🔢"
                colorClass="text-emerald-400"
                subtitle={`猜出 ${game.codeLength} 位不重复数字（0~${game.digitRange - 1}）`}
            />

            <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-lg">
                {/* 顶部信息栏 */}
                <div className="flex items-center justify-between w-full max-w-sm px-2">
                    {/* 难度选择 */}
                    <div className="flex gap-1">
                        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                onClick={() => game.setDifficulty(d)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                    game.difficulty === d
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                }`}
                            >
                                {DIFFICULTY_LABELS[d]}
                            </button>
                        ))}
                    </div>

                    {/* 计时器 & 最佳记录 */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>⏱ {formatTime(game.time)}</span>
                        {game.bestScore !== null && (
                            <span className="text-amber-400">🏆 {game.bestScore}步</span>
                        )}
                    </div>
                </div>

                {/* 剩余次数提示 */}
                <div className="text-sm text-slate-400">
                    剩余次数：
                    <span
                        className={`font-bold ${
                            game.maxAttempts - game.attempts <= 3
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                        }`}
                    >
                        {game.maxAttempts - game.attempts}
                    </span>
                    /{game.maxAttempts}
                </div>

                {/* 猜测历史 */}
                <GuessHistory
                    history={game.history}
                    codeLength={game.codeLength}
                    maxAttempts={game.maxAttempts}
                />

                {/* 输入区 + 遮罩 */}
                <div className="relative w-full flex flex-col items-center">
                    <GuessInput
                        codeLength={game.codeLength}
                        digitRange={game.digitRange}
                        disabled={isGameOver}
                        onSubmit={game.makeGuess}
                    />

                    <GameOverlay
                        visible={isGameOver}
                        bgClass="bg-slate-900/90 backdrop-blur-sm"
                    >
                        {game.status === 'won' && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl font-bold text-emerald-400 drop-shadow-lg">
                                    🎉 破解成功！
                                </div>
                                <div className="text-white/80">
                                    答案是{' '}
                                    <span className="font-bold text-emerald-300 text-lg">
                                        {game.secret}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-400">
                                    用了 {game.attempts} 步，耗时 {formatTime(game.time)}
                                </div>
                                {game.bestScore === game.attempts && (
                                    <div className="text-yellow-400 text-sm animate-pulse">
                                        🏆 新纪录！
                                    </div>
                                )}
                            </div>
                        )}
                        {game.status === 'lost' && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl font-bold text-rose-400 drop-shadow-lg">
                                    😵 挑战失败
                                </div>
                                <div className="text-white/80">
                                    答案是{' '}
                                    <span className="font-bold text-rose-300 text-lg">
                                        {game.secret}
                                    </span>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={game.restart}
                            className="mt-3 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                        >
                            再来一局
                        </button>
                    </GameOverlay>
                </div>

                <ControlHints
                    hints={[
                        'A = 数字和位置都对',
                        'B = 数字对但位置不对',
                        '键盘数字输入，Enter 确认',
                    ]}
                    className="text-slate-500 text-xs"
                />
            </div>
        </GameLayout>
    );
}
