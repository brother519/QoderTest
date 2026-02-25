import { useState, useCallback, useEffect, useRef } from 'react'
import {
  GameState,
  CellType,
  Piece,
  TetrominoType,
  createEmptyBoard,
  randomTetromino,
  createPiece,
  isValidPosition,
  rotatePiece,
  lockPiece,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateDropSpeed,
  hardDrop,
  isGameOver,
} from '../lib/tetris'

export function useTetris() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: randomTetromino(),
    score: 0,
    lines: 0,
    level: 0,
    status: 'idle',
  })

  const gameLoopRef = useRef<number | null>(null)
  const lastDropRef = useRef<number>(0)

  // 开始游戏
  const startGame = useCallback(() => {
    const firstPiece = randomTetromino()
    const nextPiece = randomTetromino()
    
    setGameState({
      board: createEmptyBoard(),
      currentPiece: createPiece(firstPiece),
      nextPiece,
      score: 0,
      lines: 0,
      level: 0,
      status: 'playing',
    })
  }, [])

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : prev.status === 'paused' ? 'playing' : prev.status,
    }))
  }, [])

  // 移动方块
  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.status !== 'playing' || !prev.currentPiece) return prev

      if (isValidPosition(prev.board, prev.currentPiece, dx, dy)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            x: prev.currentPiece.x + dx,
            y: prev.currentPiece.y + dy,
          },
        }
      }
      return prev
    })
  }, [])

  // 旋转方块
  const rotate = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing' || !prev.currentPiece) return prev

      const rotated = rotatePiece(prev.board, prev.currentPiece)
      return { ...prev, currentPiece: rotated }
    })
  }, [])

  // 硬降
  const drop = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing' || !prev.currentPiece) return prev

      const { piece: droppedPiece, dropDistance } = hardDrop(prev.board, prev.currentPiece)
      const newBoard = lockPiece(prev.board, droppedPiece)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

      const newScore = prev.score + calculateScore(linesCleared, prev.level) + dropDistance * 2
      const newLines = prev.lines + linesCleared
      const newLevel = calculateLevel(newLines)

      // 生成新方块
      const newPiece = createPiece(prev.nextPiece)
      const nextPiece = randomTetromino()

      // 检查游戏是否结束
      if (isGameOver(clearedBoard, newPiece)) {
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          status: 'gameover',
        }
      }

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: newPiece,
        nextPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
      }
    })
  }, [])

  // 自动下落
  const tick = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing' || !prev.currentPiece) return prev

      // 尝试下移
      if (isValidPosition(prev.board, prev.currentPiece, 0, 1)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            y: prev.currentPiece.y + 1,
          },
        }
      }

      // 无法下移，锁定方块
      const newBoard = lockPiece(prev.board, prev.currentPiece)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

      const newScore = prev.score + calculateScore(linesCleared, prev.level)
      const newLines = prev.lines + linesCleared
      const newLevel = calculateLevel(newLines)

      // 生成新方块
      const newPiece = createPiece(prev.nextPiece)
      const nextPiece = randomTetromino()

      // 检查游戏是否结束
      if (isGameOver(clearedBoard, newPiece)) {
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          status: 'gameover',
        }
      }

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: newPiece,
        nextPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
      }
    })
  }, [])

  // 游戏循环
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    const dropSpeed = calculateDropSpeed(gameState.level)

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastDropRef.current >= dropSpeed) {
        tick()
        lastDropRef.current = timestamp
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState.status, gameState.level, tick])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') {
        if (e.key === 'Enter' && (gameState.status === 'idle' || gameState.status === 'gameover')) {
          startGame()
        }
        if (e.key === 'p' || e.key === 'P') {
          togglePause()
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          drop()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.status, movePiece, rotate, drop, startGame, togglePause])

  return {
    gameState,
    startGame,
    togglePause,
    movePiece,
    rotate,
    drop,
  }
}
