'use client';

/**
 * 推箱子操作控制面板
 *
 * 显示步数统计、撤销和重置按钮、操作提示。
 *
 * @module sokoban/components/GameControls
 */

interface GameControlsProps {
    /** 移动步数 */
    moves: number;
    /** 推箱子次数 */
    pushes: number;
    /** 是否可以撤销 */
    canUndo: boolean;
    /** 撤销回调 */
    onUndo: () => void;
    /** 重置回调 */
    onReset: () => void;
}

export function GameControls({ moves, pushes, canUndo, onUndo, onReset }: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            {/* 统计信息 */}
            <div className="flex gap-6 text-stone-300">
                <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-sm">步数</span>
                    <span className="text-lg font-bold text-amber-400 tabular-nums">{moves}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-sm">推动</span>
                    <span className="text-lg font-bold text-emerald-400 tabular-nums">{pushes}</span>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="px-4 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 text-sm font-medium transition-all active:scale-95"
                >
                    ↩ 撤销 (Z)
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-medium transition-all active:scale-95"
                >
                    ↻ 重置 (R)
                </button>
            </div>

            {/* 操作提示 */}
            <div className="text-stone-500 text-xs text-center">
                方向键 / WASD 移动 · Z 撤销 · R 重置
            </div>
        </div>
    );
}
