/**
 * 连连看游戏画布组件
 *
 * 职责：挂载 Canvas DOM、组合自定义 Hook、驱动渲染和匹配动画。
 * 实际绘图逻辑委托给 link-match-renderer 模块。
 */

import { useEffect, useRef, useCallback } from 'react'

import { renderLinkMatch } from '@/lib/link-match-renderer'
import { useLinkMatchState, useLinkMatchDispatch } from '@/store/link-match-store'
import { useCanvasClick } from '@/hooks/useCanvasClick'

import type { LinkMatchRenderState } from '@/lib/link-match-renderer'

const MATCH_ANIMATION_DURATION = 400

export function LinkMatchCanvas() {
  const state = useLinkMatchState()
  const dispatch = useLinkMatchDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { board, selected, status, score, config, animation } = state
  const canvasWidth = config.cols * config.cellSize
  const canvasHeight = config.rows * config.cellSize

  /** 调用渲染器绘制当前帧 */
  const render = useCallback((): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderState: LinkMatchRenderState = {
      board,
      selected,
      status,
      score,
      config,
      animation,
    }
    renderLinkMatch(ctx, renderState)
  }, [board, selected, status, score, config, animation])

  // 鼠标点击：像素坐标 -> 格子坐标 -> dispatch SELECT_CELL
  useCanvasClick(canvasRef, status, config, dispatch)

  // 每次状态变化后重新渲染画面
  useEffect(() => {
    render()
  }, [render])

  // 匹配动画：路径显示一段时间后 dispatch CLEAR_MATCH
  useEffect(() => {
    if (!animation.path) return

    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_MATCH' })
    }, MATCH_ANIMATION_DURATION)

    return () => clearTimeout(timer)
  }, [animation.path, dispatch])

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border-2 border-slate-600/50 rounded-lg shadow-2xl shadow-black/50 cursor-pointer"
    />
  )
}
