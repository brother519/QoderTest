/**
 * 游戏中心共享工具函数
 *
 * @module lib/utils/format
 */

/** 将秒数格式化为 MM:SS 格式，负数输入会被处理为 0 */
export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
