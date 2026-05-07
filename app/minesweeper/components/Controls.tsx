/**
 * 扫雷游戏控制面板组件
 *
 * @module minesweeper/components/Controls
 */

'use client';

import { DIFFICULTIES, DIFFICULTY_ORDER } from '../constants/config';
import type { DifficultyKey, GameStatus } from '../types/game';
import { formatTime } from '@/lib/utils/format';

interface ControlsProps {
  difficultyKey: DifficultyKey;
  remainingMines: number;
  elapsedTime: number;
  bestTime: number | null;
  status: GameStatus;
  onChangeDifficulty: (difficultyKey: DifficultyKey) => void;
  onRestart: () => void;
}

/** 状态文案映射 */
const STATUS_LABELS: Record<GameStatus, string> = {
  idle: '等待落子',
  playing: '正在排雷',
  won: '成功通关',
  lost: '踩雷失败',
};

export function Controls({
  difficultyKey,
  remainingMines,
  elapsedTime,
  bestTime,
  status,
  onChangeDifficulty,
  onRestart,
}: ControlsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-4 py-3">
            <div className="text-[11px] tracking-[0.2em] uppercase text-cyan-200/60">状态</div>
            <div className="mt-1 text-lg font-bold text-white">{STATUS_LABELS[status]}</div>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-4 py-3">
            <div className="text-[11px] tracking-[0.2em] uppercase text-cyan-200/60">剩余地雷</div>
            <div className="mt-1 text-2xl font-bold text-rose-300 tabular-nums">{remainingMines}</div>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-4 py-3">
            <div className="text-[11px] tracking-[0.2em] uppercase text-cyan-200/60">计时器</div>
            <div className="mt-1 text-2xl font-bold text-white tabular-nums">{formatTime(elapsedTime)}</div>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-4 py-3">
            <div className="text-[11px] tracking-[0.2em] uppercase text-cyan-200/60">最佳时间</div>
            <div className="mt-1 text-2xl font-bold text-emerald-300 tabular-nums">
              {bestTime === null ? '--:--' : formatTime(bestTime)}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          重新开局
        </button>
      </div>

      <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/45 backdrop-blur-sm p-2">
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_ORDER.map((key) => {
            const option = DIFFICULTIES[key];
            const isActive = key === difficultyKey;

            return (
              <button
                key={key}
                onClick={() => onChangeDifficulty(key)}
                className={[
                  'rounded-2xl px-3 py-3 text-left border transition-all duration-200',
                  isActive
                    ? 'border-cyan-300/70 bg-cyan-400/15 shadow-lg shadow-cyan-500/10'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <div className="text-sm font-semibold text-white">{option.label}</div>
                <div className="mt-1 text-xs text-cyan-100/60 tabular-nums">
                  {option.rows} × {option.cols} · {option.mines} 雷
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
