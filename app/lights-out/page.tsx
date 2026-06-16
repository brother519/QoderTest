'use client';

/**
 * 点灯游戏主页面
 *
 * @module lights-out/page
 */

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useLightsOut } from './hooks/useLightsOut';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { LevelSelector } from './components/LevelSelector';
import { LEVELS } from './constants/levels';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

function GameArea({ levelIndex }: { levelIndex: number }) {
    const game = useLightsOut(levelIndex);
    const level = LEVELS[levelIndex];

    useKeyboard(
        { r: 'reset', R: 'reset' },
        { onKeyDown: (action) => { if (action === 'reset') game.reset(); } },
    );

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-center">
                <div className="text-yellow-400 text-sm font-medium">
                    第 {level.id} 关 · {level.name} ({level.size}x{level.size})
                </div>
            </div>

            <div className="relative">
                <Board grid={game.grid} size={game.size} onToggle={game.toggle} />

                <GameOverlay visible={game.status === 'won'} bgClass="bg-slate-900/80">
                    <div className="text-yellow-300 text-3xl font-bold drop-shadow-lg">
                        🎉 全部熄灭！
                    </div>
                    <div className="text-white/80 text-sm">用了 {game.moves} 步</div>
                </GameOverlay>
            </div>

            <GameControls moves={game.moves} lightsOn={game.lightsOn} onReset={game.reset} />
        </div>
    );
}

export default function LightsOutPage() {
    const [levelIndex, setLevelIndex] = useState(0);

    return (
        <GameLayout
            title="点灯游戏"
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader title="点灯游戏" icon="💡" colorClass="text-yellow-400" subtitle="点击格子切换灯光，把所有灯熄灭即可过关" />

            <LevelSelector currentIndex={levelIndex} onSelect={setLevelIndex} />

            <GameArea key={levelIndex} levelIndex={levelIndex} />

            <ControlHints hints={['点击会切换该格和上下左右共 5 盏灯的状态']} className="text-slate-500 text-xs" />
        </GameLayout>
    );
}
