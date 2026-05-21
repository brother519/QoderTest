'use client';

/**
 * 游戏控制面板组件
 *
 * @module app/match-three/components/GameControls
 */

import type { GameStatus } from '../types/game';

interface GameControlsProps {
  score: number;
  targetScore: number;
  movesLeft: number;
  status: GameStatus;
  onRestart: () => void;
  onPause: () => void;
}

export function GameControls({
  score,
  targetScore,
  movesLeft,
  status,
  onRestart,
  onPause,
}: GameControlsProps) {
  const progress = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl min-w-[200px]">
      {/* 标题 */}
      <h2 className="text-lg font-bold text-white/90 text-center">游戏信息</h2>

      {/* 分数 / 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">分数</span>
          <span className="text-pink-300 font-bold">
            {score} / {targetScore}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 剩余步数 */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/70">剩余步数</span>
        <span
          className={`font-bold text-lg ${
            movesLeft <= 5 ? 'text-red-400' : 'text-cyan-300'
          }`}
        >
          {movesLeft}
        </span>
      </div>

      {/* 游戏状态 */}
      <div className="text-center">
        <span
          className={`
            inline-block px-3 py-1 rounded-full text-xs font-medium
            ${status === 'playing'
              ? 'bg-green-500/20 text-green-300'
              : status === 'paused'
                ? 'bg-yellow-500/20 text-yellow-300'
                : status === 'won'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : status === 'over'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-white/10 text-white/50'
            }
          `}
        >
          {status === 'idle'
            ? '等待开始'
            : status === 'playing'
              ? '进行中'
              : status === 'paused'
                ? '已暂停'
                : status === 'won'
                  ? '胜利！'
                  : '游戏结束'}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-2 mt-2">
        {status === 'playing' && (
          <button
            onClick={onPause}
            className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-medium transition-all duration-200 border border-yellow-500/30"
          >
            暂停
          </button>
        )}
        {status === 'paused' && (
          <button
            onClick={onPause}
            className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all duration-200 border border-green-500/30"
          >
            继续
          </button>
        )}
        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-all duration-200 border border-white/20"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
