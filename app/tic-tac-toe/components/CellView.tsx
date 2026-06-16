'use client';

/**
 * 井字棋格子渲染
 *
 * @module tic-tac-toe/components/CellView
 */

import { Cell } from '../types/game';
import { CELL_SIZE } from '../constants/config';

interface CellViewProps {
    value: Cell;
    isWinning: boolean;
    disabled: boolean;
    onClick: () => void;
}

export function CellView({ value, isWinning, disabled, onClick }: CellViewProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled && value === null}
            className={`flex items-center justify-center transition-all duration-200 rounded-lg
                ${!value && !disabled ? 'hover:bg-slate-700/50 cursor-pointer' : ''}
                ${value ? 'cursor-default' : ''}
                ${isWinning ? 'bg-indigo-500/20 scale-105' : 'bg-slate-800/30'}
            `}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            aria-label={value ?? '空格'}
        >
            {value && (
                <span
                    className={`text-5xl font-black drop-shadow-lg transition-transform duration-200 ${
                        value === 'X' ? 'text-orange-400' : 'text-violet-400'
                    } ${isWinning ? 'scale-110' : ''}`}
                >
                    {value}
                </span>
            )}
        </button>
    );
}
