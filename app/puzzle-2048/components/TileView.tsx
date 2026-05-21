'use client';

/**
 * 单个数字方块组件
 *
 * 双层结构：
 * - 外层负责"位置过渡动画"（基于 row/col 计算 translate，保持 transition）
 * - 内层负责"出现/合并的关键帧动画"（scale 缩放，避免覆盖外层 transform）
 *
 * @module puzzle-2048/components/TileView
 */

import { Tile } from '../types/game';
import { TILE_STYLES, TILE_STYLE_FALLBACK, TILE_FONT_SIZE } from '../constants/config';

interface TileViewProps {
  tile: Tile;
  /** 单格像素尺寸 */
  cellSize: number;
  /** 格子之间的间隙像素 */
  gap: number;
  /** 滑动动画时长（ms） */
  moveDuration: number;
}

/**
 * 计算指定数值方块的字体大小 class
 *
 * 数字位数越多字号越小，避免在小格子内溢出。
 */
function getFontSizeClass(value: number): string {
  const digits = String(value).length;
  return TILE_FONT_SIZE[digits] ?? 'text-base';
}

export function TileView({ tile, cellSize, gap, moveDuration }: TileViewProps) {
  const colorClass = TILE_STYLES[tile.value] ?? TILE_STYLE_FALLBACK;
  const fontClass = getFontSizeClass(tile.value);

  // 通过外层 transform 实现位置过渡（保持稳定 React key 即可让 React 复用 DOM）
  const x = tile.col * (cellSize + gap);
  const y = tile.row * (cellSize + gap);

  // 内层动画：新方块缩放出现、合并方块"砰"一下
  const animationName = tile.isNew
    ? 'tile2048-pop-in'
    : tile.isMerged
      ? 'tile2048-merge'
      : undefined;

  return (
    <div
      className="absolute"
      style={{
        width: cellSize,
        height: cellSize,
        transform: `translate(${x}px, ${y}px)`,
        transition: `transform ${moveDuration}ms ease-in-out`,
      }}
    >
      <div
        className={`w-full h-full flex items-center justify-center rounded-md font-bold shadow-md select-none ${colorClass} ${fontClass}`}
        style={{
          animation: animationName ? `${animationName} 180ms ease-out` : undefined,
        }}
      >
        {tile.value}
      </div>
    </div>
  );
}
