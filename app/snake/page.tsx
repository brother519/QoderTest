/**
 * 贪吃蛇游戏主页面
 *
 * 整合 useSnakeGame Hook 与 UI 组件，处理键盘事件。
 * 访问路径：/snake
 *
 * @module snake/page
 */

'use client';

import { useSnakeGame } from './hooks/useSnakeGame';
import { SnakeCanvas } from './components/SnakeCanvas';
import { SnakeControls } from './components/SnakeControls';
import { DEFAULT_CONFIG } from './constants/config';
import { Direction } from './types/game';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

const KEY_MAP: Record<string, string> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP', W: 'UP',
    s: 'DOWN', S: 'DOWN',
    a: 'LEFT', A: 'LEFT',
    d: 'RIGHT', D: 'RIGHT',
    p: 'PAUSE', P: 'PAUSE',
    r: 'RESTART', R: 'RESTART',
};

const DIRECTIONS = new Set(['UP', 'DOWN', 'LEFT', 'RIGHT']);

export default function SnakePage() {
    const game = useSnakeGame(DEFAULT_CONFIG);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (DIRECTIONS.has(action)) {
                if (game.status === 'idle') game.start();
                if (game.status === 'playing') game.changeDirection(action as Direction);
                return;
            }
            if (action === 'PAUSE' && (game.status === 'playing' || game.status === 'paused')) {
                game.togglePause();
            }
            if (action === 'RESTART') {
                game.restart();
            }
        },
    });

  return (
    <GameLayout title="贪吃蛇" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <GamePageHeader title="贪吃蛇" />

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

        <ControlHints hints={['方向键 / WASD 控制', 'P 暂停', 'R 重新开始']} />
      </div>
    </GameLayout>
  );
}
