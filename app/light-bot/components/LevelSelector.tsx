'use client';

/**
 * 关卡切换标签
 *
 * @module light-bot/components/LevelSelector
 */

import { LEVELS } from '../constants/levels';

interface LevelSelectorProps {
    currentIndex: number;
    onSelect: (idx: number) => void;
}

export function LevelSelector({ currentIndex, onSelect }: LevelSelectorProps) {
    return (
        <div className="flex gap-2">
            {LEVELS.map((level, idx) => {
                const active = idx === currentIndex;
                return (
                    <button
                        key={level.id}
                        onClick={() => onSelect(idx)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${active
                                ? 'bg-cyan-500 text-white shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        L{level.id} · {level.name}
                    </button>
                );
            })}
        </div>
    );
}
