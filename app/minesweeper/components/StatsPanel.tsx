/**
 * 扫雷游戏统计面板组件
 *
 * @module minesweeper/components/StatsPanel
 */

import type { DifficultyStats } from '../types/game';
import { formatTime } from '@/lib/utils/format';

export interface StatsPanelProps {
  stats: DifficultyStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-950/45 px-3 py-2 shrink-0">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-black text-cyan-300">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">总局数</div>
        </div>
        <div>
          <div className="text-lg font-black text-emerald-300">{stats.gamesWon}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">胜利</div>
        </div>
        <div>
          <div className="text-lg font-black text-amber-300">{winRate}%</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">胜率</div>
        </div>
        <div>
          <div className="text-lg font-black text-cyan-200 tabular-nums">{formatTime(stats.totalTime)}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">总用时</div>
        </div>
      </div>
    </div>
  );
}
