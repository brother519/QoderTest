/** 游戏画布组件 - 挂载 Canvas 元素并组合游戏循环、键盘、渲染逻辑 */

import { useEffect, useRef, useCallback } from 'react'

import { renderGame } from '@/lib/canvas-renderer'
import { useGameState, useGameDispatch } from '@/store'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'

import type { RenderState } from '@/lib/canvas-renderer'

/**
 * 贪吃蛇游戏画布组件
 *
 * 职责：挂载 Canvas DOM、组合自定义 Hook、驱动渲染。
 * 实际绘图逻辑委托给 canvas-renderer 模块。
 */
export function SnakeGameComponent() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { config, snake, food, status, speed, score, direction } = state
  const canvasSize = config.gridSize * config.cellSize

  /** 调用渲染器绘制当前帧 */
  const render = useCallback((): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderState: RenderState = {
      snake,
      food,
      direction,
      status,
      score,
      gridSize: config.gridSize,
      cellSize: config.cellSize,
    }
    renderGame(ctx, renderState)
  }, [snake, food, direction, status, score, config.gridSize, config.cellSize])

  // 游戏循环：playing 状态下按 speed 间隔 dispatch TICK
  useGameLoop(status, speed, () => dispatch({ type: 'TICK' }))

  // 键盘输入：空格键控制状态，方向键控制移动
  useKeyboardInput(status, dispatch)

  // 每次状态变化后重新渲染画面
  useEffect(() => {
    render()
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border-2 border-slate-600/50 rounded-lg shadow-2xl shadow-black/50"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
