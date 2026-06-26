/**
 * 接水管游戏主页面
 *
 * 整合 usePipePuzzle Hook 与 UI 组件。
 * 访问路径：/pipe-puzzle
 *
 * @module pipe-puzzle/page
 */

'use client';

import { usePipePuzzle } from './hooks/usePipePuzzle';
import { PipeBoard } from './components/PipeBoard';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';

export default function PipePuzzlePage() {
    const game = usePipePuzzle();

    return (
        <GameLayout
            title="接水管"
            className="bg-[#0f172a] flex items-center justify-center py-8 px-4"
        >
            <div className="text-center pt-8">
                <GamePageHeader title="接水管" />

                {/* 信息面板 */}
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

                {/* 控制按钮 */}
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

                {/* 游戏棋盘 */}
                <div className="relative inline-block">
                    <PipeBoard
                        board={game.board}
                        onRotate={game.rotatePipe}
                        disabled={game.status !== 'playing'}
                    />

                    {/* 初始等待遮罩 */}
                    <GameOverlay visible={game.status === 'idle'}>
                        <span className="text-cyan-400 text-2xl font-bold">🔧 接水管</span>
                        <span className="text-gray-300 text-sm mt-2">
                            旋转管道，将水源(S)连接到出口(E)
                        </span>
                        <span className="text-gray-400 text-xs mt-1">点击&quot;开始游戏&quot;开始</span>
                    </GameOverlay>

                    {/* 通关遮罩 */}
                    <GameOverlay visible={game.status === 'won'} bgClass="bg-black/60">
                        <span className="text-green-400 text-2xl font-bold">🎉 通关!</span>
                        <span className="text-white text-lg">
                            第 {game.level} 关完成
                        </span>
                        <span className="text-gray-300 text-sm">
                            用了 {game.moves} 步 | 得分: {game.score}
                        </span>
                    </GameOverlay>
                </div>

                <ControlHints hints={['点击管道旋转 90°', '连通 S→E 即可通关', '步数越少分越高']} />
            </div>
        </GameLayout>
    );
}
