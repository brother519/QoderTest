'use client';

interface ControlPanelProps {
    steps: number;
    bestSteps: number | null;
    parSteps: number;
    canUndo: boolean;
    onUndo: () => void;
    onReset: () => void;
    onBack: () => void;
}

/**
 * Game control panel displaying step counts and action buttons.
 * Features a clean, minimal design with ink-painting aesthetic accents.
 */
export function ControlPanel({
    steps,
    bestSteps,
    parSteps,
    canUndo,
    onUndo,
    onReset,
    onBack,
}: ControlPanelProps) {
    return (
        <div className="flex flex-wrap items-center justify-between w-full max-w-md gap-3 px-2">
            {/* Back button */}
            <button
                onClick={onBack}
                className="px-3 py-2 rounded-lg bg-stone-700/50 hover:bg-stone-600/60
                    border border-stone-600/40 hover:border-stone-500/50
                    text-stone-300 hover:text-white text-sm font-medium
                    transition-all duration-200 active:scale-95"
            >
                &larr; 选关
            </button>

            {/* Steps display area */}
            <div className="flex items-center gap-4">
                {/* Current steps - prominent */}
                <div className="text-center">
                    <div className="text-stone-400 text-[10px] uppercase tracking-wider font-medium">
                        步数
                    </div>
                    <div className="text-white font-bold text-2xl font-mono leading-tight">
                        {steps}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-stone-600/50" />

                {/* Best steps */}
                <div className="text-center">
                    <div className="text-stone-400 text-[10px] uppercase tracking-wider font-medium">
                        最佳
                    </div>
                    <div className="text-yellow-400/90 font-bold text-lg font-mono leading-tight">
                        {bestSteps !== null ? bestSteps : '--'}
                    </div>
                </div>

                {/* Par steps */}
                <div className="text-center">
                    <div className="text-stone-400 text-[10px] uppercase tracking-wider font-medium">
                        参考
                    </div>
                    <div className="text-stone-300/80 font-bold text-lg font-mono leading-tight">
                        {parSteps}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="px-3 py-2 rounded-lg bg-stone-700/50 hover:bg-stone-600/60
                        border border-stone-600/40 hover:border-stone-500/50
                        text-stone-300 hover:text-white text-sm font-medium
                        transition-all duration-200 active:scale-95
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-stone-700/50"
                >
                    &#8617; 撤销
                </button>
                <button
                    onClick={onReset}
                    className="px-3 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/50
                        border border-red-700/40 hover:border-red-600/50
                        text-red-200/80 hover:text-red-100 text-sm font-medium
                        transition-all duration-200 active:scale-95"
                >
                    &#10227; 重置
                </button>
            </div>
        </div>
    );
}
