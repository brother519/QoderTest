'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 游戏配置
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 30

// 方块类型定义
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
}

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

type ShapeType = keyof typeof SHAPES
type Board = (ShapeType | null)[][]

interface Piece {
  shape: number[][]
  type: ShapeType
  x: number
  y: number
}

export default function TetrisGame() {
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // 创建新方块
  const createPiece = useCallback((): Piece => {
    const types = Object.keys(SHAPES) as ShapeType[]
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      shape: SHAPES[type],
      type,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[type][0].length / 2),
      y: 0
    }
  }, [])

  // 检查碰撞
  const checkCollision = useCallback((piece: Piece, board: Board, offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX
          const newY = piece.y + y + offsetY

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  // 合并方块到游戏板
  const mergePiece = useCallback((piece: Piece, board: Board): Board => {
    const newBoard = board.map(row => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y
          const boardX = piece.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type
          }
        }
      }
    }
    return newBoard
  }, [])

  // 清除完整的行
  const clearLines = useCallback((board: Board): { newBoard: Board; linesCleared: number } => {
    let linesCleared = 0
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell !== null)
      if (isFull) linesCleared++
      return !isFull
    })

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, linesCleared }
  }, [])

  // 旋转方块
  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const newShape: number[][] = []
    for (let x = 0; x < piece.shape[0].length; x++) {
      const newRow: number[] = []
      for (let y = piece.shape.length - 1; y >= 0; y--) {
        newRow.push(piece.shape[y][x])
      }
      newShape.push(newRow)
    }
    return newShape
  }, [])

  // 移动方块
  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return

    if (!checkCollision(currentPiece, board, dx, dy)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy })
    } else if (dy > 0) {
      // 方块到底了
      const newBoard = mergePiece(currentPiece, board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      
      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 + 10)
      
      if (nextPiece && !checkCollision(nextPiece, clearedBoard)) {
        setCurrentPiece(nextPiece)
        setNextPiece(createPiece())
      } else {
        setGameOver(true)
      }
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, nextPiece, createPiece])

  // 旋转
  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    const newPiece = { ...currentPiece, shape: rotated }
    
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, rotatePiece])

  // 快速下落
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let newY = currentPiece.y
    while (!checkCollision(currentPiece, board, 0, newY - currentPiece.y + 1)) {
      newY++
    }
    setCurrentPiece({ ...currentPiece, y: newY })
    setTimeout(() => movePiece(0, 1), 50)
  }, [currentPiece, board, gameOver, isPaused, checkCollision, movePiece])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isStarted || gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'P':
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isStarted, gameOver, movePiece, rotate, hardDrop])

  // 游戏循环
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    gameLoopRef.current = setInterval(() => {
      movePiece(0, 1)
    }, 1000)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [isStarted, gameOver, isPaused, movePiece])

  // 开始游戏
  const startGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    const firstPiece = createPiece()
    const secondPiece = createPiece()
    
    setBoard(newBoard)
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
    setScore(0)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setIsStarted(true)
  }, [createPiece])

  // 渲染游戏板
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row])
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y
            const boardX = currentPiece.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.type
            }
          }
        }
      }
    }

    return displayBoard
  }

  // 渲染预览方块
  const renderNextPiece = () => {
    if (!nextPiece) return null
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">下一个:</h3>
        <div className="inline-block border-2 border-gray-300 p-2 bg-gray-50">
          {nextPiece.shape.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={x}
                  className="border border-gray-200"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: cell ? COLORS[nextPiece.type] : 'transparent'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="flex gap-4 flex-col md:flex-row">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">俄罗斯方块</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* 游戏板 */}
              <div 
                className="border-4 border-gray-800 bg-white"
                style={{
                  width: BOARD_WIDTH * BLOCK_SIZE,
                  height: BOARD_HEIGHT * BLOCK_SIZE
                }}
              >
                {renderBoard().map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => (
                      <div
                        key={x}
                        className="border border-gray-200"
                        style={{
                          width: BLOCK_SIZE,
                          height: BLOCK_SIZE,
                          backgroundColor: cell ? COLORS[cell] : 'white'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* 控制按钮 */}
              <div className="flex gap-2">
                {!isStarted || gameOver ? (
                  <Button onClick={startGame} size="lg">
                    {gameOver ? '重新开始' : '开始游戏'}
                  </Button>
                ) : (
                  <Button onClick={() => setIsPaused(!isPaused)} size="lg">
                    {isPaused ? '继续' : '暂停'}
                  </Button>
                )}
              </div>

              {/* 游戏提示 */}
              {isPaused && (
                <div className="text-center text-sm text-muted-foreground">
                  游戏已暂停
                </div>
              )}
              {gameOver && (
                <div className="text-center text-sm text-destructive font-semibold">
                  游戏结束!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 侧边栏 */}
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-lg">游戏信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">分数</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">消除行数</div>
              <div className="text-2xl font-bold">{lines}</div>
            </div>
            
            {renderNextPiece()}

            <div className="pt-4 border-t space-y-2">
              <h3 className="text-sm font-semibold">操作说明:</h3>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>← → : 左右移动</div>
                <div>↓ : 快速下降</div>
                <div>↑ : 旋转方块</div>
                <div>空格 : 直接落地</div>
                <div>P : 暂停/继续</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
