'use client';

/**
 * 点灯游戏关卡选择
 *
 * @module lights-out/components/LevelSelector
 */

import { LEVELS } from '../constants/levels';

interface LevelSelectorProps {
    currentIndex: number;
    onSelect: (index: number) => void;
}

export function LevelSelector({ currentIndex, onSelect }: LevelSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {LEVELS.map((level, index) => (
                <button
                    key={level.id}
                    onClick={() => onSelect(index)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${
                        index === currentIndex
                            ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30'
                            : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                    }`}
                    title={level.name}
                >
                    {level.id}
                </button>
            ))}
        </div>
    );
}
