'use client';

import { LEVELS } from '../constants/levels';

interface LevelSelectProps {
  bestStepsMap: Record<string, number | null>;
  onSelectLevel: (levelId: string) => void;
}

export function LevelSelect({ bestStepsMap, onSelectLevel }: LevelSelectProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">华容道</h2>
        <p className="text-white/60 text-sm">
          滑动方块，帮助曹操从重重包围中突围而出
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {LEVELS.map((level, index) => {
          const best = bestStepsMap[level.id];
          const cleared = best !== null && best !== undefined;
          return (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              className="relative px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20
                         backdrop-blur-sm border border-white/10 hover:border-white/20
                         transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-lg">
                    {index + 1}. {level.name}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    参考步数: {level.parSteps}
                  </div>
                </div>
                {cleared && (
                  <div className="text-yellow-400 text-sm font-mono">
                    {best}步 ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
