/**
 * Flow Free game main page
 *
 * Integrates useFlowFree Hook with UI components.
 * Route: /flow-free
 *
 * @module flow-free/page
 */

'use client';

import { useFlowFree } from './hooks/useFlowFree';
import FlowBoard from './components/FlowBoard';
import ColorPalette from './components/ColorPalette';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';

export default function FlowFreePage() {
  const game = useFlowFree();

  return (
    <GameLayout
      title="连线游戏"
      className="bg-[#0f172a] flex items-center justify-center py-8 px-4"
    >
      <div className="text-center pt-8">
        <GamePageHeader title="连线游戏" />

        {/* Info panel */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="text-gray-300 text-sm">
            关卡: <span className="text-cyan-400 font-bold">{game.level}</span>
          </div>
          <div className="text-gray-300 text-sm">
            步数: <span className="text-yellow-400 font-bold">{game.moves}</span>
          </div>
          <div className="text-gray-300 text-sm">
            得分: <span className="text-green-400 font-bold">{game.score}</span>
          </div>
          <div className="text-gray-300 text-sm">
            最高分: <span className="text-purple-400 font-bold">{game.highScore}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {game.status === 'idle' && (
            <button
              onClick={game.start}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg
                         font-medium transition-colors"
            >
              开始游戏
            </button>
          )}
          {game.status === 'playing' && (
            <button
              onClick={game.restart}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg
                         font-medium transition-colors"
            >
              重置本关
            </button>
          )}
          {game.status === 'won' && (
            <button
              onClick={game.nextLevel}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg
                         font-medium transition-colors"
            >
              下一关
            </button>
          )}
        </div>

        {/* Color completion indicator */}
        <ColorPalette
          totalColors={game.totalColors}
          completedColors={game.completedColors}
          paths={game.paths}
        />

        {/* Game board */}
        <div className="relative inline-block">
          <FlowBoard
            board={game.board}
            paths={game.paths}
            completedColors={game.completedColors}
            disabled={game.status !== 'playing'}
            onStartDrawing={game.startDrawing}
            onExtendPath={game.extendPath}
            onEndDrawing={game.endDrawing}
          />

          {/* Idle overlay */}
          <GameOverlay visible={game.status === 'idle'}>
            <span className="text-purple-400 text-2xl font-bold">🔗 连线游戏</span>
            <span className="text-gray-300 text-sm mt-2">
              连接相同颜色的端点，填满整个棋盘
            </span>
            <span className="text-gray-400 text-xs mt-1">点击&quot;开始游戏&quot;开始</span>
          </GameOverlay>

          {/* Won overlay */}
          <GameOverlay visible={game.status === 'won'} bgClass="bg-black/60">
            <span className="text-green-400 text-2xl font-bold">🎉 通关!</span>
            <span className="text-white text-lg">第 {game.level} 关完成</span>
            <span className="text-gray-300 text-sm">
              用了 {game.moves} 步 | 得分: {game.score}
            </span>
          </GameOverlay>
        </div>

        <ControlHints
          hints={[
            '拖拽鼠标连接相同颜色的端点',
            '路径不可交叉，需填满整个棋盘',
            '点击已有路径可清除重画',
          ]}
        />
      </div>
    </GameLayout>
  );
}
