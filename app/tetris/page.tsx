/**
 * 俄罗斯方块游戏主页面
 * Tetris Game Main Page
 *
 * 整合 useTetrisGame Hook 与所有 UI 组件，处理键盘事件。
 * 包含游戏棋盘、信息面板、遮罩层和操作提示。
 * 访问路径：/tetris
 *
 * Integrates the useTetrisGame Hook with all UI components and handles keyboard events.
 * Contains the game board, info panel, overlays, and control hints.
 * Route: /tetris
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
 * Keyboard key to action mapping
 *
 * 键值使用小写，支持方向键和 WASD
 * Keys are lowercase, supports arrow keys and WASD
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

  /**
   * 键盘事件处理 - 监听用户按键并映射到游戏操作
   * Keyboard event handler - listens for key presses and maps them to game actions
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];

      if (!action) return;

      e.preventDefault();

      // idle 状态下按方向键/操作键自动开始游戏
      // Auto-start game when pressing direction/action keys in idle state
      if (game.status === 'idle' && action !== 'togglePause' && action !== 'restart') {
        game.start();
        return;
      }

      // 根据 action 调用对应方法
      // Call the corresponding method based on action
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

  // 组件挂载时注册键盘监听，卸载时自动清理
  // Register keyboard listener on mount, auto-cleanup on unmount
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameLayout title="俄罗斯方块" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        {/* 游戏标题区域 / Game title area */}
        {/* 使用 cyan 色系保持视觉一致性 / Use cyan color scheme for visual consistency */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          俄罗斯方块
        </h1>

        {/* 游戏主体区域：左侧棋盘 + 右侧信息面板 / Main game area: left board + right info panel */}
        <div className="flex gap-6 justify-center items-start">
          {/* 左侧棋盘区 / Left board area */}
          <div className="relative inline-block">
            <TetrisCanvas
              board={game.board}
              currentPiece={game.currentPiece}
              config={DEFAULT_CONFIG}
            />

            {/* 初始等待遮罩 / Initial waiting overlay */}
            <GameOverlay visible={game.status === 'idle'}>
              <span className="text-cyan-400 text-xl font-bold">俄罗斯方块</span>
              <span className="text-gray-300 text-sm">按开始游戏或任意方向键开始</span>
            </GameOverlay>

            {/* 暂停遮罩 / Pause overlay */}
            <GameOverlay visible={game.status === 'paused'}>
              <span className="text-cyan-400 text-3xl font-bold">暂停</span>
            </GameOverlay>

            {/* 游戏结束遮罩 / Game over overlay */}
            <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
              <span className="text-red-400 text-2xl font-bold">游戏结束</span>
              <span className="text-white text-lg">得分: {game.score}</span>
              <span className="text-gray-300 text-sm">消除行数: {game.lines}</span>
            </GameOverlay>
          </div>

          {/* 右侧信息面板 / Right info panel */}
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

        {/* 操作提示 / Control hints */}
        {/* 底部快捷键说明，帮助玩家了解操作方式 / Bottom shortcut instructions to help players understand controls */}
        {/* TODO: 后续可考虑加入移动端虚拟按键支持 / TODO: Consider adding mobile virtual button support later */}
        <div className="mt-4 text-gray-500 text-sm">
          方向键/WASD 移动 &nbsp;|&nbsp; &uarr;/W 旋转 &nbsp;|&nbsp; &darr;/S 软降 &nbsp;|&nbsp; 空格 硬降 &nbsp;|&nbsp; P 暂停 &nbsp;|&nbsp; R 重开
        </div>
      </div>
    </GameLayout>
  );
}
