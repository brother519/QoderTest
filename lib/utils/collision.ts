/**
 * 碰撞检测工具集
 *
 * 提供跨游戏复用的几何碰撞检测函数。
 *
 * @module lib/utils/collision
 */

import type { Rect } from '../types/game';

/**
 * 两个矩形是否存在重叠（AABB 碰撞检测）
 *
 * 相切（边刚好接触）视为不重叠。支持负坐标。
 *
 * @param a - 矩形 A
 * @param b - 矩形 B
 * @returns true 表示有重叠
 */
export function rectOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
