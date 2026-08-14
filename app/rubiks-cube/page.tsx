/**
 * 魔方游戏主页面
 *
 * @module rubiks-cube/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useRubiksCubeGame } from './hooks/useRubiksCubeGame';
import { CubeScene } from './components/CubeScene';
import { GameControls } from './components/GameControls';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function RubiksCubePage() {
    const game = useRubiksCubeGame();

    return (
        <GameLayout
            title="魔方"
            className="bg-gradient-to-b from-indigo-950 via-violet-950 to-purple-950
                       flex flex-col items-center justify-center py-6 px-4"
        >
            <GamePageHeader
                title="魔方"
                icon="🧊"
                colorClass="text-violet-400"
                subtitle="旋转各层，还原六面颜色"
            />

            <div className="flex flex-col items-center gap-4 mt-2">
                <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
                    <div>
                        步数: <span className="font-bold text-violet-400">{game.moves}</span>
                    </div>
                    <div>
                        时间: <span className="font-bold text-cyan-400">{formatTime(game.time)}</span>
                    </div>
                    <div>
                        最高分: <span className="font-bold text-yellow-400">{game.highScore}</span>
                    </div>
                </div>

                <div className="relative">
                    <CubeScene
                        cubeState={game.cubeState}
                        viewAngles={game.viewAngles}
                        isAnimating={game.isAnimating}
                        pendingMove={game.pendingMove}
                        hoveredMove={game.hoveredMove}
                        onAnimationEnd={game.commitMove}
                        onViewChange={game.setViewAngles}
                    />

                    <GameOverlay
                        visible={game.status === 'won'}
                        bgClass="bg-purple-950/80 backdrop-blur-sm"
                    >
                        <div className="text-yellow-300 text-4xl font-bold">🎉 还原成功！</div>
                        <div className="text-white/80 text-sm">
                            用了 <span className="font-bold text-violet-400">{game.moves}</span> 步
                        </div>
                        <button
                            type="button"
                            onClick={game.scramble}
                            className="mt-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500
                                       text-white font-bold transition-colors"
                        >
                            再来一局
                        </button>
                    </GameOverlay>

                    <GameOverlay visible={game.status === 'idle'}>
                        <div className="text-violet-300 text-lg font-bold">3x3 魔方</div>
                        <div className="text-white/60 text-sm">点击&quot;打乱&quot;开始挑战</div>
                    </GameOverlay>
                </div>

                <GameControls
                    moves={game.moves}
                    time={game.time}
                    highScore={game.highScore}
                    status={game.status}
                    isAnimating={game.isAnimating}
                    onScramble={game.scramble}
                    onReset={game.reset}
                    onMove={game.applyMove}
                    onHoverMove={game.setHoveredMove}
                />

                <ControlHints
                    hints={['点击按钮旋转各层', '拖拽魔方旋转视角', '还原六面颜色即可胜利']}
                    className="text-violet-300/50 text-xs"
                />
            </div>
        </GameLayout>
    );
}
