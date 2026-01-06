'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

// 游戏常量
const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

// 方向类型
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// 坐标类型
interface Position {
  x: number
  y: number
}

// 游戏状态类型
type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver'

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  const directionRef = useRef<Direction>(direction)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // 生成随机食物位置
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // 重置游戏
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection('RIGHT')
    directionRef.current = 'RIGHT'
    setScore(0)
    setGameStatus('idle')
  }, [generateFood])

  // 开始游戏
  const startGame = useCallback(() => {
    if (gameStatus === 'gameOver') {
      resetGame()
    }
    setGameStatus('playing')
  }, [gameStatus, resetGame])

  // 暂停游戏
  const pauseGame = useCallback(() => {
    setGameStatus('paused')
  }, [])

  // 继续游戏
  const resumeGame = useCallback(() => {
    setGameStatus('playing')
  }, [])

  // 游戏主循环
  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }
      const currentDirection = directionRef.current

      // 根据方向移动蛇头
      switch (currentDirection) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // 检测墙壁碰撞
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameStatus('gameOver')
        setHighScore(prev => Math.max(prev, score))
        return prevSnake
      }

      // 检测自身碰撞
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameStatus('gameOver')
        setHighScore(prev => Math.max(prev, score))
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // 检测是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [food, generateFood, score])

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' && gameStatus !== 'paused') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      // 空格键暂停/继续
      if (e.key === ' ') {
        if (gameStatus === 'playing') {
          pauseGame()
        } else if (gameStatus === 'paused') {
          resumeGame()
        }
        return
      }

      const currentDir = directionRef.current

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') {
            setDirection('UP')
            directionRef.current = 'UP'
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') {
            setDirection('DOWN')
            directionRef.current = 'DOWN'
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') {
            setDirection('LEFT')
            directionRef.current = 'LEFT'
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') {
            setDirection('RIGHT')
            directionRef.current = 'RIGHT'
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, startGame, pauseGame, resumeGame])

  // 游戏循环
  useEffect(() => {
    if (gameStatus === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, INITIAL_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStatus, gameLoop])

  // 渲染游戏画面
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制网格
    ctx.strokeStyle = '#2a2a4e'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
      )
      
      if (index === 0) {
        // 蛇头
        gradient.addColorStop(0, '#4ade80')
        gradient.addColorStop(1, '#22c55e')
      } else {
        // 蛇身
        gradient.addColorStop(0, '#86efac')
        gradient.addColorStop(1, '#4ade80')
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        4
      )
      ctx.fill()
    })

    // 绘制食物
    const foodGradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    )
    foodGradient.addColorStop(0, '#f87171')
    foodGradient.addColorStop(1, '#ef4444')
    
    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()

    // 游戏结束覆盖层
    if (gameStatus === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20)
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px sans-serif'
      ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10)
    }

    // 暂停覆盖层
    if (gameStatus === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('已暂停', canvas.width / 2, canvas.height / 2)
    }
  }, [snake, food, gameStatus, score])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">贪吃蛇游戏</h1>
        <div className="flex gap-8 text-lg">
          <span className="text-green-400">得分: {score}</span>
          <span className="text-yellow-400">最高分: {highScore}</span>
        </div>
      </div>

      <div className="relative border-4 border-slate-600 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="block"
        />
      </div>

      <div className="mt-6 flex gap-4">
        {gameStatus === 'idle' && (
          <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
            开始游戏
          </Button>
        )}
        {gameStatus === 'playing' && (
          <Button onClick={pauseGame} size="lg" variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
            暂停
          </Button>
        )}
        {gameStatus === 'paused' && (
          <Button onClick={resumeGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
            继续
          </Button>
        )}
        {gameStatus === 'gameOver' && (
          <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
            重新开始
          </Button>
        )}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <Button onClick={resetGame} size="lg" variant="destructive">
            重置
          </Button>
        )}
      </div>

      <div className="mt-6 text-center text-slate-400 text-sm">
        <p>使用 <kbd className="px-2 py-1 bg-slate-700 rounded">W/A/S/D</kbd> 或 <kbd className="px-2 py-1 bg-slate-700 rounded">方向键</kbd> 控制方向</p>
        <p className="mt-1">按 <kbd className="px-2 py-1 bg-slate-700 rounded">空格</kbd> 暂停/继续游戏</p>
      </div>
    </main>
  )
}
