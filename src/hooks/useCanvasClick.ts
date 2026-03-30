/**
 * Canvas 鼠标点击 Hook
 *
 * 将 Canvas 上的像素坐标转换为棋盘格子坐标，
 * 并 dispatch SELECT_CELL 动作。
 */

import { useEffect, useCallback, type RefObject, type Dispatch } from 'react'
import type { LinkMatchConfig, LinkMatchStatus, CellCoord } from '@/lib/link-match-utils'

/** 此 Hook 可接受的 Action 类型 */
interface SelectCellAction {
  type: 'SELECT_CELL'
  coord: CellCoord
}

/** 监听 Canvas 点击事件并映射为格子坐标 */
export function useCanvasClick(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  status: LinkMatchStatus,
  config: LinkMatchConfig,
  dispatch: Dispatch<SelectCellAction>,
): void {
  const handleClick = useCallback(
    (e: MouseEvent): void => {
      if (status !== 'playing') return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const col = Math.floor(x / config.cellSize)
      const row = Math.floor(y / config.cellSize)

      if (row < 0 || row >= config.rows || col < 0 || col >= config.cols) return

      dispatch({ type: 'SELECT_CELL', coord: { row, col } })
    },
    [canvasRef, status, config, dispatch],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [canvasRef, handleClick])
}
