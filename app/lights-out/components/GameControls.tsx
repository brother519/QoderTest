'use client';

/**
 * 点灯游戏控制面板
 *
 * @module lights-out/components/GameControls
 */

interface GameControlsProps {
    moves: number;
    lightsOn: number;
    onReset: () => void;
}

export function GameControls({ moves, lightsOn, onReset }: GameControlsProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">步数</span>
                    <span className="text-lg font-bold text-amber-400 tabular-nums">{moves}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">剩余</span>
                    <span className="text-lg font-bold text-yellow-400 tabular-nums">{lightsOn}</span>
                </div>
            </div>

            <button
                onClick={onReset}
                className="px-4 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-all active:scale-95"
            >
                ↻ 重置 (R)
            </button>

            <div className="text-slate-500 text-xs text-center">
                点击格子切换灯光 · 目标：全部熄灭
            </div>
        </div>
    );
}
