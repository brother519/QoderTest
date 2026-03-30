/** 游戏循环 Hook 模块 - 封装 requestAnimationFrame 定时 tick 逻辑 */

import { useEffect, useRef } from 'react'

import type { GameStatus } from '@/lib/game-utils'

/**
 * 管理游戏主循环的自定义 Hook
 *
 * 当 status 为 'playing' 时启动 requestAnimationFrame 循环，
 * 按 speed 间隔调用 onTick 回调；否则停止循环。
 *
 * @param status - 当前游戏状态
 * @param speed - tick 间隔时间（ms）
 * @param onTick - 每次 tick 触发的回调函数
 */
export function useGameLoop(
  status: GameStatus,
  speed: number,
  onTick: () => void,
): void {
  const gameLoopRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const onTickRef = useRef(onTick)

  // 保持 onTick 引用最新，避免将其加入 effect 依赖
  onTickRef.current = onTick

  useEffect(() => {
    if (status !== 'playing') return

    const loop = (timestamp: number): void => {
      if (timestamp - lastTickRef.current >= speed) {
        onTickRef.current()
        lastTickRef.current = timestamp
      }
      gameLoopRef.current = requestAnimationFrame(loop)
    }

    gameLoopRef.current = requestAnimationFrame(loop)

    return (): void => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [status, speed])
}
