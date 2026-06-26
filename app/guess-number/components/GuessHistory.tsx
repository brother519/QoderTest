'use client';

/**
 * 猜测历史记录组件
 *
 * 显示所有已猜测的数字和对应的 A/B 反馈结果。
 *
 * @module guess-number/components/GuessHistory
 */

import { GuessResult } from '../types/game';

interface GuessHistoryProps {
    history: GuessResult[];
    codeLength: number;
    maxAttempts: number;
}

export function GuessHistory({ history, codeLength, maxAttempts }: GuessHistoryProps) {
    if (history.length === 0) {
        return (
            <div className="text-center text-slate-500 text-sm py-8">
                还没有猜测记录，开始猜吧！
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            {/* 表头 */}
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 font-medium border-b border-slate-700/50">
                <span className="w-8 text-center">#</span>
                <span className="flex-1 text-center">猜测</span>
                <span className="w-16 text-center">结果</span>
            </div>

            {/* 记录列表 */}
            <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto py-1">
                {history.map((record, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            index === history.length - 1
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'hover:bg-slate-800/50'
                        }`}
                    >
                        <span className="w-8 text-center text-xs text-slate-500 font-mono">
                            {index + 1}/{maxAttempts}
                        </span>

                        {/* 数字 */}
                        <div className="flex-1 flex justify-center gap-1.5">
                            {record.guess.split('').map((digit, dIdx) => (
                                <span
                                    key={dIdx}
                                    className="w-8 h-9 flex items-center justify-center rounded bg-slate-700/80 text-white font-bold text-sm"
                                >
                                    {digit}
                                </span>
                            ))}
                        </div>

                        {/* A/B 结果 */}
                        <div className="w-16 flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-rose-400">
                                {record.bulls}A
                            </span>
                            <span className="text-sm font-bold text-amber-400">
                                {record.cows}B
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
