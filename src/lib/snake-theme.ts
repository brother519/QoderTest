/** Canvas 绘图主题常量模块 - 集中管理所有颜色、尺寸和字体配置 */

/** Canvas 绘图颜色配置 */
export const COLORS = {
  /** 画布背景色 */
  background: '#1a1a2e',
  /** 网格线颜色 */
  gridLine: 'rgba(255, 255, 255, 0.03)',

  /** 食物本体颜色 */
  foodBody: '#ef4444',
  /** 食物边框颜色 */
  foodBorder: '#fca5a5',
  /** 食物光晕渐变起始色 */
  foodGlowStart: 'rgba(239, 68, 68, 0.3)',
  /** 食物光晕渐变结束色 */
  foodGlowEnd: 'rgba(239, 68, 68, 0)',

  /** 蛇头填充色 */
  snakeHead: '#4ade80',
  /** 蛇头边框色 */
  snakeHeadBorder: '#86efac',
  /** 蛇头光晕渐变起始色 */
  snakeHeadGlowStart: 'rgba(74, 222, 128, 0.2)',
  /** 蛇头光晕渐变结束色 */
  snakeHeadGlowEnd: 'rgba(74, 222, 128, 0)',
  /** 蛇眼颜色 */
  snakeEye: '#1a1a2e',

  /** 遮罩背景色 */
  overlayBg: 'rgba(0, 0, 0, 0.5)',
  /** 遮罩主文字颜色 */
  overlayText: '#e2e8f0',
  /** 遮罩副文字颜色 */
  overlaySubText: '#94a3b8',
  /** 游戏结束标题颜色 */
  gameoverText: '#ef4444',
} as const

/** Canvas 绘图尺寸配置 */
export const SIZES = {
  /** 网格线宽度 */
  gridLineWidth: 0.5,
  /** 蛇身段内边距 */
  snakePadding: 1,
  /** 蛇身段圆角半径 */
  snakeRadius: 3,
  /** 蛇头边框宽度 */
  snakeHeadLineWidth: 1.5,
  /** 蛇身边框宽度 */
  snakeBodyLineWidth: 1,
  /** 食物边框宽度 */
  foodLineWidth: 1,
  /** 食物半径偏移（cellSize/2 - 此值） */
  foodRadiusOffset: 2,
  /** 蛇眼半径 */
  eyeSize: 3,
  /** 蛇眼距蛇头边缘偏移量 */
  eyeOffset: 5,
  /** 蛇身透明度渐变系数 */
  snakeBodyFadeRatio: 0.4,
  /** 蛇身边框透明度系数 */
  snakeBodyStrokeAlphaRatio: 0.5,
} as const

/** Canvas 绘图字体配置 */
export const FONTS = {
  /** 遮罩层标题字体 */
  overlayTitle: 'bold 20px "Segoe UI", system-ui, sans-serif',
  /** 遮罩层副标题字体 */
  overlaySubtitle: '14px "Segoe UI", system-ui, sans-serif',
  /** 遮罩层分数字体 */
  overlayScore: '16px "Segoe UI", system-ui, sans-serif',
} as const
