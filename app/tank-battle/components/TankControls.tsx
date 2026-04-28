'use client';

import { GameStatus } from '../types/game';

interface TankControlsProps {
  score: number;
  highScore: number;
  lives: number;
  enemiesRemaining: number;
  status: GameStatus;
  onStart: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export function TankControls({
  score,
  highScore,
  lives,
  enemiesRemaining,
  status,
  onStart,
  onTogglePause,
  onRestart,
}: TankControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
      {/* 分数 */}
      <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
        <span className="text-gray-400 mr-2">分数</span>
        <span className="text-yellow-400 font-bold text-lg">{score}</span>
      </div>

      {/* 最高分 */}
      <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
        <span className="text-gray-400 mr-2">最高</span>
        <span className="text-orange-400 font-bold text-lg">{highScore}</span>
      </div>

      {/* 生命 */}
      <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
        <span className="text-gray-400 mr-2">生命</span>
        <span className="text-green-400 font-bold text-lg">
          {'♥'.repeat(Math.max(0, lives))}
        </span>
      </div>

      {/* 剩余敌人 */}
      <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
        <span className="text-gray-400 mr-2">敌人</span>
        <span className="text-red-400 font-bold text-lg">{enemiesRemaining}</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            开始游戏
          </button>
        )}
        {(status === 'playing' || status === 'paused') && (
          <button
            onClick={onTogglePause}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {status === 'paused' ? '继续' : '暂停'}
          </button>
        )}
        {(status === 'over' || status === 'won' || status === 'paused') && (
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
