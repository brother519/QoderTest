'use client';

/**
 * 关卡选择器组件
 *
 * 在游戏开始前显示关卡选择界面，允许玩家选择不同难度等级。
 * 每个关卡显示图标、名称、描述和棋盘尺寸信息。
 *
 * @module link-match/components/LevelSelector
 */

import { LevelConfig, GameLevel } from '../types/game';

interface LevelSelectorProps {
  levels: Record<GameLevel, LevelConfig>;
  currentLevel: GameLevel;
  onSelectLevel: (level: GameLevel) => void;
  onStart: () => void;
}

/**
 * 关卡选择器组件
 *
 * @param {LevelSelectorProps} props - 组件属性
 * @returns {JSX.Element} 关卡选择界面
 */
export function LevelSelector({
  levels,
  currentLevel,
  onSelectLevel,
  onStart,
}: LevelSelectorProps) {
  const levelEntries = Object.entries(levels) as [GameLevel, LevelConfig][];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
        选择关卡
      </h2>
      <p className="text-gray-600 text-center mb-6">
        选择适合你的难度开始游戏
      </p>

      <div className="space-y-3 mb-8">
        {levelEntries.map(([key, level]) => (
          <button
            key={key}
            onClick={() => onSelectLevel(key)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
              ${
                currentLevel === key
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-4xl">{level.icon}</span>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-800">{level.name}</h3>
              <p className="text-sm text-gray-600">{level.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                棋盘: {level.config.rows}×{level.config.cols}
              </p>
            </div>
            {currentLevel === key && (
              <span className="text-purple-500 text-xl">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        className="
          w-full py-4 px-6 rounded-xl font-bold text-lg
          bg-gradient-to-r from-purple-500 to-pink-500
          text-white shadow-lg
          hover:from-purple-600 hover:to-pink-600
          active:scale-95 transition-all duration-200
        "
      >
        开始游戏
      </button>
    </div>
  );
}
