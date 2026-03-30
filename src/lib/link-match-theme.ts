/**
 * 连连看游戏 Canvas 主题常量
 *
 * 集中管理所有绘制相关的颜色、尺寸和字体配置，
 * 消除 Canvas 渲染代码中的硬编码魔法值。
 */

/** Canvas 绘制颜色 */
export const LM_COLORS = {
  background: '#1a1a2e',
  gridLine: 'rgba(255, 255, 255, 0.04)',
  tileBackground: '#252540',
  tileBorder: 'rgba(255, 255, 255, 0.1)',
  selectedBorder: '#22d3ee',
  selectedGlow: 'rgba(34, 211, 238, 0.3)',
  matchPath: '#4ade80',
  invalidFlash: '#ef4444',
  overlayBg: 'rgba(0, 0, 0, 0.5)',
  overlayText: '#e2e8f0',
  overlaySubText: '#94a3b8',
  winText: '#4ade80',
  nomovesText: '#ef4444',
} as const

/** Canvas 绘制尺寸 */
export const LM_SIZES = {
  tilePadding: 4,
  tileRadius: 8,
  tileBorderWidth: 1,
  selectedBorderWidth: 3,
  pathLineWidth: 3,
  emojiSizeRatio: 0.55,
} as const

/** Canvas 绘制字体 */
export const LM_FONTS = {
  overlayTitle: 'bold 24px "Segoe UI", system-ui, sans-serif',
  overlaySubtitle: '14px "Segoe UI", system-ui, sans-serif',
  overlayScore: '18px "Segoe UI", system-ui, sans-serif',
} as const
