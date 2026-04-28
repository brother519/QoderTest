/**
 * 贪吃蛇游戏主页面
 *
 * 整合 useSnakeGame Hook 与 UI 组件，处理键盘事件。
 * 访问路径：/snake
 *
 * @module snake/page
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useSnakeGame } from './hooks/useSnakeGame';
import { SnakeCanvas } from './components/SnakeCanvas';
import { SnakeControls } from './components/SnakeControls';
import { DEFAULT_CONFIG } from './constants/config';
import { Direction } from './types/game';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';

/** 键盘按键到方向的映射 */
const KEY_DIRECTION_MAP: Record<string, Direction> = {
  arrowup: 'UP',
  w: 'UP',
  arrowdown: 'DOWN',
  s: 'DOWN',
  arrowleft: 'LEFT',
  a: 'LEFT',
  arrowright: 'RIGHT',
  d: 'RIGHT',
};

export default function SnakePage() {
  const game = useSnakeGame(DEFAULT_CONFIG);

  /** 键盘事件处理 */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // 方向控制
      const dir = KEY_DIRECTION_MAP[key];
      if (dir) {
        e.preventDefault();
        if (game.status === 'idle') {
          game.start();
        }
        if (game.status === 'playing') {
          game.changeDirection(dir);
        }
        return;
      }

      // P 键：暂停/继续
      if (key === 'p' && (game.status === 'playing' || game.status === 'paused')) {
        game.togglePause();
      }

      // R 键：重新开始
      if (key === 'r') {
        game.restart();
      }
    },
    [game]
  );

  /** 注册/清理键盘监听 */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameLayout title="贪吃蛇" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          贪吃蛇
        </h1>

        {/* 控制面板 */}
        <SnakeControls
          score={game.score}
          highScore={game.highScore}
          status={game.status}
          onStart={game.start}
          onTogglePause={game.togglePause}
          onRestart={game.restart}
        />

        {/* 游戏画布 */}
        <div className="relative inline-block mt-4">
          <SnakeCanvas
            snake={game.snake}
            food={game.food}
            config={DEFAULT_CONFIG}
          />

          {/* 暂停遮罩 */}
          <GameOverlay visible={game.status === 'paused'}>
            <span className="text-cyan-400 text-3xl font-bold">暂停</span>
          </GameOverlay>

          {/* 游戏结束遮罩 */}
          <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
            <span className="text-red-400 text-2xl font-bold">游戏结束</span>
            <span className="text-white text-lg">得分: {game.score}</span>
          </GameOverlay>

          {/* 初始等待遮罩 */}
          <GameOverlay visible={game.status === 'idle'}>
            <span className="text-cyan-400 text-xl font-bold">贪吃蛇</span>
            <span className="text-gray-300 text-sm">点击&quot;开始游戏&quot;或按方向键开始</span>
          </GameOverlay>
        </div>

        {/* 操作提示 */}
        <div className="mt-4 text-gray-500 text-sm">
          方向键 / WASD 控制 &nbsp;|&nbsp; P 暂停 &nbsp;|&nbsp; R 重新开始
        </div>
      </div>
    </GameLayout>
  );
}
