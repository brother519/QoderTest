/**
 * Hanoi Tower Level Selector Component
 *
 * @module hanoi/components/LevelSelector
 */

'use client';

import { HANOI_CONFIG } from '../constants/config';
import { getOptimalMoves } from '../hooks/useHanoiGame';

interface LevelSelectorProps {
    unlockedLevels: number;
    currentLevel: number;
    onSelectLevel: (level: number) => void;
}

export function LevelSelector({
    unlockedLevels,
    currentLevel,
    onSelectLevel,
}: LevelSelectorProps) {
    const levels = Array.from(
        { length: HANOI_CONFIG.maxLevel - HANOI_CONFIG.minLevel + 1 },
        (_, i) => i + HANOI_CONFIG.minLevel
    );

    return (
        <div className="flex flex-wrap justify-center gap-2">
            {levels.map(level => {
                const isUnlocked = level <= unlockedLevels;
                const isActive = level === currentLevel;

                return (
                    <button
                        key={level}
                        onClick={() => isUnlocked && onSelectLevel(level)}
                        disabled={!isUnlocked}
                        className={`
                            relative rounded-lg px-4 py-2 font-semibold transition-all
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : isUnlocked
                                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                    : 'cursor-not-allowed bg-slate-800 text-slate-500'
                            }
                        `}
                    >
                        <div className="text-lg">{level}层</div>
                        <div className="text-xs opacity-70">最优: {getOptimalMoves(level)}步</div>
                        {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg">🔒</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
