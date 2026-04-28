/**
 * 贪吃蛇游戏控制面板组件
 *
 * 展示得分和最高分，提供开始/暂停/重新开始按钮。
 *
 * @module snake/components/SnakeControls
 */

'use client';

import { GameStatus } from '../types/game';

interface SnakeControlsProps {
  score: number;
  highScore: number;
  status: GameStatus;
  onStart: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export function SnakeControls({
  score,
  highScore,
  status,
  onStart,
  onTogglePause,
  onRestart,
}: SnakeControlsProps) {
  return (
    <div className="w-full max-w-[400px]">
      {/* 分数区域 */}
      <div className="flex justify-between mb-4 text-base">
        <span className="text-gray-300">
          得分: <strong className="text-white">{score}</strong>
        </span>
        <span className="text-gray-300">
          最高分: <strong className="text-cyan-400">{highScore}</strong>
        </span>
      </div>

      {/* 按钮区域 */}
      <div className="flex gap-3 justify-center mt-4">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
          >
            开始游戏
          </button>
        )}

        {(status === 'playing' || status === 'paused') && (
          <>
            <button
              onClick={onTogglePause}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
            >
              {status === 'playing' ? '暂停' : '继续'}
            </button>
            <button
              onClick={onRestart}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
            >
              重新开始
            </button>
          </>
        )}

        {status === 'over' && (
          <button
            onClick={onRestart}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
          >
            重新开始
          </button>
        )}
      </div>
    </div>
  );
}
