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
    <div className="w-full max-w-5xl mx-auto space-y-2 shrink-0">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">状态</div>
            <div className="mt-0.5 text-sm font-bold text-white">{STATUS_LABELS[status]}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">剩余地雷</div>
            <div className="mt-0.5 text-lg font-bold text-rose-300 tabular-nums">{remainingMines}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">计时器</div>
            <div className="mt-0.5 text-lg font-bold text-white tabular-nums">{formatTime(elapsedTime)}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">最佳时间</div>
            <div className="mt-0.5 text-lg font-bold text-emerald-300 tabular-nums">
              {bestTime === null ? '--:--' : formatTime(bestTime)}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          重新开局
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/45 backdrop-blur-sm p-1">
        <div className="grid grid-cols-3 gap-1">
          {DIFFICULTY_ORDER.map((key) => {
            const option = DIFFICULTIES[key];
            const isActive = key === difficultyKey;

            return (
              <button
                key={key}
                onClick={() => onChangeDifficulty(key)}
                className={[
                  'rounded-xl px-2 py-2 text-left border transition-all duration-200',
                  isActive
                    ? 'border-cyan-300/70 bg-cyan-400/15 shadow-lg shadow-cyan-500/10'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <div className="text-xs font-semibold text-white">{option.label}</div>
                <div className="text-[10px] text-cyan-100/60 tabular-nums">
                  {option.rows}×{option.cols} · {option.mines} 雷
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
