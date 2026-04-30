/**
 * 地鼠游戏网格组件
 *
 * @module whack-a-mole/components/MoleGrid
 */

'use client';

import { HoleData, GameConfig, ScorePopup } from '../types/game';
import { MoleHole } from './MoleHole';

/** MoleGrid 组件属性 */
interface MoleGridProps {
  /** 地鼠洞二维数组数据 */
  holes: HoleData[][];
  /** 游戏配置（用于获取行列数） */
  config: GameConfig;
  /** 当前活跃的分数弹出动画列表 */
  scorePopups: ScorePopup[];
  /** 是否禁用所有洞的点击 */
  disabled: boolean;
  /** 点击洞时的回调 */
  onWhack: (row: number, col: number) => void;
}

/**
 * 地鼠游戏网格组件
 *
 * 渲染 rows x cols 的地鼠洞网格，并在对应位置叠加分数弹出动画。
 * 网格使用 CSS Grid 布局，列数根据配置动态设置。
 * 分数弹出动画使用绝对定位，根据洞的行列位置计算百分比坐标。
 *
 * @param props - 组件属性
 */
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
