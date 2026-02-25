import React from 'react'
import { cn } from '../lib/utils'
import {
  CellType,
  Piece,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_SIZE,
  TETROMINO_COLORS,
  getPieceShape,
  getGhostPosition,
} from '../lib/tetris'

interface GameBoardProps {
  board: CellType[][]
  currentPiece: Piece | null
}

export function GameBoard({ board, currentPiece }: GameBoardProps) {
  // 创建显示用的游戏板（包含当前方块和投影）
  const displayBoard = React.useMemo(() => {
    const display = board.map(row => [...row])

    if (currentPiece) {
      const shape = getPieceShape(currentPiece)
      const ghostY = getGhostPosition(board, currentPiece)

      // 绘制投影 (Ghost)
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardY = ghostY + row
            const boardX = currentPiece.x + col
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              if (display[boardY][boardX] === null) {
                display[boardY][boardX] = `ghost-${currentPiece.type}` as CellType
              }
            }
          }
        }
      }

      // 绘制当前方块
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardY = currentPiece.y + row
            const boardX = currentPiece.x + col
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              display[boardY][boardX] = currentPiece.type
            }
          }
        }
      }
    }

    return display
  }, [board, currentPiece])

  return (
    <div 
      className="game-board rounded-lg overflow-hidden bg-secondary/50 backdrop-blur-sm"
      style={{
        width: BOARD_WIDTH * CELL_SIZE + 4,
        height: BOARD_HEIGHT * CELL_SIZE + 4,
        padding: 2,
      }}
    >
      <div 
        className="grid gap-px bg-border/30"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
        }}
      >
        {displayBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isGhost = cell?.startsWith('ghost-')
            const cellType = isGhost ? cell?.replace('ghost-', '') as CellType : cell
            const colorClass = cellType ? TETROMINO_COLORS[cellType as keyof typeof TETROMINO_COLORS] : ''

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  'cell transition-all duration-75',
                  cell ? (isGhost ? 'opacity-20' : 'cell-filled') : 'bg-background/40',
                  colorClass
                )}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
