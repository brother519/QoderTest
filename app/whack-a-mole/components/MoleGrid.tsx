/**
 * 地鼠游戏网格组件
 *
 * @module whack-a-mole/components/MoleGrid
 */

'use client';

import { HoleData, GameConfig, ScorePopup } from '../types/game';
import { MoleHole } from './MoleHole';

interface MoleGridProps {
  holes: HoleData[][];
  config: GameConfig;
  scorePopups: ScorePopup[];
  disabled: boolean;
  onWhack: (row: number, col: number) => void;
}

export function MoleGrid({ holes, config, scorePopups, disabled, onWhack }: MoleGridProps) {
  const { rows, cols } = config;

  return (
    <div className="relative">
      <div
        className="grid gap-3 p-5 bg-gradient-to-b from-green-950/60 via-amber-950/80 to-amber-950 rounded-3xl shadow-2xl border-4 border-amber-800/60 backdrop-blur-sm"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: cols }).map((_, colIndex) => (
            <MoleHole
              key={`${rowIndex}-${colIndex}`}
              hole={holes[rowIndex][colIndex]}
              row={rowIndex}
              col={colIndex}
              disabled={disabled}
              onWhack={onWhack}
            />
          ))
        )}
      </div>

      {scorePopups.map((popup) => (
        <div
          key={popup.id}
          className={`
            absolute z-50 pointer-events-none
            text-lg font-bold
            ${popup.score > 0 ? (popup.isGolden ? 'text-yellow-300' : 'text-green-400') : 'text-red-400'}
          `}
          style={{
            left: `${((popup.col + 0.5) / cols) * 100}%`,
            top: `${((popup.row + 0.5) / rows) * 100}%`,
            transform: 'translate(-50%, -100%)',
            animation: 'floatUp 0.8s ease-out forwards',
          }}
        >
          {popup.score > 0 ? '+' : ''}{popup.score}
        </div>
      ))}
    </div>
  );
}
