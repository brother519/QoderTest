/**
 * 连连看游戏持久化模块
 *
 * 使用 localStorage 管理最高分记录。
 */

const HIGH_SCORE_KEY = 'link-match-high-score'

/** 从 localStorage 读取最高分，失败返回 0 */
export function loadLinkMatchHighScore(): number {
  try {
    const val = localStorage.getItem(HIGH_SCORE_KEY)
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

/** 将最高分写入 localStorage */
export function saveLinkMatchHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // 静默忽略写入失败
  }
}
