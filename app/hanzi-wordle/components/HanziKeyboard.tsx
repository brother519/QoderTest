/**
 * HanziKeyboard component — virtual keyboard for Hanzi Wordle
 *
 * Displays rows of Chinese characters as clickable buttons.
 * Each button is colored based on its best-known status from past guesses.
 *
 * @module hanzi-wordle/components/HanziKeyboard
 */

import { KeyStatusMap, TileStatus } from '../types/game';
import { KEYBOARD_ROWS } from '../constants/config';

/** Button color classes per character status */
const KEY_COLORS: Record<TileStatus | 'unknown', string> = {
    correct: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500',
    present: 'bg-amber-500 hover:bg-amber-400 text-white border-amber-400',
    absent: 'bg-slate-700 hover:bg-slate-600 text-slate-400 border-slate-600',
    active: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600',
    empty: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600',
    unknown: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600',
};

interface HanziKeyboardProps {
    keyStatuses: KeyStatusMap;
    onChar: (char: string) => void;
    onDelete: () => void;
    onEnter: () => void;
    disabled?: boolean;
}

export function HanziKeyboard({
    keyStatuses,
    onChar,
    onDelete,
    onEnter,
    disabled = false,
}: HanziKeyboardProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full max-w-2xl mx-auto">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 justify-center flex-wrap">
                    {row.map((char) => {
                        const status = keyStatuses[char] ?? 'unknown';
                        return (
                            <button
                                key={char}
                                onClick={() => onChar(char)}
                                disabled={disabled}
                                className={`
                                    w-9 h-9 md:w-10 md:h-10 rounded-md text-sm md:text-base font-medium
                                    border transition-all duration-150
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${KEY_COLORS[status]}
                                `}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            ))}

            {/* Action buttons */}
            <div className="flex gap-2 justify-center mt-1">
                <button
                    onClick={onDelete}
                    disabled={disabled}
                    className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600
                               text-white text-sm font-medium border border-slate-600
                               transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ⌫ 退格
                </button>
                <button
                    onClick={onEnter}
                    disabled={disabled}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                               text-white text-sm font-medium border border-indigo-500
                               transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ✓ 确认
                </button>
            </div>
        </div>
    );
}
