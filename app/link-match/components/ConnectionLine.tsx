'use client';

/**
 * 连接线动画组件
 *
 * 当两张卡牌匹配成功时，在棋盘上绘制 SVG 折线连接动画。
 * 将棋盘坐标（行列索引）转换为像素坐标，通过 SVG polyline 元素渲染连接路径。
 *
 * 组件使用绝对定位覆盖在棋盘上方，pointer-events-none 确保不阻断卡牌点击事件。
 *
 * @module link-match/components/ConnectionLine
 */

import { ConnectionPath } from '../types/game';

/**
 * ConnectionLine 组件的 Props 类型
 *
 * @property {ConnectionPath | null} path - 连接路径数据，null 时不渲染
 * @property {number} cardSize - 单张卡牌的像素尺寸，用于坐标转换
 * @property {number} cardGap - 卡牌之间的间距像素值，用于坐标转换
 */
interface ConnectionLineProps {
  path: ConnectionPath | null;
  cardSize: number;
  cardGap: number;
}

/**
 * 连接线动画组件
 *
 * 接收连接路径的关键点坐标，将棋盘行列索引转换为像素坐标后，
 * 使用 SVG polyline 绘制绿色连接线。路径点居中对齐到卡牌中心位置。
 *
 * @param {ConnectionLineProps} props - 组件属性
 * @returns {JSX.Element | null} SVG 连接线元素，无路径时返回 null
 */
export function ConnectionLine({ path, cardSize, cardGap }: ConnectionLineProps) {
  if (!path || path.points.length < 2) {
    return null;
  }

  /**
   * 将棋盘坐标（行、列索引）转换为像素坐标
   * 计算公式：像素位置 = (索引 - 1) * (卡牌尺寸 + 间距) + 卡牌尺寸 / 2（居中）
   *
   * 注意：棋盘包含外围边界（第 0 行/列为空），实际卡牌从第 1 行/列开始，
   * 因此需要减 1 来得到正确的像素位置。
   *
   * @param {number} row - 行索引（包含边界，从 0 开始）
   * @param {number} col - 列索引（包含边界，从 0 开始）
   * @returns {{ x: number, y: number }} 像素坐标
   */
  const toPixel = (row: number, col: number) => ({
    x: (col - 1) * (cardSize + cardGap) + cardSize / 2,
    y: (row - 1) * (cardSize + cardGap) + cardSize / 2,
  });

  // 将路径关键点转换为 SVG polyline 的 points 格式（"x1,y1 x2,y2 ..."）
  const points = path.points.map((p) => {
    const pixel = toPixel(p.row, p.col);
    return `${pixel.x},${pixel.y}`;
  });

  const polylinePoints = points.join(' ');

  return (
    <svg
      className="absolute inset-0 pointer-events-none animate-fade-out"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
    </svg>
  );
}
