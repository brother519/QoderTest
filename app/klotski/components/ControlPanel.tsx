'use client';

interface ControlPanelProps {
  steps: number;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onBack: () => void;
  levelName: string;
}

export function ControlPanel({
  steps,
  canUndo,
  onUndo,
  onReset,
  onBack,
  levelName,
}: ControlPanelProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-xs gap-3">
      <button
        onClick={onBack}
        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20
                   text-white/70 hover:text-white text-sm transition-all"
      >
        关卡
      </button>

      <div className="text-center">
        <div className="text-white/50 text-xs">{levelName}</div>
        <div className="text-white font-bold text-xl font-mono">{steps} 步</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20
                     text-white/70 hover:text-white text-sm transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          撤销
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20
                     text-white/70 hover:text-white text-sm transition-all"
        >
          重置
        </button>
      </div>
    </div>
  );
}
