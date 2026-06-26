/**
 * 关卡选择界面组件
 *
 * 显示所有关卡，已解锁的可点击，未解锁的显示锁定图标。
 *
 * @module one-stroke/components/LevelSelect
 */

'use client';

import { LEVELS } from '../constants/config';

interface LevelSelectProps {
    unlockedLevels: number; // 已解锁关卡数
    currentLevelIndex: number;
    onSelectLevel: (index: number) => void;
    onClose: () => void;
}

export function LevelSelect({
    unlockedLevels,
    currentLevelIndex,
    onSelectLevel,
    onClose,
}: LevelSelectProps) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-80 shadow-2xl">
                {/* 标题行 */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">选择关卡</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
                        aria-label="关闭"
                    >
                        ✕
                    </button>
                </div>

                {/* 关卡网格 */}
                <div className="grid grid-cols-4 gap-3">
                    {LEVELS.map((level, idx) => {
                        const unlocked = idx < unlockedLevels;
                        const isActive = idx === currentLevelIndex;

                        return (
                            <button
                                key={level.id}
                                onClick={() => unlocked && onSelectLevel(idx)}
                                disabled={!unlocked}
                                className={[
                                    'relative h-14 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all duration-200',
                                    unlocked
                                        ? isActive
                                            ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/30 scale-105'
                                            : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105 cursor-pointer'
                                        : 'bg-slate-900 text-slate-600 cursor-not-allowed',
                                ].join(' ')}
                            >
                                {unlocked ? (
                                    <>
                                        <span className="text-base font-bold">{level.id}</span>
                                        <span className="text-[10px] opacity-70 truncate w-full text-center px-1">
                                            {level.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg">🔒</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 提示 */}
                <p className="text-slate-500 text-xs text-center mt-4">
                    已解锁 {unlockedLevels} / {LEVELS.length} 关
                </p>
            </div>
        </div>
    );
}
