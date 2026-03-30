/**
 * 连连看游戏 Canvas 渲染模块
 *
 * 纯渲染函数，完全与 React 解耦。
 * 负责棋盘、emoji、选中高亮、路径动画和状态覆盖层的绘制。
 */

import { LM_COLORS, LM_SIZES, LM_FONTS } from './link-match-theme'
import type {
  Board,
  CellCoord,
  LinkMatchConfig,
  LinkMatchStatus,
  AnimationState,
} from './link-match-utils'

// ─── 渲染状态接口 ────────────────────────────────────────

/** 传入渲染器的完整状态快照 */
export interface LinkMatchRenderState {
  board: Board
  selected: CellCoord | null
  status: LinkMatchStatus
  score: number
  config: LinkMatchConfig
  animation: AnimationState
}

// ─── 内部绘制函数 ────────────────────────────────────────

/** 绘制深色背景 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = LM_COLORS.background
  ctx.fillRect(0, 0, width, height)
}

/** 绘制格线 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: LinkMatchConfig,
): void {
  const { rows, cols, cellSize } = config
  ctx.strokeStyle = LM_COLORS.gridLine
  ctx.lineWidth = 0.5

  for (let r = 0; r <= rows; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * cellSize)
    ctx.lineTo(cols * cellSize, r * cellSize)
    ctx.stroke()
  }
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath()
    ctx.moveTo(c * cellSize, 0)
    ctx.lineTo(c * cellSize, rows * cellSize)
    ctx.stroke()
  }
}

/** 绘制圆角矩形路径 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** 绘制所有非空方块及其 emoji */
function drawTiles(
  ctx: CanvasRenderingContext2D,
  board: Board,
  config: LinkMatchConfig,
): void {
  const { cellSize } = config
  const { tilePadding, tileRadius, tileBorderWidth, emojiSizeRatio } = LM_SIZES

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c]
      if (cell.isEmpty) continue

      // 动画中正在消除的格子保持显示
      const x = c * cellSize + tilePadding
      const y = r * cellSize + tilePadding
      const size = cellSize - tilePadding * 2

      // 方块背景
      roundRect(ctx, x, y, size, size, tileRadius)
      ctx.fillStyle = LM_COLORS.tileBackground
      ctx.fill()
      ctx.strokeStyle = LM_COLORS.tileBorder
      ctx.lineWidth = tileBorderWidth
      ctx.stroke()

      // Emoji
      const fontSize = Math.floor(cellSize * emojiSizeRatio)
      ctx.font = `${fontSize}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(cell.emoji, c * cellSize + cellSize / 2, r * cellSize + cellSize / 2)
    }
  }
}

/** 绘制选中格的高亮边框 */
function drawSelectedHighlight(
  ctx: CanvasRenderingContext2D,
  selected: CellCoord | null,
  config: LinkMatchConfig,
): void {
  if (!selected) return

  const { cellSize } = config
  const { tilePadding, tileRadius, selectedBorderWidth } = LM_SIZES

  const x = selected.col * cellSize + tilePadding
  const y = selected.row * cellSize + tilePadding
  const size = cellSize - tilePadding * 2

  ctx.save()
  ctx.shadowColor = LM_COLORS.selectedGlow
  ctx.shadowBlur = 10
  roundRect(ctx, x, y, size, size, tileRadius)
  ctx.strokeStyle = LM_COLORS.selectedBorder
  ctx.lineWidth = selectedBorderWidth
  ctx.stroke()
  ctx.restore()
}

/** 绘制匹配连接路径动画 */
function drawMatchPath(
  ctx: CanvasRenderingContext2D,
  animation: AnimationState,
  config: LinkMatchConfig,
): void {
  if (!animation.path) return

  const { cellSize } = config
  const { pathLineWidth } = LM_SIZES
  const points = animation.path.points

  ctx.save()
  ctx.strokeStyle = LM_COLORS.matchPath
  ctx.lineWidth = pathLineWidth
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.8

  ctx.beginPath()
  const first = points[0]
  ctx.moveTo(first.col * cellSize + cellSize / 2, first.row * cellSize + cellSize / 2)
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    ctx.lineTo(p.col * cellSize + cellSize / 2, p.row * cellSize + cellSize / 2)
  }
  ctx.stroke()
  ctx.restore()
}

/** 绘制状态覆盖层（idle / win / nomoves） */
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  status: LinkMatchStatus,
  score: number,
  width: number,
  height: number,
): void {
  if (status === 'playing') return

  ctx.fillStyle = LM_COLORS.overlayBg
  ctx.fillRect(0, 0, width, height)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cx = width / 2
  const cy = height / 2

  if (status === 'idle') {
    ctx.font = LM_FONTS.overlayTitle
    ctx.fillStyle = LM_COLORS.overlayText
    ctx.fillText('连连看', cx, cy - 20)
    ctx.font = LM_FONTS.overlaySubtitle
    ctx.fillStyle = LM_COLORS.overlaySubText
    ctx.fillText('点击「开始游戏」按钮开始', cx, cy + 15)
  } else if (status === 'win') {
    ctx.font = LM_FONTS.overlayTitle
    ctx.fillStyle = LM_COLORS.winText
    ctx.fillText('恭喜通关！', cx, cy - 30)
    ctx.font = LM_FONTS.overlayScore
    ctx.fillStyle = LM_COLORS.overlayText
    ctx.fillText(`得分：${score}`, cx, cy + 10)
    ctx.font = LM_FONTS.overlaySubtitle
    ctx.fillStyle = LM_COLORS.overlaySubText
    ctx.fillText('点击「重新开始」继续挑战', cx, cy + 40)
  } else if (status === 'nomoves') {
    ctx.font = LM_FONTS.overlayTitle
    ctx.fillStyle = LM_COLORS.nomovesText
    ctx.fillText('无法继续', cx, cy - 30)
    ctx.font = LM_FONTS.overlayScore
    ctx.fillStyle = LM_COLORS.overlayText
    ctx.fillText(`得分：${score}`, cx, cy + 10)
    ctx.font = LM_FONTS.overlaySubtitle
    ctx.fillStyle = LM_COLORS.overlaySubText
    ctx.fillText('没有可消除的配对了', cx, cy + 40)
  }
}

// ─── 渲染主入口 ──────────────────────────────────────────

/** 渲染连连看游戏完整画面 */
export function renderLinkMatch(
  ctx: CanvasRenderingContext2D,
  state: LinkMatchRenderState,
): void {
  const { board, selected, status, score, config, animation } = state
  const width = config.cols * config.cellSize
  const height = config.rows * config.cellSize

  drawBackground(ctx, width, height)
  drawGrid(ctx, config)

  if (board.length > 0) {
    drawTiles(ctx, board, config)
    drawSelectedHighlight(ctx, selected, config)
    drawMatchPath(ctx, animation, config)
  }

  drawOverlay(ctx, status, score, width, height)
}
