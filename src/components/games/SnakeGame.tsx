import { useCallback } from 'react'
import { SnakeGameComponent } from './SnakeGameComponent'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useGameState, useGameDispatch } from '@/store'
import type { Difficulty } from '@/lib/game-utils'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
}

/** 贪吃蛇游戏完整界面，包含控制面板和信息展示 */
export function SnakeGame() {
  const state = useGameState()
  const dispatch = useGameDispatch()

  const handleStart = useCallback(() => dispatch({ type: 'START' }), [dispatch])
  const handlePause = useCallback(() => dispatch({ type: 'PAUSE' }), [dispatch])
  const handleResume = useCallback(() => dispatch({ type: 'RESUME' }), [dispatch])
  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch])

  const handleDifficultyChange = useCallback(
    (difficulty: Difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty }),
    [dispatch]
  )

  // 移动端方向控制
  const handleDirection = useCallback(
    (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      dispatch({ type: 'CHANGE_DIRECTION', direction })
    },
    [dispatch]
  )

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-center">
      {/* 游戏画布区域 */}
      <div className="flex flex-col items-center gap-4">
        <SnakeGameComponent />

        {/* 移动端方向控制按钮 */}
        <div className="lg:hidden grid grid-cols-3 gap-2 w-36">
          <div />
          <Button variant="secondary" size="sm" onClick={() => handleDirection('UP')}>
            ↑
          </Button>
          <div />
          <Button variant="secondary" size="sm" onClick={() => handleDirection('LEFT')}>
            ←
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDirection('DOWN')}>
            ↓
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDirection('RIGHT')}>
            →
          </Button>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* 得分卡片 */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-400">当前得分</div>
              <div className="text-3xl font-bold text-emerald-400">{state.score}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">最高分</div>
              <div className="text-2xl font-bold text-amber-400">{state.highScore}</div>
            </div>
          </div>
        </Card>

        {/* 游戏控制 */}
        <Card title="游戏控制">
          <div className="flex flex-col gap-3">
            {state.status === 'idle' && (
              <Button onClick={handleStart} size="lg" className="w-full">
                开始游戏
              </Button>
            )}
            {state.status === 'playing' && (
              <Button onClick={handlePause} variant="secondary" size="lg" className="w-full">
                暂停
              </Button>
            )}
            {state.status === 'paused' && (
              <Button onClick={handleResume} size="lg" className="w-full">
                继续
              </Button>
            )}
            {state.status === 'gameover' && (
              <Button onClick={handleStart} size="lg" className="w-full">
                重新开始
              </Button>
            )}
            {state.status !== 'idle' && (
              <Button onClick={handleReset} variant="danger" size="sm" className="w-full">
                重置
              </Button>
            )}
          </div>
        </Card>

        {/* 难度选择 */}
        <Card title="难度选择">
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
              <Button
                key={diff}
                variant={state.difficulty === diff ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleDifficultyChange(diff)}
                disabled={state.status === 'playing'}
                className="flex-1"
              >
                {DIFFICULTY_LABELS[diff]}
              </Button>
            ))}
          </div>
        </Card>

        {/* 操作说明 */}
        <Card title="操作说明">
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>移动</span>
              <span className="text-slate-300">↑ ↓ ← → / WASD</span>
            </div>
            <div className="flex justify-between">
              <span>开始 / 暂停</span>
              <span className="text-slate-300">空格键</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
