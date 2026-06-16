'use client';

/**
 * 点灯游戏格子渲染
 *
 * @module lights-out/components/CellView
 */

import { CELL_SIZE } from '../constants/config';

interface CellViewProps {
    /** 灯是否亮着 */
    isOn: boolean;
    /** 点击回调 */
    onClick: () => void;
}

export function CellView({ isOn, onClick }: CellViewProps) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg border-2 transition-all duration-200 active:scale-90 ${
                isOn
                    ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/40'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
            }`}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            aria-label={isOn ? '灯亮' : '灯灭'}
        >
            {isOn && (
                <span className="text-2xl drop-shadow-md">💡</span>
            )}
        </button>
    );
}
