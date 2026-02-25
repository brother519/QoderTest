import React from 'react'
import { cn } from '../lib/utils'
import { TetrominoType, TETROMINOES, TETROMINO_COLORS } from '../lib/tetris'

interface NextPieceProps {
  type: TetrominoType
}

export function NextPiece({ type }: NextPieceProps) {
  const shape = TETROMINOES[type][0]
  const colorClass = TETROMINO_COLORS[type]
  const cellSize = 20

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">
        下一个
      </h3>
      <div 
        className="flex justify-center items-center"
        style={{ minHeight: 80 }}
      >
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${shape[0].length}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${shape.length}, ${cellSize}px)`,
          }}
        >
          {shape.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  'cell rounded-sm transition-all',
                  cell ? `cell-filled ${colorClass}` : 'bg-transparent'
                )}
                style={{
                  width: cellSize,
                  height: cellSize,
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
