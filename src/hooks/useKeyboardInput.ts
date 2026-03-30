/** 键盘输入 Hook 模块 - 处理游戏方向控制和空格键状态切换 */

import { useEffect } from 'react'
import type { Dispatch } from 'react'

import { keyToDirection } from '@/lib/game-utils'
import type { GameStatus } from '@/lib/game-utils'

/** useKeyboardInput 接受的 dispatch action 类型 */
type KeyboardAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'CHANGE_DIRECTION'; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }

/**
 * 管理游戏键盘输入的自定义 Hook
 *
 * 监听 window keydown 事件：
 * - 空格键：根据当前 status 切换 START/PAUSE/RESUME
 * - 方向键 / WASD：dispatch CHANGE_DIRECTION
 *
 * @param status - 当前游戏状态，用于决定空格键行为
 * @param dispatch - 状态分发函数
 */
export function useKeyboardInput(
  status: GameStatus,
  dispatch: Dispatch<KeyboardAction>,
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // 空格键控制 开始/暂停/恢复
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

      // 方向键 / WASD 控制移动
      const direction = keyToDirection(e.key)
      if (direction) {
        e.preventDefault()
        dispatch({ type: 'CHANGE_DIRECTION', direction })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [status, dispatch])
}
