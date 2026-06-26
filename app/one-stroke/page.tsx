/**
 * 一笔画游戏主页面
 *
 * 整合 useOneStroke Hook 与所有 UI 组件。
 * 访问路径：/one-stroke
 *
 * @module one-stroke/page
 */

'use client';

import { useOneStroke } from './hooks/useOneStroke';
import { GameBoard } from './components/GameBoard';
import { LevelSelect } from './components/LevelSelect';
import { GameControls } from './components/GameControls';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { LEVELS } from './constants/config';

export default function OneStrokePage() {
    const game = useOneStroke();
    const { state, handleNodeClick, undo, reset, goToLevel, toggleLevelSelect, nextLevel } = game;
    const isStuck = (game as unknown as { isStuck: boolean }).isStuck;

    const { currentLevel, currentLevelIndex, status, currentNodeId, traversedEdgeIds, path } =
        state;

    const pathEdgeIds = path.map((s) => s.edgeId);
    const isLastLevel = currentLevelIndex === LEVELS.length - 1;

    return (
        <GameLayout
            title="一笔画"
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-8 px-4 min-h-screen"
        >
            <div className="flex flex-col items-center gap-5 pt-10 w-full">
                {/* 页面标题 */}
                <div className="text-center">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        <span className="text-amber-400">✏️</span> 一笔画
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        点击节点连线，一笔走过所有的边
                    </p>
                </div>

                {/* 游戏区域 */}
                <div className="relative">
                    {/* SVG 画板背景 */}
                    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/80 shadow-2xl shadow-black/40 p-2">
                        <GameBoard
                            level={currentLevel}
                            currentNodeId={currentNodeId}
                            traversedEdgeIds={traversedEdgeIds}
                            pathEdgeIds={pathEdgeIds}
                            onNodeClick={handleNodeClick}
                            disabled={status === 'won'}
                            isStuck={isStuck}
                        />
                    </div>

                    {/* 开始提示遮罩（pointer-events-none 让点击穿透到 SVG 节点） */}
                    {status === 'idle' && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg gap-3 pointer-events-none">
                            <div className="text-center px-6">
                                <div className="text-5xl mb-3">✏️</div>
                                <h2 className="text-white text-xl font-bold mb-2">
                                    第 {currentLevelIndex + 1} 关 · {currentLevel.name}
                                </h2>
                                <p className="text-slate-300 text-sm mb-1">
                                    共 {currentLevel.edges.length} 条边
                                </p>
                                <p className="text-amber-400 text-sm font-medium mt-3">
                                    点击任意节点开始
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 通关遮罩 */}
                    <GameOverlay visible={status === 'won'} bgClass="bg-black/70">
                        <div className="text-center px-6">
                            <div className="text-5xl mb-2 animate-bounce">🎉</div>
                            <h2 className="text-green-400 text-2xl font-black mb-1">通关！</h2>
                            <p className="text-white text-base mb-1">
                                第 {currentLevelIndex + 1} 关 · {currentLevel.name}
                            </p>
                            <p className="text-slate-300 text-sm mb-4">
                                共走 {path.length} 步，完成 {currentLevel.edges.length} 条边
                            </p>
                            <div className="flex flex-col gap-2 min-w-[180px]">
                                {!isLastLevel && (
                                    <button
                                        onClick={nextLevel}
                                        className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl
                                                   font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                                    >
                                        下一关 →
                                    </button>
                                )}
                                <button
                                    onClick={reset}
                                    className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl
                                               font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    重玩本关
                                </button>
                                <button
                                    onClick={toggleLevelSelect}
                                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl
                                               font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    选择关卡
                                </button>
                            </div>
                            {isLastLevel && (
                                <p className="text-amber-400 text-sm mt-3 font-medium">
                                    🏆 恭喜全部通关！
                                </p>
                            )}
                        </div>
                    </GameOverlay>

                    {/* 关卡选择界面 */}
                    {state.showLevelSelect && (
                        <LevelSelect
                            unlockedLevels={state.unlockedLevels}
                            currentLevelIndex={currentLevelIndex}
                            onSelectLevel={goToLevel}
                            onClose={toggleLevelSelect}
                        />
                    )}
                </div>

                {/* 控制区 */}
                <GameControls
                    canUndo={path.length > 0 && status !== 'won'}
                    onUndo={undo}
                    onReset={reset}
                    onToggleLevelSelect={toggleLevelSelect}
                    levelName={currentLevel.name}
                    levelIndex={currentLevelIndex}
                    traversedCount={traversedEdgeIds.size}
                    totalEdges={currentLevel.edges.length}
                    isStuck={isStuck}
                />

                {/* 玩法说明 */}
                <div className="text-slate-500 text-xs text-center space-y-0.5 pb-4">
                    <p>点击节点开始 · 再次点击相邻节点连线</p>
                    <p>走完所有边即可通关 · 蓝色圆圈为可到达节点</p>
                </div>
            </div>
        </GameLayout>
    );
}
