/**
 * 单个地鼠洞组件
 *
 * @module whack-a-mole/components/MoleHole
 */

'use client';

import { HoleData, MoleType } from '../types/game';

interface MoleHoleProps {
  hole: HoleData;
  row: number;
  col: number;
  disabled: boolean;
  onWhack: (row: number, col: number) => void;
}

const MOLE_FACES: Record<MoleType, { emoji: string; label: string }> = {
  normal: { emoji: '🐹', label: '地鼠' },
  golden: { emoji: '🌟', label: '金色地鼠' },
  bomb: { emoji: '💣', label: '炸弹' },
};

export function MoleHole({ hole, row, col, disabled, onWhack }: MoleHoleProps) {
  const { state, moleType, key } = hole;
  const face = MOLE_FACES[moleType];
  const isActive = state === 'rising' || state === 'up';
  const isHit = state === 'hit';

  return (
    <button
      key={key}
      className={`
        relative w-24 h-28 rounded-2xl overflow-hidden
        transition-transform duration-75
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-90'}
        focus:outline-none focus:ring-2 focus:ring-amber-400/50
      `}
      onClick={() => !disabled && onWhack(row, col)}
      disabled={disabled}
      aria-label={`${face.label} 在第${row + 1}行第${col + 1}列`}
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 via-amber-900/80 to-amber-950 rounded-2xl" />

      {/* 洞口 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/60 rounded-[50%] z-10" />

      {/* 地鼠 */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 z-20
          transition-all ease-out
          ${state === 'empty' ? 'translate-y-full opacity-0' : ''}
          ${state === 'rising' ? '-translate-y-2 opacity-100' : ''}
          ${state === 'up' ? '-translate-y-2 opacity-100' : ''}
          ${state === 'falling' ? 'translate-y-2 opacity-70' : ''}
          ${state === 'hit' ? '-translate-y-4 opacity-100 scale-125' : ''}
        `}
        style={{
          transitionDuration: state === 'rising' ? '200ms' : state === 'falling' ? '200ms' : state === 'hit' ? '150ms' : '200ms',
        }}
      >
        <div
          className={`
            text-4xl leading-none select-none
            ${isActive && moleType === 'normal' ? 'animate-bounce' : ''}
            ${isActive && moleType === 'golden' ? 'animate-bounce' : ''}
            ${isActive && moleType === 'bomb' ? 'animate-pulse' : ''}
            ${isHit ? 'animate-ping' : ''}
          `}
        >
          {face.emoji}
        </div>

        {isActive && moleType === 'golden' && (
          <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-ping" />
        )}
        {isActive && moleType === 'bomb' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </div>

      {/* 击中效果 */}
      {isHit && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <span className="text-2xl animate-ping">💥</span>
        </div>
      )}

      {/* 洞口前沿 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-950 to-amber-900/90 rounded-b-2xl z-25" />

      {/* 草丛 */}
      <div className="absolute bottom-6 left-1 text-green-700/60 text-xs select-none">🌿</div>
      <div className="absolute bottom-6 right-1 text-green-700/60 text-xs select-none">🌿</div>
    </button>
  );
}
