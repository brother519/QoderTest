'use client';

/**
 * 推箱子游戏主页面
 *
 * 整合棋盘、控制面板、关卡选择与状态遮罩。
 *
 * @module sokoban/page
 */

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useSokobanGame } from './hooks/useSokobanGame';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { LevelSelector } from './components/LevelSelector';
import { LEVELS } from './constants/levels';
import { KEY_TO_DIRECTION } from './constants/config';
import { Direction } from './types/game';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

function GameArea({ levelIndex }: { levelIndex: number }) {
    const game = useSokobanGame(levelIndex);
    const level = LEVELS[levelIndex];

    useKeyboard(
        { ...KEY_TO_DIRECTION, z: 'undo', Z: 'undo', r: 'reset', R: 'reset' },
        {
            onKeyDown: (action) => {
                if (['up', 'down', 'left', 'right'].includes(action)) {
                    game.move(action as Direction);
                    return;
                }
                if (action === 'undo') game.undo();
                if (action === 'reset') game.reset();
            },
        },
    );

    return (
        <div className="flex flex-col items-center gap-4">
            {/* 关卡信息 */}
            <div className="text-center">
                <div className="text-amber-400 text-sm font-medium">
                    第 {level.id} 关 · {level.name}
                </div>
            </div>

            {/* 棋盘 */}
            <div className="relative">
                <Board
                    grid={game.grid}
                    targets={game.targets}
                    player={game.player}
                    boxes={game.boxes}
                    rows={game.rows}
                    cols={game.cols}
                />

                {/* 过关遮罩 */}
                <GameOverlay visible={game.status === 'won'} bgClass="bg-emerald-900/70">
                    <div className="text-yellow-300 text-3xl font-bold drop-shadow-lg">
                        🎉 过关！
                    </div>
                    <div className="text-white/80 text-sm">
                        {game.moves} 步 · 推动 {game.pushes} 次
                    </div>
                </GameOverlay>
            </div>

            {/* 控制面板 */}
            <GameControls
                moves={game.moves}
                pushes={game.pushes}
                canUndo={game.canUndo}
                onUndo={game.undo}
                onReset={game.reset}
            />
        </div>
    );
}

/** 推箱子游戏页面 */
export default function SokobanPage() {
    const [levelIndex, setLevelIndex] = useState(0);

    return (
        <GameLayout
            title="推箱子"
            className="bg-gradient-to-b from-stone-950 via-amber-950 to-stone-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader title="推箱子" icon="📦" colorClass="text-amber-400" subtitle="把所有箱子推到红色目标点上" />

            {/* 关卡选择 */}
            <LevelSelector currentIndex={levelIndex} onSelect={setLevelIndex} />

            {/* 游戏区域 — key 变化时重新挂载以重置状态 */}
            <GameArea key={levelIndex} levelIndex={levelIndex} />

            <ControlHints hints={['箱子到达目标变绿', '避免把箱子推到角落']} className="text-stone-500 text-xs" />
        </GameLayout>
    );
}
