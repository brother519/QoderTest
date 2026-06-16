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
    <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/45 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/45 mb-3">
        本难度统计
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-black text-cyan-300">{stats.gamesPlayed}</div>
          <div className="text-xs text-cyan-50/60 mt-1">总局数</div>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-300">{stats.gamesWon}</div>
          <div className="text-xs text-cyan-50/60 mt-1">胜利</div>
        </div>
        <div>
          <div className="text-2xl font-black text-amber-300">{winRate}%</div>
          <div className="text-xs text-cyan-50/60 mt-1">胜率</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <div className="text-sm text-cyan-50/70">
          总用时 <span className="font-mono text-cyan-200">{formatTime(stats.totalTime)}</span>
        </div>
      </div>
    </div>
  );
}
