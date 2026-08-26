'use client';

/**
 * 命令面板：5 个方向指令 + 执行/重置/撤销
 *
 * @module light-bot/components/CommandPalette
 */

import { Command, LightBotStatus } from '../types/game';

interface CommandPaletteProps {
    status: LightBotStatus;
    queueLength: number;
    onAppend: (cmd: Command) => void;
    onRun: () => void;
    onReset: () => void;
    onUndo: () => void;
}

export function CommandPalette({
    status,
    queueLength,
    onAppend,
    onRun,
    onReset,
    onUndo,
}: CommandPaletteProps) {
    const disabled = status !== 'playing';

    return (
        <div className="flex flex-col gap-3 items-center">
            <div className="grid grid-cols-3 gap-2 w-max">
                <div />
                <CmdBtn label="↑" onClick={() => onAppend('up')} disabled={disabled} />
                <div />
                <CmdBtn label="←" onClick={() => onAppend('left')} disabled={disabled} />
                <CmdBtn label="🔆" onClick={() => onAppend('light')} disabled={disabled} />
                <CmdBtn label="→" onClick={() => onAppend('right')} disabled={disabled} />
                <div />
                <CmdBtn label="↓" onClick={() => onAppend('down')} disabled={disabled} />
                <div />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onRun}
                    disabled={disabled || queueLength === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400
                               disabled:bg-slate-700 disabled:text-slate-500
                               text-white font-medium transition-colors"
                >
                    ▶ 执行
                </button>
                <button
                    onClick={onUndo}
                    disabled={disabled || queueLength === 0}
                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500
                               disabled:bg-slate-800 disabled:text-slate-500
                               text-white font-medium transition-colors"
                >
                    ↶ 撤销
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500
                               text-white font-medium transition-colors"
                >
                    ⟳ 重置
                </button>
            </div>
        </div>
    );
}

function CmdBtn({
    label,
    onClick,
    disabled,
}: {
    label: string;
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500
                       disabled:bg-slate-700 disabled:text-slate-500
                       text-white text-lg font-bold transition-colors
                       shadow-md active:scale-95"
        >
            {label}
        </button>
    );
}
