/**
 * 打地鼠游戏控制面板组件
 *
 * @module whack-a-mole/components/GameControls
 */

'use client';

import { GameStatus } from '../types/game';
import { COMBO_THRESHOLD, COMBO_MULTIPLIERS } from '../constants/config';

interface GameControlsProps {
  score: number;
  highScore: number;
  timeLeft: number;
  totalTime: number;
  combo: number;
  status: GameStatus;
  onStart: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

function getComboLabel(combo: number): string | null {
  let label: string | null = null;
  for (const threshold of Object.keys(COMBO_MULTIPLIERS).map(Number).sort((a, b) => a - b)) {
    if (combo >= threshold) {
      label = COMBO_MULTIPLIERS[threshold];
    }
  }
  return label;
}

export function GameControls({
  score, highScore, timeLeft, totalTime, combo, status,
  onStart, onTogglePause, onRestart,
}: GameControlsProps) {
  const timePercent = (timeLeft / totalTime) * 100;
  const comboLabel = getComboLabel(combo);

  return (
    <div className="w-full max-w-lg mx-auto mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="bg-amber-800/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-amber-700/30">
          <span className="text-amber-300 text-xs uppercase tracking-wider">得分</span>
          <div className="text-white text-2xl font-bold tabular-nums">{score}</div>
        </div>
        <div className="bg-amber-800/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-amber-700/30">
          <span className="text-amber-300 text-xs uppercase tracking-wider">最高分</span>
          <div className="text-yellow-400 text-2xl font-bold tabular-nums">{highScore}</div>
        </div>
        <div
          className={`
            px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300
            ${combo >= COMBO_THRESHOLD
              ? 'bg-orange-600/50 border-orange-400/50 scale-110 shadow-lg shadow-orange-500/30'
              : 'bg-amber-800/40 border-amber-700/30'}
          `}
        >
          <span className="text-amber-300 text-xs uppercase tracking-wider">连击</span>
          <div className={`text-2xl font-bold tabular-nums ${combo >= COMBO_THRESHOLD ? 'text-orange-300 animate-pulse' : 'text-white'}`}>
            {combo > 0 ? combo : '-'}
          </div>
          {comboLabel && <div className="text-orange-400 text-xs font-bold -mt-1">{comboLabel}</div>}
        </div>
      </div>

      <div className="px-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-amber-300 text-xs">剩余时间</span>
          <span className={`text-sm font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full h-3 bg-amber-950/60 rounded-full overflow-hidden border border-amber-700/30">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timeLeft <= 10
                ? 'bg-gradient-to-r from-red-600 to-red-400'
                : timeLeft <= 20
                ? 'bg-gradient-to-r from-amber-600 to-yellow-400'
                : 'bg-gradient-to-r from-green-600 to-emerald-400'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {status === 'idle' && (
          <button onClick={onStart} className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 transition-all hover:scale-105 active:scale-95">
            开始游戏
          </button>
        )}
        {status === 'playing' && (
          <button onClick={onTogglePause} className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-white rounded-xl font-medium shadow-md transition-all hover:scale-105 active:scale-95">
            暂停
          </button>
        )}
        {status === 'paused' && (
          <>
            <button onClick={onTogglePause} className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl font-medium shadow-md transition-all hover:scale-105 active:scale-95">
              继续
            </button>
            <button onClick={onRestart} className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-xl font-medium shadow-md transition-all hover:scale-105 active:scale-95">
              重新开始
            </button>
          </>
        )}
        {status === 'over' && (
          <button onClick={onRestart} className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 transition-all hover:scale-105 active:scale-95">
            再来一局
          </button>
        )}
      </div>
    </div>
  );
}
