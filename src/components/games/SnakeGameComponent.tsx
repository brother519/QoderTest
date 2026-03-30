import { useEffect, useRef, useCallback } from 'react'
import { useGameState, useGameDispatch } from '@/store'
import { keyToDirection } from '@/lib/game-utils'
import type { Point } from '@/lib/game-utils'

/** 游戏画布组件 - 负责渲染蛇、食物和网格 */
export function SnakeGameComponent() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)

  const { config, snake, food, status, speed } = state
  const canvasSize = config.gridSize * config.cellSize

  // 渲染游戏画面
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { cellSize, gridSize } = config

    // 清空画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 0.5
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

    // 绘制食物（带发光效果）
    const foodCenterX = food.x * cellSize + cellSize / 2
    const foodCenterY = food.y * cellSize + cellSize / 2
    const foodRadius = cellSize / 2 - 2

    // 食物光晕
    const glow = ctx.createRadialGradient(
      foodCenterX, foodCenterY, 0,
      foodCenterX, foodCenterY, cellSize
    )
    glow.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
    glow.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(
      food.x * cellSize - cellSize / 2,
      food.y * cellSize - cellSize / 2,
      cellSize * 2,
      cellSize * 2
    )

    // 食物本体
    ctx.beginPath()
    ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()
    ctx.strokeStyle = '#fca5a5'
    ctx.lineWidth = 1
    ctx.stroke()

    // 绘制蛇身
    snake.forEach((segment: Point, index: number) => {
      const x = segment.x * cellSize
      const y = segment.y * cellSize
      const padding = 1
      const radius = 3

      if (index === 0) {
        // 蛇头 - 使用更亮的颜色
        ctx.fillStyle = '#4ade80'
        ctx.strokeStyle = '#86efac'
        ctx.lineWidth = 1.5

        // 蛇头光晕
        const headGlow = ctx.createRadialGradient(
          x + cellSize / 2, y + cellSize / 2, 0,
          x + cellSize / 2, y + cellSize / 2, cellSize
        )
        headGlow.addColorStop(0, 'rgba(74, 222, 128, 0.2)')
        headGlow.addColorStop(1, 'rgba(74, 222, 128, 0)')
        ctx.fillStyle = headGlow
        ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize * 2, cellSize * 2)

        ctx.fillStyle = '#4ade80'
      } else {
        // 蛇身 - 渐变颜色
        const alpha = 1 - (index / snake.length) * 0.4
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`
        ctx.strokeStyle = `rgba(74, 222, 128, ${alpha * 0.5})`
        ctx.lineWidth = 1
      }

      // 绘制圆角矩形
      ctx.beginPath()
      ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius)
      ctx.fill()
      ctx.stroke()

      // 蛇头眼睛
      if (index === 0) {
        ctx.fillStyle = '#1a1a2e'
        const eyeSize = 3
        const eyeOffset = 5

        let eye1X = x + eyeOffset
        let eye1Y = y + eyeOffset
        let eye2X = x + cellSize - eyeOffset
        let eye2Y = y + eyeOffset

        if (state.direction === 'UP') {
          eye1X = x + eyeOffset; eye1Y = y + eyeOffset
          eye2X = x + cellSize - eyeOffset; eye2Y = y + eyeOffset
        } else if (state.direction === 'DOWN') {
          eye1X = x + eyeOffset; eye1Y = y + cellSize - eyeOffset
          eye2X = x + cellSize - eyeOffset; eye2Y = y + cellSize - eyeOffset
        } else if (state.direction === 'LEFT') {
          eye1X = x + eyeOffset; eye1Y = y + eyeOffset
          eye2X = x + eyeOffset; eye2Y = y + cellSize - eyeOffset
        } else {
          eye1X = x + cellSize - eyeOffset; eye1Y = y + eyeOffset
          eye2X = x + cellSize - eyeOffset; eye2Y = y + cellSize - eyeOffset
        }

        ctx.beginPath()
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // 游戏未开始或结束时绘制遮罩
    if (status === 'idle' || status === 'gameover' || status === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 20px "Segoe UI", system-ui, sans-serif'
      ctx.textAlign = 'center'

      if (status === 'idle') {
        ctx.fillText('按 空格键 开始', canvasSize / 2, canvasSize / 2)
      } else if (status === 'paused') {
        ctx.fillText('已暂停', canvasSize / 2, canvasSize / 2 - 10)
        ctx.font = '14px "Segoe UI", system-ui, sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('按 空格键 继续', canvasSize / 2, canvasSize / 2 + 16)
      } else {
        ctx.fillStyle = '#ef4444'
        ctx.fillText('游戏结束', canvasSize / 2, canvasSize / 2 - 15)
        ctx.font = '16px "Segoe UI", system-ui, sans-serif'
        ctx.fillStyle = '#e2e8f0'
        ctx.fillText(`得分: ${state.score}`, canvasSize / 2, canvasSize / 2 + 12)
        ctx.font = '14px "Segoe UI", system-ui, sans-serif'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('按 空格键 重新开始', canvasSize / 2, canvasSize / 2 + 36)
      }
    }
  }, [config, snake, food, status, state.score, state.direction, canvasSize])

  // 游戏循环
  useEffect(() => {
    if (status !== 'playing') {
      render()
      return
    }

    const loop = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= speed) {
        dispatch({ type: 'TICK' })
        lastTickRef.current = timestamp
      }
      gameLoopRef.current = requestAnimationFrame(loop)
    }

    gameLoopRef.current = requestAnimationFrame(loop)

    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [status, speed, dispatch, render])

  // 每次状态变化后重新渲染
  useEffect(() => {
    render()
  }, [render])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键 控制 开始/暂停/恢复/重新开始
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        if (status === 'idle' || status === 'gameover') {
          dispatch({ type: 'START' })
        } else if (status === 'playing') {
          dispatch({ type: 'PAUSE' })
        } else if (status === 'paused') {
          dispatch({ type: 'RESUME' })
        }
        return
      }

      // 方向键控制
      const direction = keyToDirection(e.key)
      if (direction) {
        e.preventDefault()
        dispatch({ type: 'CHANGE_DIRECTION', direction })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, dispatch])

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
