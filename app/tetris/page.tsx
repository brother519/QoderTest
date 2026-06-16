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

import { useTetrisGame } from './hooks/useTetrisGame';
import { TetrisCanvas } from './components/TetrisCanvas';
import { GameInfoPanel } from './components/GameInfoPanel';
import { DEFAULT_CONFIG } from './constants/config';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

const KEY_MAP: Record<string, string> = {
    ArrowLeft: 'moveLeft',
    a: 'moveLeft', A: 'moveLeft',
    ArrowRight: 'moveRight',
    d: 'moveRight', D: 'moveRight',
    ArrowUp: 'rotate',
    w: 'rotate', W: 'rotate',
    ArrowDown: 'softDrop',
    s: 'softDrop', S: 'softDrop',
    ' ': 'hardDrop',
    p: 'togglePause', P: 'togglePause',
    r: 'restart', R: 'restart',
};

export default function TetrisPage() {
    const game = useTetrisGame(DEFAULT_CONFIG);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (game.status === 'idle' && action !== 'togglePause' && action !== 'restart') {
                game.start();
                return;
            }
            switch (action) {
                case 'moveLeft': game.moveLeft(); break;
                case 'moveRight': game.moveRight(); break;
                case 'rotate': game.rotate(); break;
                case 'softDrop': game.softDrop(); break;
                case 'hardDrop': game.hardDrop(); break;
                case 'togglePause':
                    if (game.status === 'playing' || game.status === 'paused') game.togglePause();
                    break;
                case 'restart': game.restart(); break;
            }
        },
    });

  return (
    <GameLayout title="俄罗斯方块" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <GamePageHeader title="俄罗斯方块" />

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

        <ControlHints hints={['方向键/WASD 移动', '↑/W 旋转', '↓/S 软降', '空格 硬降', 'P 暂停', 'R 重开']} />
      </div>
    </GameLayout>
  );
}
