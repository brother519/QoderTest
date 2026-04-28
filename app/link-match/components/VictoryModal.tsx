/**
 * 胜利弹窗组件
 *
 * 当所有卡牌消除后全屏显示，展示最终得分和用时，
 * 并提供"再玩一次"按钮。使用毛玻璃遮罩背景。
 *
 * @module link-match/components/VictoryModal
 */

'use client';

import { formatTime } from '../utils/helpers';

/**
 * @property score - 最终游戏得分
 * @property timeElapsed - 游戏用时（秒）
 * @property onReset - "再玩一次"按钮回调
 */
interface VictoryModalProps {
  score: number;
  timeElapsed: number;
  onReset: () => void;
}

export function VictoryModal({ score, timeElapsed, onReset }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">恭喜通关！</h2>
        <p className="text-gray-600 mb-6">你成功消除了所有卡牌！</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">最终得分</p>
            <p className="text-3xl font-bold text-blue-700">{score}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">用时</p>
            <p className="text-3xl font-bold text-green-700">
              {formatTime(timeElapsed)}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🔄 再玩一次
        </button>
      </div>
    </div>
  );
}
