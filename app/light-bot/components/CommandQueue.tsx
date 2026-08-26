'use client';

/**
 * 命令队列可视化
 *
 * @module light-bot/components/CommandQueue
 */

import { Command, LightBotStatus } from '../types/game';

interface CommandQueueProps {
    queue: Command[];
    stepIndex: number;
    status: LightBotStatus;
    onRemoveAt: (idx: number) => void;
}

const COMMAND_ICON: Record<Command, string> = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    light: '🔆',
};

export function CommandQueue({
    queue,
    stepIndex,
    status,
    onRemoveAt,
}: CommandQueueProps) {
    if (queue.length === 0) {
        return (
            <div className="text-slate-500 text-sm italic px-2">
                （队列空，点击下方指令按钮添加）
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2 max-w-sm">
            {queue.map((cmd, idx) => {
                const isCurrent = status === 'running' && idx === stepIndex;
                const isDone = status === 'running' && idx < stepIndex;
                return (
                    <button
                        key={idx}
                        onClick={() => onRemoveAt(idx)}
                        disabled={status !== 'playing'}
                        className={`
                            w-10 h-10 rounded-lg text-white font-bold text-lg
                            transition-all
                            ${isCurrent
                                ? 'bg-cyan-400 scale-110 ring-2 ring-cyan-200'
                                : isDone
                                    ? 'bg-slate-600 opacity-50'
                                    : 'bg-slate-700 hover:bg-slate-600'
                            }
                            disabled:cursor-not-allowed
                        `}
                        title={`第 ${idx + 1} 步：${cmd}（点击删除）`}
                    >
                        {COMMAND_ICON[cmd]}
                    </button>
                );
            })}
        </div>
    );
}
