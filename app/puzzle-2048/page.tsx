'use client';

/**
 * 2048 游戏主页面
 *
 * 整合棋盘、得分面板与状态遮罩，监听键盘方向键触发滑动。
 *
 * @module puzzle-2048/page
 */

import { useEffect, useCallback } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { use2048Game } from './hooks/use2048Game';
import { Board } from './components/Board';
import { ScorePanel } from './components/ScorePanel';
import { DEFAULT_CONFIG } from './constants/config';
import { Direction } from './types/game';

/** 棋盘单格像素尺寸 */
const CELL_SIZE = 80;
/** 格子之间的间隙 */
const CELL_GAP = 10;

/** 键盘按键到滑动方向的映射 */
const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

/**
 * 2048 游戏页面组件
 *
 * 作为路由 /puzzle-2048 的入口。
 * - 通过 use2048Game 获取核心游戏状态与控制方法
 * - 通过 Board 渲染棋盘并支持触屏手势
 * - 通过 GameOverlay 在胜利/失败时叠加提示
 * - 监听键盘方向键 + WASD 触发滑动
 */
export default function Puzzle2048Page() {
  const game = use2048Game(DEFAULT_CONFIG);

  /** 处理全局键盘事件：方向键/WASD 滑动 */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[e.key];
      if (direction) {
        e.preventDefault();
        game.move(direction);
      }
    },
    [game]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameLayout
      title="2048"
      className="bg-gradient-to-b from-amber-950 via-orange-950 to-amber-950 flex items-center justify-center py-6 px-4"
    >
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-400 mb-2 drop-shadow-lg text-center">
          🔢 2048
        </h1>
        <p className="text-amber-200/60 text-xs text-center mb-4">
          方向键 / WASD / 滑动手势 移动方块，合成 2048
        </p>

        <ScorePanel score={game.score} highScore={game.highScore} onRestart={game.restart} />

        <div className="relative mx-auto" style={{ width: 'fit-content' }}>
          <Board
            size={game.size}
            tiles={game.tiles}
            cellSize={CELL_SIZE}
            gap={CELL_GAP}
            moveDuration={DEFAULT_CONFIG.moveDuration}
            onMove={game.move}
          />

          {/* 胜利遮罩（首次合成 2048） */}
          <GameOverlay visible={game.status === 'won'} bgClass="bg-emerald-900/70">
            <div className="text-yellow-300 text-4xl font-bold drop-shadow-lg">🎉 你赢了！</div>
            <div className="text-white/80 text-sm">合成了 2048</div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={game.keepPlaying}
                className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-md transition-all active:scale-95"
              >
                继续游戏
              </button>
              <button
                onClick={game.restart}
                className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold transition-all active:scale-95"
              >
                重新开始
              </button>
            </div>
          </GameOverlay>

          {/* 游戏结束遮罩 */}
          <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
            <div className="text-red-400 text-3xl font-bold">游戏结束</div>
            <div className="text-white text-2xl font-bold">{game.score} 分</div>
            {game.score >= game.highScore && game.score > 0 && (
              <div className="text-yellow-400 text-sm animate-pulse">🏆 新纪录！</div>
            )}
            <button
              onClick={game.restart}
              className="px-4 py-2 mt-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition-all active:scale-95"
            >
              再来一局
            </button>
          </GameOverlay>
        </div>

        <div className="mt-4 text-amber-200/50 text-xs text-center space-y-1">
          <div>相同数字相撞即可合并 · 每次移动随机生成 2 或 4</div>
          <div>当棋盘填满且无可合并方块时游戏结束</div>
        </div>
      </div>

      {/* 方块出现 / 合并 关键帧动画 */}
      <style jsx global>{`
        @keyframes tile2048-pop-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tile2048-merge {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </GameLayout>
  );
}
