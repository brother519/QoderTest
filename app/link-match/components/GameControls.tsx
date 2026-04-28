'use client';

/**
 * 游戏控制面板组件
 *
 * 展示游戏的实时状态信息（分数、时间、连击、状态标签），
 * 并提供游戏操作按钮（重新开始、提示、暂停/继续）。
 *
 * 布局采用 Flexbox 自适应排列，支持窄屏自动换行。
 *
 * @module link-match/components/GameControls
 */

import { GameStatus } from '../types/game';
import { formatTime } from '../utils/helpers';

/**
 * 游戏状态配置映射
 *
 * 将 GameStatus 映射到对应的显示标签和样式类名，
 * 替代多个 if 条件渲染，使代码更简洁可维护。
 */
const STATUS_CONFIG: Record<GameStatus, { label: string; className: string }> = {
  idle: { label: '准备就绪', className: 'bg-gray-100 text-gray-600' },
  playing: { label: '游戏中', className: 'bg-green-100 text-green-600' },
  paused: { label: '已暂停', className: 'bg-yellow-100 text-yellow-600' },
  won: { label: '胜利！', className: 'bg-purple-100 text-purple-600' },
};

/**
 * GameControls 组件的 Props 类型
 *
 * @property {number} score - 当前游戏得分
 * @property {number} timeElapsed - 已用时间（秒）
 * @property {GameStatus} status - 当前游戏状态
 * @property {number} combo - 当前连击次数
 * @property {number} hintsRemaining - 剩余提示次数
 * @property {() => void} onReset - 重新开始按钮回调
 * @property {() => void} onHint - 提示按钮回调
 * @property {() => void} onPause - 暂停按钮回调
 * @property {() => void} onResume - 继续按钮回调
 */
interface GameControlsProps {
  score: number;
  timeElapsed: number;
  status: GameStatus;
  combo: number;
  hintsRemaining: number;
  onReset: () => void;
  onHint: () => void;
  onPause: () => void;
  onResume: () => void;
}

/**
 * 游戏控制面板组件
 *
 * 分为两行显示：
 * 1. **状态信息行**：分数、计时器、连击数（仅连击时显示）、游戏状态标签
 * 2. **控制按钮行**：重新开始、提示（显示剩余次数，用完禁用）、暂停/继续（根据状态切换）
 *
 * @param {GameControlsProps} props - 组件属性
 * @returns {JSX.Element} 控制面板区域
 */
export function GameControls({
  score,
  timeElapsed,
  status,
  combo,
  hintsRemaining,
  onReset,
  onHint,
  onPause,
  onResume,
}: GameControlsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg w-full max-w-2xl">
      {/* 状态信息行：分数、时间、连击、状态标签 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* 分数显示区 */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">分数</p>
            <p className="text-2xl font-bold text-gray-800">{score}</p>
          </div>
        </div>

        {/* 计时器显示区 */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">时间</p>
            <p className="text-2xl font-bold text-gray-800 font-mono">
              {formatTime(timeElapsed)}
            </p>
          </div>
        </div>

        {/* 连击数显示区（仅在有连击时显示，带脉冲动画） */}
        {combo > 0 && (
          <div className="flex items-center gap-2 animate-pulse">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs text-orange-500 uppercase tracking-wide">连击</p>
              <p className="text-2xl font-bold text-orange-600">x{combo}</p>
            </div>
          </div>
        )}

        {/* 游戏状态标签：根据当前状态显示对应的彩色标签 */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[status].className}`}
          >
            {STATUS_CONFIG[status].label}
          </span>
        </div>
      </div>

      {/* 控制按钮行 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* 重新开始按钮：始终可用 */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow"
        >
          <span>🔄</span>
          <span>重新开始</span>
        </button>

        {/* 提示按钮：显示剩余次数，用完或非游戏中状态时禁用 */}
        <button
          onClick={onHint}
          disabled={hintsRemaining <= 0 || status !== 'playing'}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm
            ${
              hintsRemaining > 0 && status === 'playing'
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 hover:shadow'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span>💡</span>
          <span>提示 ({hintsRemaining})</span>
        </button>

        {/* 暂停/继续按钮：根据游戏状态动态切换 */}
        {status === 'playing' ? (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow"
          >
            <span>⏸️</span>
            <span>暂停</span>
          </button>
        ) : status === 'paused' ? (
          <button
            onClick={onResume}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow"
          >
            <span>▶️</span>
            <span>继续</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
