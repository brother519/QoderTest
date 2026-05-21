'use client';

/**
 * 单个宝石单元格组件
 *
 * @module app/match-three/components/GemCell
 */

import type { Gem } from '../types/game';

interface GemCellProps {
  gem: Gem | null;
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function GemCell({ gem, isSelected, isMatched, onClick }: GemCellProps) {
  // 空位占位
  if (!gem) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-transparent" />
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2
        flex items-center justify-center
        text-2xl sm:text-3xl
        transition-all duration-200 cursor-pointer
        select-none
        ${isMatched
          ? 'animate-pulse bg-yellow-400/60 border-yellow-400 scale-110'
          : isSelected
            ? 'border-blue-400 scale-110 shadow-lg shadow-blue-400/50 bg-white/20'
            : 'border-white/20 bg-white/10 hover:bg-white/25 hover:border-white/40'
        }
      `}
      aria-label={`宝石 ${gem.type} 位置 ${gem.row},${gem.col}`}
    >
      {gem.type}
    </button>
  );
}
