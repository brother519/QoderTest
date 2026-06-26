'use client';

import { Level } from '../types/game';

interface LevelSelectProps {
    levels: Level[];
    bestStepsMap: Record<string, number | null>;
    onSelectLevel: (levelId: string) => void;
}

/**
 * Level selection screen with ancient scroll/parchment aesthetic.
 * Shows a responsive grid of level cards with completion status.
 */
export function LevelSelect({
    levels,
    bestStepsMap,
    onSelectLevel,
}: LevelSelectProps) {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
            {/* Header area with title */}
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-stone-100 tracking-widest drop-shadow-lg">
                    华容道
                </h2>
                <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-yellow-600/60 to-transparent" />
                <p className="text-stone-400 text-sm max-w-xs mx-auto leading-relaxed">
                    滑动方块，帮助曹操从重重包围中突围而出
                </p>
            </div>

            {/* Level cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {levels.map((level, index) => {
                    const best = bestStepsMap[level.id] ?? null;
                    const cleared = best !== null;
                    const isUnderPar = cleared && best <= level.parSteps;

                    return (
                        <button
                            key={level.id}
                            onClick={() => onSelectLevel(level.id)}
                            className="group relative px-5 py-4 rounded-xl
                                bg-gradient-to-br from-stone-800/80 via-stone-800/60 to-stone-900/80
                                hover:from-stone-700/80 hover:via-stone-700/60 hover:to-stone-800/80
                                border border-stone-600/30 hover:border-yellow-700/40
                                shadow-lg hover:shadow-xl hover:shadow-yellow-900/10
                                transition-all duration-300 text-left
                                hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {/* Parchment texture overlay */}
                            <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none
                                bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
                                from-yellow-100 to-transparent" />

                            {/* Level number badge */}
                            <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full
                                bg-stone-700 border border-stone-500/50
                                flex items-center justify-center
                                text-stone-300 text-xs font-bold shadow-md">
                                {index + 1}
                            </div>

                            {/* Completion star indicator */}
                            {isUnderPar && (
                                <div className="absolute -top-1 -right-1 text-yellow-400 text-lg drop-shadow-md">
                                    &#9733;
                                </div>
                            )}
                            {cleared && !isUnderPar && (
                                <div className="absolute -top-1 -right-1 text-green-400 text-sm drop-shadow-md">
                                    &#10003;
                                </div>
                            )}

                            {/* Level content */}
                            <div className="space-y-2 pt-1">
                                <h3 className="text-lg font-bold text-stone-100 group-hover:text-yellow-200/90 transition-colors">
                                    {level.name}
                                </h3>
                                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                                    {level.description}
                                </p>

                                {/* Stats row */}
                                <div className="flex items-center justify-between pt-1 border-t border-stone-700/50">
                                    <span className="text-stone-500 text-xs">
                                        参考: <span className="text-stone-300 font-mono">{level.parSteps}</span> 步
                                    </span>
                                    {cleared ? (
                                        <span className="text-yellow-500/80 text-xs font-mono">
                                            最佳: {best} 步
                                        </span>
                                    ) : (
                                        <span className="text-stone-600 text-xs">
                                            未通关
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
