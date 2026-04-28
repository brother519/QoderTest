/**
 * 俄罗斯方块游戏主页面
 *
 * 整合 useTetrisGame Hook 与所有 UI 组件，处理键盘事件。
 * 包含游戏棋盘、信息面板、遮罩层和操作提示。
 * 访问路径：/tetris
 *
 * @module tetris/page
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTetrisGame } from './hooks/useTetrisGame';
import { TetrisCanvas } from './components/TetrisCanvas';
import { GameInfoPanel } from './components/GameInfoPanel';
import { DEFAULT_CONFIG } from './constants/config';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';

/**
 * 键盘按键到操作的映射
 *
 * 键值使用小写，支持方向键和 WASD
 */
const KEY_MAP: Record<string, string> = {
  arrowleft: 'moveLeft',
  a: 'moveLeft',
  arrowright: 'moveRight',
  d: 'moveRight',
  arrowup: 'rotate',
  w: 'rotate',
  arrowdown: 'softDrop',
  s: 'softDrop',
  ' ': 'hardDrop',
  p: 'togglePause',
  r: 'restart',
};

export default function TetrisPage() {
  const game = useTetrisGame(DEFAULT_CONFIG);

  /** 键盘事件处理 */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];

      if (!action) return;

      e.preventDefault();

      // idle 状态下按方向键/操作键自动开始游戏
      if (game.status === 'idle' && action !== 'togglePause' && action !== 'restart') {
        game.start();
        return;
      }

      // 根据 action 调用对应方法
      switch (action) {
        case 'moveLeft':
          game.moveLeft();
          break;
        case 'moveRight':
          game.moveRight();
          break;
        case 'rotate':
          game.rotate();
          break;
        case 'softDrop':
          game.softDrop();
          break;
        case 'hardDrop':
          game.hardDrop();
          break;
        case 'togglePause':
          if (game.status === 'playing' || game.status === 'paused') {
            game.togglePause();
          }
          break;
        case 'restart':
          game.restart();
          break;
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
    <GameLayout title="俄罗斯方块" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          俄罗斯方块
        </h1>

        {/* 游戏主体区域：左侧棋盘 + 右侧信息面板 */}
        <div className="flex gap-6 justify-center items-start">
          {/* 左侧棋盘区 */}
          <div className="relative inline-block">
            <TetrisCanvas
              board={game.board}
              currentPiece={game.currentPiece}
              config={DEFAULT_CONFIG}
            />

            {/* 初始等待遮罩 */}
            <GameOverlay visible={game.status === 'idle'}>
              <span className="text-cyan-400 text-xl font-bold">俄罗斯方块</span>
              <span className="text-gray-300 text-sm">按开始游戏或任意方向键开始</span>
            </GameOverlay>

            {/* 暂停遮罩 */}
            <GameOverlay visible={game.status === 'paused'}>
              <span className="text-cyan-400 text-3xl font-bold">暂停</span>
            </GameOverlay>

            {/* 游戏结束遮罩 */}
            <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
              <span className="text-red-400 text-2xl font-bold">游戏结束</span>
              <span className="text-white text-lg">得分: {game.score}</span>
              <span className="text-gray-300 text-sm">消除行数: {game.lines}</span>
            </GameOverlay>
          </div>

          {/* 右侧信息面板 */}
          <GameInfoPanel
            score={game.score}
            level={game.level}
            lines={game.lines}
            highScore={game.highScore}
            status={game.status}
            nextPiece={game.nextPiece}
            config={DEFAULT_CONFIG}
            onStart={game.start}
            onTogglePause={game.togglePause}
            onRestart={game.restart}
          />
        </div>

        {/* 操作提示 */}
        <div className="mt-4 text-gray-500 text-sm">
          方向键/WASD 移动 &nbsp;|&nbsp; &uarr;/W 旋转 &nbsp;|&nbsp; &darr;/S 软降 &nbsp;|&nbsp; 空格 硬降 &nbsp;|&nbsp; P 暂停 &nbsp;|&nbsp; R 重开
        </div>
      </div>
    </GameLayout>
  );
}
