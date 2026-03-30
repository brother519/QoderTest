/** 游戏高分持久化模块 - 负责 localStorage 的读写操作 */

const HIGH_SCORE_KEY = 'snake-game-high-score'

/**
 * 从 localStorage 加载最高分
 * @returns 保存的最高分，加载失败时返回 0
 */
export function loadHighScore(): number {
  try {
    const val = localStorage.getItem(HIGH_SCORE_KEY)
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

/**
 * 将最高分保存到 localStorage
 * @param score - 要保存的最高分
 */
export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage 不可用时静默忽略
  }
}
