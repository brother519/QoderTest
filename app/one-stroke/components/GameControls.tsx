/**
 * 游戏控制按钮组件
 *
 * 包含：撤销、重置、关卡选择按钮。
 *
 * @module one-stroke/components/GameControls
 */

'use client';

interface GameControlsProps {
    canUndo: boolean;
    onUndo: () => void;
    onReset: () => void;
    onToggleLevelSelect: () => void;
    levelName: string;
    levelIndex: number;
    traversedCount: number;
    totalEdges: number;
    isStuck?: boolean;
}

export function GameControls({
    canUndo,
    onUndo,
    onReset,
    onToggleLevelSelect,
    levelName,
    levelIndex,
    traversedCount,
    totalEdges,
    isStuck = false,
}: GameControlsProps) {
    const progress = totalEdges > 0 ? (traversedCount / totalEdges) * 100 : 0;

    return (
        <div className="w-full max-w-[400px] space-y-3">
            {/* 关卡信息 */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleLevelSelect}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600
                                   text-white rounded-lg transition-colors text-xs font-medium"
                    >
                        <span>📋</span>
                        <span>
                            第 {levelIndex + 1} 关 · {levelName}
                        </span>
                    </button>
                </div>
                <span className="text-slate-400 text-xs">
                    {traversedCount} / {totalEdges} 条边
                </span>
            </div>

            {/* 进度条 */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={[
                        'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        canUndo
                            ? 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-105 active:scale-95'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed',
                    ].join(' ')}
                >
                    <span>↩</span>
                    <span>撤销</span>
                </button>

                <button
                    onClick={onReset}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium
                               bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <span>🔄</span>
                    <span>重置</span>
                </button>
            </div>

            {/* 死局提示 */}
            {isStuck && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-900/40 border border-red-800/50 rounded-lg text-red-300 text-xs animate-pulse">
                    <span>⚠️</span>
                    <span>当前节点无路可走，请撤销或重置</span>
                </div>
            )}
        </div>
    );
}
