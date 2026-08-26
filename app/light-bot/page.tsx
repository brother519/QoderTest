'use client';

/**
 * Light-bot 页面入口
 *
 * @module light-bot/page
 */

import { GameLayout } from '@/lib/components/GameLayout';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { ControlHints } from '@/lib/components/ControlHints';
import { useLightBotGame } from './hooks/useLightBotGame';
import { Board } from './components/Board';
import { CommandPalette } from './components/CommandPalette';
import { CommandQueue } from './components/CommandQueue';
import { LevelSelector } from './components/LevelSelector';

function GameArea() {
    const game = useLightBotGame(0);

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-4 text-sm text-slate-300">
                <span>
                    已点亮：
                    <span className="text-yellow-300 font-bold">
                        {game.litCount}
                    </span>
                    /{game.level.lamps.length}
                </span>
                <span>
                    队列：
                    <span className="text-cyan-300 font-bold">
                        {game.queue.length}
                    </span>
                    条
                </span>
            </div>

            <div className="relative">
                <Board
                    level={game.level}
                    robot={game.robot}
                    litLamps={game.litLamps}
                    posKey={game.posKey}
                />

                <GameOverlay visible={game.status === 'win'}>
                    <div className="text-3xl font-bold text-yellow-300 drop-shadow-lg">
                        🎉 通关！
                    </div>
                    <button
                        onClick={game.reset}
                        className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500
                                   text-white font-medium transition-colors"
                    >
                        再玩一次
                    </button>
                </GameOverlay>

                <GameOverlay visible={game.status === 'fail'}>
                    <div className="text-2xl font-bold text-rose-300 drop-shadow-lg">
                        💥 失败
                    </div>
                    <div className="text-sm text-white/70">
                        机器人撞墙或灯未全亮
                    </div>
                    <button
                        onClick={game.reset}
                        className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500
                                   text-white font-medium transition-colors"
                    >
                        重新编排
                    </button>
                </GameOverlay>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
                <CommandPalette
                    status={game.status}
                    queueLength={game.queue.length}
                    onAppend={game.appendCommand}
                    onRun={game.run}
                    onReset={game.reset}
                    onUndo={game.undo}
                />
                <div className="flex flex-col items-center gap-1">
                    <div className="text-slate-400 text-xs">当前队列（点击可删除）</div>
                    <CommandQueue
                        queue={game.queue}
                        stepIndex={game.stepIndex}
                        status={game.status}
                        onRemoveAt={game.removeAt}
                    />
                </div>
            </div>

            <LevelSelector
                currentIndex={game.levelIndex}
                onSelect={game.setLevelIndex}
            />
        </div>
    );
}

export default function LightBotPage() {
    return (
        <GameLayout
            title="点灯机器人"
            className="bg-gradient-to-b from-slate-950 via-cyan-950/30 to-slate-950
                       flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="点灯机器人"
                icon="🤖"
                colorClass="text-cyan-400"
                subtitle="编写指令队列，让机器人点亮所有灯"
            />

            <GameArea />

            <ControlHints
                hints={['↑↓←→ 移动一格', '🔆 点亮所在格灯', '执行前可随时改队列']}
                className="text-cyan-200/40 text-xs"
            />
        </GameLayout>
    );
}
