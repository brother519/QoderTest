'use client';

/**
 * 关卡选择组件
 *
 * @module app/match-three/components/LevelSelector
 */

import type { GameLevel } from '../types/game';
import { LEVELS } from '../constants/config';

interface LevelSelectorProps {
  onSelectLevel: (level: GameLevel) => void;
}

const LEVEL_STYLES: Record<GameLevel, { border: string; glow: string; bg: string }> = {
  easy: {
    border: 'border-green-400/40',
    glow: 'hover:shadow-green-400/20',
    bg: 'from-green-500/10 to-emerald-500/10',
  },
  medium: {
    border: 'border-yellow-400/40',
    glow: 'hover:shadow-yellow-400/20',
    bg: 'from-yellow-500/10 to-amber-500/10',
  },
  hard: {
    border: 'border-red-400/40',
    glow: 'hover:shadow-red-400/20',
    bg: 'from-red-500/10 to-orange-500/10',
  },
};

export function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  const levels: GameLevel[] = ['easy', 'medium', 'hard'];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">💎 消消乐</h2>
        <p className="text-white/60 text-sm">选择难度开始游戏</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {levels.map((levelKey) => {
          const config = LEVELS[levelKey];
          const style = LEVEL_STYLES[levelKey];

          return (
            <button
              key={levelKey}
              onClick={() => onSelectLevel(levelKey)}
              className={`
                group p-6 rounded-2xl
                border-2 ${style.border}
                bg-gradient-to-br ${style.bg}
                backdrop-blur-md
                hover:scale-105 hover:border-opacity-80
                ${style.glow} hover:shadow-lg
                transition-all duration-300
                cursor-pointer text-left
                min-w-[220px]
              `}
            >
              {/* 图标和名称 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{config.icon}</span>
                <span className="text-xl font-bold text-white/90">
                  {config.name}
                </span>
              </div>

              {/* 描述 */}
              <p className="text-white/50 text-sm mb-4">{config.description}</p>

              {/* 详情 */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>目标分数</span>
                  <span className="text-pink-300 font-medium">
                    {config.targetScore}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>可用步数</span>
                  <span className="text-cyan-300 font-medium">
                    {config.moves} 步
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>棋盘大小</span>
                  <span className="text-purple-300 font-medium">
                    {config.rows}×{config.cols}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>宝石种类</span>
                  <span className="text-amber-300 font-medium">
                    {config.gemTypes.length} 种
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
