/**
 * Hanoi Tower Game Statistics Component
 *
 * @module hanoi/components/GameStats
 */

'use client';

import { HanoiStats } from '../types/game';
import { getOptimalMoves } from '../hooks/useHanoiGame';

interface GameStatsProps {
    stats: HanoiStats;
    currentLevel: number;
    currentMoves: number;
    elapsedTime: number;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameStats({
    stats,
    currentLevel,
    currentMoves,
    elapsedTime,
}: GameStatsProps) {
    const bestMoves = stats.bestMoves[currentLevel];
    const optimalMoves = getOptimalMoves(currentLevel);

    return (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-800 p-4 text-sm md:grid-cols-4">
            <div className="text-center">
                <div className="text-slate-400">当前步数</div>
                <div className="text-2xl font-bold text-white">{currentMoves}</div>
            </div>
            <div className="text-center">
                <div className="text-slate-400">最优步数</div>
                <div className="text-2xl font-bold text-emerald-400">{optimalMoves}</div>
            </div>
            <div className="text-center">
                <div className="text-slate-400">用时</div>
                <div className="text-2xl font-bold text-blue-400">{formatTime(elapsedTime)}</div>
            </div>
            <div className="text-center">
                <div className="text-slate-400">本层最佳</div>
                <div className="text-2xl font-bold text-amber-400">
                    {bestMoves || '-'}
                </div>
            </div>
            <div className="col-span-2 text-center md:col-span-2">
                <div className="text-slate-400">总游戏次数</div>
                <div className="text-lg font-semibold text-white">{stats.totalGames}</div>
            </div>
            <div className="col-span-2 text-center md:col-span-2">
                <div className="text-slate-400">总游戏时长</div>
                <div className="text-lg font-semibold text-white">
                    {formatTime(stats.totalTime)}
                </div>
            </div>
        </div>
    );
}
