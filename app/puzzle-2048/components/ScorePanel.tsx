'use client';

/**
 * 2048 顶部信息面板
 *
 * 展示当前得分、最高分，以及"重新开始"按钮。
 *
 * @module puzzle-2048/components/ScorePanel
 */

interface ScorePanelProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

/** 得分单卡：标题 + 数值 */
function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-amber-900/60 rounded-md px-4 py-2 min-w-[80px] text-center">
      <div className="text-amber-200/70 text-xs uppercase tracking-wider">{label}</div>
      <div className="text-white font-bold text-xl tabular-nums">{value}</div>
    </div>
  );
}

export function ScorePanel({ score, highScore, onRestart }: ScorePanelProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex gap-2">
        <ScoreCard label="得分" value={score} />
        <ScoreCard label="最高" value={highScore} />
      </div>
      <button
        onClick={onRestart}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 active:scale-95
                   text-white font-bold transition-all shadow-md"
      >
        新游戏
      </button>
    </div>
  );
}
