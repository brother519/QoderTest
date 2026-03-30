import { SnakeGame } from '@/components/games/SnakeGame'
import { GameProvider } from '@/store'

/** 贪吃蛇游戏页面 */
export default function SnakeGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            贪吃蛇
          </h1>
          <p className="text-slate-400 mt-2">经典贪吃蛇游戏 - 吃掉食物，不断成长</p>
        </header>

        <GameProvider>
          <SnakeGame />
        </GameProvider>
      </div>
    </div>
  )
}
