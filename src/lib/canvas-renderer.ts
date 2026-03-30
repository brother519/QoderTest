/** Canvas 绘图纯函数模块 - 与 React 完全解耦，负责所有游戏画面渲染 */

import { COLORS, SIZES, FONTS } from './snake-theme'

import type { Direction, GameStatus, Point } from './game-utils'

/** renderGame 所需的状态数据 */
export interface RenderState {
  snake: Point[]
  food: Point
  direction: Direction
  status: GameStatus
  score: number
  gridSize: number
  cellSize: number
}

/**
 * 绘制画布背景和网格线
 * @param ctx - Canvas 2D 上下文
 * @param canvasSize - 画布像素尺寸
 * @param cellSize - 每格像素大小
 * @param gridSize - 网格格数
 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  cellSize: number,
  gridSize: number,
): void {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  ctx.strokeStyle = COLORS.gridLine
  ctx.lineWidth = SIZES.gridLineWidth
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize, 0)
    ctx.lineTo(i * cellSize, canvasSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * cellSize)
    ctx.lineTo(canvasSize, i * cellSize)
    ctx.stroke()
  }
}

/**
 * 绘制食物（包含光晕效果）
 * @param ctx - Canvas 2D 上下文
 * @param food - 食物坐标
 * @param cellSize - 每格像素大小
 */
function drawFood(
  ctx: CanvasRenderingContext2D,
  food: Point,
  cellSize: number,
): void {
  const centerX = food.x * cellSize + cellSize / 2
  const centerY = food.y * cellSize + cellSize / 2
  const radius = cellSize / 2 - SIZES.foodRadiusOffset

  // 光晕
  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, cellSize)
  glow.addColorStop(0, COLORS.foodGlowStart)
  glow.addColorStop(1, COLORS.foodGlowEnd)
  ctx.fillStyle = glow
  ctx.fillRect(
    food.x * cellSize - cellSize / 2,
    food.y * cellSize - cellSize / 2,
    cellSize * 2,
    cellSize * 2,
  )

  // 本体
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.foodBody
  ctx.fill()
  ctx.strokeStyle = COLORS.foodBorder
  ctx.lineWidth = SIZES.foodLineWidth
  ctx.stroke()
}

/**
 * 根据方向计算蛇眼位置
 * @param x - 蛇头左上角 x 像素坐标
 * @param y - 蛇头左上角 y 像素坐标
 * @param cellSize - 每格像素大小
 * @param direction - 蛇当前移动方向
 * @returns 两只眼睛的坐标
 */
function getEyePositions(
  x: number,
  y: number,
  cellSize: number,
  direction: Direction,
): { eye1X: number; eye1Y: number; eye2X: number; eye2Y: number } {
  const offset = SIZES.eyeOffset

  switch (direction) {
    case 'UP':
      return { eye1X: x + offset, eye1Y: y + offset, eye2X: x + cellSize - offset, eye2Y: y + offset }
    case 'DOWN':
      return { eye1X: x + offset, eye1Y: y + cellSize - offset, eye2X: x + cellSize - offset, eye2Y: y + cellSize - offset }
    case 'LEFT':
      return { eye1X: x + offset, eye1Y: y + offset, eye2X: x + offset, eye2Y: y + cellSize - offset }
    case 'RIGHT':
      return { eye1X: x + cellSize - offset, eye1Y: y + offset, eye2X: x + cellSize - offset, eye2Y: y + cellSize - offset }
  }
}

/**
 * 绘制蛇（蛇头光晕、蛇身渐变、蛇眼）
 * @param ctx - Canvas 2D 上下文
 * @param snake - 蛇身坐标数组（[0] 为蛇头）
 * @param cellSize - 每格像素大小
 * @param direction - 蛇当前移动方向
 */
function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Point[],
  cellSize: number,
  direction: Direction,
): void {
  const { snakePadding: padding, snakeRadius: radius } = SIZES

  snake.forEach((segment: Point, index: number) => {
    const x = segment.x * cellSize
    const y = segment.y * cellSize

    if (index === 0) {
      // 蛇头光晕
      const headGlow = ctx.createRadialGradient(
        x + cellSize / 2, y + cellSize / 2, 0,
        x + cellSize / 2, y + cellSize / 2, cellSize,
      )
      headGlow.addColorStop(0, COLORS.snakeHeadGlowStart)
      headGlow.addColorStop(1, COLORS.snakeHeadGlowEnd)
      ctx.fillStyle = headGlow
      ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize * 2, cellSize * 2)

      // 蛇头本体
      ctx.fillStyle = COLORS.snakeHead
      ctx.strokeStyle = COLORS.snakeHeadBorder
      ctx.lineWidth = SIZES.snakeHeadLineWidth
    } else {
      // 蛇身渐变
      const alpha = 1 - (index / snake.length) * SIZES.snakeBodyFadeRatio
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`
      ctx.strokeStyle = `rgba(74, 222, 128, ${alpha * SIZES.snakeBodyStrokeAlphaRatio})`
      ctx.lineWidth = SIZES.snakeBodyLineWidth
    }

    // 圆角矩形
    ctx.beginPath()
    ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius)
    ctx.fill()
    ctx.stroke()

    // 蛇眼
    if (index === 0) {
      ctx.fillStyle = COLORS.snakeEye
      const { eye1X, eye1Y, eye2X, eye2Y } = getEyePositions(x, y, cellSize, direction)

      ctx.beginPath()
      ctx.arc(eye1X, eye1Y, SIZES.eyeSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(eye2X, eye2Y, SIZES.eyeSize, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/**
 * 绘制状态遮罩（idle/paused/gameover）
 * @param ctx - Canvas 2D 上下文
 * @param status - 当前游戏状态
 * @param score - 当前得分
 * @param canvasSize - 画布像素尺寸
 */
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  status: GameStatus,
  score: number,
  canvasSize: number,
): void {
  if (status !== 'idle' && status !== 'gameover' && status !== 'paused') return

  ctx.fillStyle = COLORS.overlayBg
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  ctx.textAlign = 'center'
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  if (status === 'idle') {
    ctx.fillStyle = COLORS.overlayText
    ctx.font = FONTS.overlayTitle
    ctx.fillText('按 空格键 开始', centerX, centerY)
  } else if (status === 'paused') {
    ctx.fillStyle = COLORS.overlayText
    ctx.font = FONTS.overlayTitle
    ctx.fillText('已暂停', centerX, centerY - 10)
    ctx.font = FONTS.overlaySubtitle
    ctx.fillStyle = COLORS.overlaySubText
    ctx.fillText('按 空格键 继续', centerX, centerY + 16)
  } else {
    ctx.fillStyle = COLORS.gameoverText
    ctx.font = FONTS.overlayTitle
    ctx.fillText('游戏结束', centerX, centerY - 15)
    ctx.font = FONTS.overlayScore
    ctx.fillStyle = COLORS.overlayText
    ctx.fillText(`得分: ${score}`, centerX, centerY + 12)
    ctx.font = FONTS.overlaySubtitle
    ctx.fillStyle = COLORS.overlaySubText
    ctx.fillText('按 空格键 重新开始', centerX, centerY + 36)
  }
}

/**
 * 游戏画面渲染主入口 - 按顺序绘制背景、食物、蛇、遮罩
 * @param ctx - Canvas 2D 上下文
 * @param state - 渲染所需的游戏状态数据
 */
export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
): void {
  const canvasSize = state.gridSize * state.cellSize

  drawBackground(ctx, canvasSize, state.cellSize, state.gridSize)
  drawFood(ctx, state.food, state.cellSize)
  drawSnake(ctx, state.snake, state.cellSize, state.direction)
  drawOverlay(ctx, state.status, state.score, canvasSize)
}
