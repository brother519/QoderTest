'use client';

/**
 * 推箱子关卡选择组件
 *
 * 显示关卡列表，支持选择关卡。
 *
 * @module sokoban/components/LevelSelector
 */

import { LEVELS } from '../constants/levels';

interface LevelSelectorProps {
    /** 当前选中的关卡索引（0 起） */
    currentIndex: number;
    /** 选择关卡回调 */
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
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                            : 'bg-stone-700/60 text-stone-400 hover:bg-stone-600 hover:text-stone-200'
                    }`}
                    title={level.name}
                >
                    {level.id}
                </button>
            ))}
        </div>
    );
}
