/**
 * Hanoi Tower Game Page
 *
 * @module hanoi/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { useHanoiGame, getOptimalMoves } from './hooks/useHanoiGame';
import { HanoiBoard } from './components/HanoiBoard';
import { GameStats } from './components/GameStats';
import { LevelSelector } from './components/LevelSelector';

export default function HanoiPage() {
    const {
        state,
        stats,
        elapsedTime,
        startGame,
        resetGame,
        togglePause,
        moveDisk,
        selectPeg,
    } = useHanoiGame();

    return (
        <GameLayout title="汉诺塔">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 pt-20">
                {/* 层数选择器 */}
                <LevelSelector
                    unlockedLevels={stats.unlockedLevels}
                    currentLevel={state.level}
                    onSelectLevel={startGame}
                />

                {/* 统计面板 */}
                <GameStats
                    stats={stats}
                    currentLevel={state.level}
                    currentMoves={state.moveCount}
                    elapsedTime={elapsedTime}
                />

                {/* 游戏画布 */}
                <div className="relative">
                    <HanoiBoard
                        pegs={state.pegs}
                        selectedPeg={state.selectedPeg}
                        level={state.level}
                        onPegClick={selectPeg}
                        onDiskMove={moveDisk}
                    />

                    {/* 暂停遮罩 */}
                    {state.status === 'paused' && (
                        <GameOverlay visible={true}>
                            <h2 className="text-2xl font-bold text-white">游戏暂停</h2>
                            <button
                                onClick={togglePause}
                                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
                            >
                                继续游戏
                            </button>
                        </GameOverlay>
                    )}

                    {/* 完成遮罩 */}
                    {state.status === 'completed' && (
                        <GameOverlay visible={true}>
                            <h2 className="text-2xl font-bold text-white">🎉 恭喜通关！</h2>
                            <p className="text-center text-white/80">
                                你用 {state.moveCount} 步完成了 {state.level} 层汉诺塔！
                                <br />
                                最优步数是 {getOptimalMoves(state.level)} 步。
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => startGame(state.level + 1)}
                                    className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
                                >
                                    下一关
                                </button>
                                <button
                                    onClick={resetGame}
                                    className="rounded-lg bg-slate-600 px-6 py-2 font-semibold text-white hover:bg-slate-700"
                                >
                                    重玩本关
                                </button>
                            </div>
                        </GameOverlay>
                    )}
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={togglePause}
                        disabled={state.status === 'completed'}
                        className="rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {state.status === 'paused' ? '继续' : '暂停'}
                    </button>
                    <button
                        onClick={resetGame}
                        className="rounded-lg bg-slate-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                        重置
                    </button>
                </div>

                {/* 操作说明 */}
                <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
                    <h3 className="mb-2 font-semibold text-white">操作说明</h3>
                    <ul className="list-inside list-disc space-y-1">
                        <li>点击模式：先点击源柱子，再点击目标柱子移动圆盘</li>
                        <li>拖拽模式：按住最上面的圆盘拖拽到目标柱子</li>
                        <li>规则：每次只能移动一个圆盘，大圆盘不能放在小圆盘上</li>
                    </ul>
                </div>
            </div>
        </GameLayout>
    );
}
