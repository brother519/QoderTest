'use client';

import { AircraftGameState } from '../types/game';

interface AircraftControlsProps {
  state: AircraftGameState;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  onTogglePause: () => void;
}

// 武器类型中文映射
const BULLET_TYPE_LABELS: Record<string, string> = {
  normal: '普通',
  spread: '散射',
  laser: '激光',
};

export function AircraftControls({
  state,
  highScore,
  onStart,
  onRestart,
  onTogglePause,
}: AircraftControlsProps) {
  const { status, score, player, difficultyLevel } = state;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
      {/* 分数 */}
      <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
        <span className="text-slate-400 mr-2">分数</span>
        <span className="text-cyan-400 font-bold text-lg">{score}</span>
      </div>

      {/* 最高分 */}
      <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
        <span className="text-slate-400 mr-2">最高</span>
        <span className="text-orange-400 font-bold text-lg">{highScore}</span>
      </div>

      {/* 生命 */}
      <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
        <span className="text-slate-400 mr-2">生命</span>
        <span className="text-red-400 font-bold text-lg">
          {'♥'.repeat(Math.max(0, player.lives))}
        </span>
      </div>

      {/* 武器类型 */}
      <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
        <span className="text-slate-400 mr-2">武器</span>
        <span className="text-blue-400 font-bold">
          {BULLET_TYPE_LABELS[player.bulletType] || '普通'}
        </span>
      </div>

      {/* 难度等级 */}
      <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
        <span className="text-slate-400 mr-2">难度</span>
        <span className="text-purple-400 font-bold">Lv.{difficultyLevel}</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            开始游戏
          </button>
        )}
        {status === 'playing' && (
          <button
            onClick={onTogglePause}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            暂停
          </button>
        )}
        {status === 'paused' && (
          <button
            onClick={onTogglePause}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            继续
          </button>
        )}
        {status === 'over' && (
          <button
            onClick={onRestart}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            重新开始
          </button>
        )}
      </div>
    </div>
  );
}
