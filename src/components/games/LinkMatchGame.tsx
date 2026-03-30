/**
 * 连连看游戏容器组件
 *
 * 整合画布、控制面板、得分和设置界面。
 * 响应式布局：桌面端左右排列，移动端上下排列。
 */

import { LinkMatchCanvas } from './LinkMatchCanvas'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLinkMatchState, useLinkMatchDispatch } from '@/store/link-match-store'
import type { Difficulty } from '@/lib/link-match-utils'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
}

export function LinkMatchGame() {
  const state = useLinkMatchState()
  const dispatch = useLinkMatchDispatch()

  const isPlaying = state.status === 'playing'
  const isIdle = state.status === 'idle'
  const isFinished = state.status === 'win' || state.status === 'nomoves'

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-center">
      {/* 游戏画布区域 */}
      <div className="flex flex-col items-center gap-4">
        <LinkMatchCanvas />
      </div>

      {/* 控制面板 */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* 得分卡片 */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-400">当前得分</div>
              <div className="text-3xl font-bold text-purple-400">{state.score}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">最高分</div>
              <div className="text-2xl font-bold text-amber-400">{state.highScore}</div>
            </div>
          </div>
          {isPlaying && (
            <div className="mt-3 text-sm text-slate-400">
              剩余配对：<span className="text-slate-200">{state.remainingPairs}</span>
            </div>
          )}
        </Card>

        {/* 游戏控制 */}
        <Card title="游戏控制">
          <div className="flex flex-col gap-3">
            {isIdle && (
              <Button onClick={() => dispatch({ type: 'START' })} size="lg" className="w-full">
                开始游戏
              </Button>
            )}
            {isPlaying && (
              <Button
                onClick={() => dispatch({ type: 'RESET' })}
                variant="danger"
                size="lg"
                className="w-full"
              >
                放弃
              </Button>
            )}
            {isFinished && (
              <>
                <Button onClick={() => dispatch({ type: 'START' })} size="lg" className="w-full">
                  重新开始
                </Button>
                <Button
                  onClick={() => dispatch({ type: 'RESET' })}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  返回
                </Button>
              </>
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
                onClick={() => dispatch({ type: 'SET_DIFFICULTY', difficulty: diff })}
                disabled={isPlaying}
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
              <span>选择方块</span>
              <span className="text-slate-300">鼠标点击</span>
            </div>
            <div className="flex justify-between">
              <span>消除规则</span>
              <span className="text-slate-300">相同图案 + 可连线</span>
            </div>
            <div className="flex justify-between">
              <span>连线规则</span>
              <span className="text-slate-300">最多两次转弯</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
