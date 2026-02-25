import React from 'react'
import { useTetris } from '../hooks/useTetris'
import { GameBoard } from './GameBoard'
import { NextPiece } from './NextPiece'
import { ScoreBoard } from './ScoreBoard'
import { Controls } from './Controls'

export function TetrisGame() {
  const { gameState, startGame, togglePause, movePiece, rotate, drop } = useTetris()
  const { board, currentPiece, nextPiece, score, lines, level, status } = gameState

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 game-grid-bg">
      {/* 标题 */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary neon-text tracking-wider">
        TETRIS
      </h1>

      {/* 游戏主体 */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* 游戏板 */}
        <div className="relative">
          <GameBoard board={board} currentPiece={currentPiece} />

          {/* 遮罩层 - 开始/暂停/结束 */}
          {status !== 'playing' && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
              {status === 'idle' && (
                <>
                  <p className="text-xl mb-4 text-muted-foreground">准备好了吗？</p>
                  <button
                    onClick={startGame}
                    className="btn-game text-primary-foreground"
                  >
                    开始游戏
                  </button>
                  <p className="text-sm mt-4 text-muted-foreground">或按 Enter 键开始</p>
                </>
              )}

              {status === 'paused' && (
                <>
                  <p className="text-2xl mb-4 text-accent neon-text">暂停中</p>
                  <button
                    onClick={togglePause}
                    className="btn-game text-primary-foreground"
                  >
                    继续游戏
                  </button>
                </>
              )}

              {status === 'gameover' && (
                <>
                  <p className="text-2xl mb-2 text-red-500 neon-text">游戏结束</p>
                  <p className="text-lg mb-4 text-muted-foreground">
                    最终分数: <span className="text-primary font-bold">{score.toLocaleString()}</span>
                  </p>
                  <button
                    onClick={startGame}
                    className="btn-game text-primary-foreground"
                  >
                    再来一局
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="flex flex-col gap-4 w-40">
          <NextPiece type={nextPiece} />
          <ScoreBoard score={score} lines={lines} level={level} />
          <Controls />
        </div>
      </div>

      {/* 移动端触控按钮 */}
      <div className="md:hidden mt-6 grid grid-cols-3 gap-2 touch-control">
        <div />
        <button
          onTouchStart={(e) => { e.preventDefault(); rotate() }}
          className="bg-card/50 border border-border rounded-lg p-4 text-2xl active:bg-primary/30"
        >
          ↑
        </button>
        <div />
        <button
          onTouchStart={(e) => { e.preventDefault(); movePiece(-1, 0) }}
          className="bg-card/50 border border-border rounded-lg p-4 text-2xl active:bg-primary/30"
        >
          ←
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); drop() }}
          className="bg-primary/50 border border-primary rounded-lg p-4 text-sm font-bold active:bg-primary"
        >
          DROP
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); movePiece(1, 0) }}
          className="bg-card/50 border border-border rounded-lg p-4 text-2xl active:bg-primary/30"
        >
          →
        </button>
        <div />
        <button
          onTouchStart={(e) => { e.preventDefault(); movePiece(0, 1) }}
          className="bg-card/50 border border-border rounded-lg p-4 text-2xl active:bg-primary/30"
        >
          ↓
        </button>
        <div />
      </div>
    </div>
  )
}
