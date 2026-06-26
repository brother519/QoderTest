import React from 'react';
import { TangramPieceType } from '../types/game';

interface GameControlsProps {
    selectedPieceId: TangramPieceType | null;
    onRotate: () => void;
    onFlip: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onRestart: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
    selectedPieceId,
    onRotate,
    onFlip,
    onUndo,
    onRedo,
    onRestart,
}) => {
    const btnBase =
        'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200';
    const btnPrimary = `${btnBase} bg-slate-700/80 text-slate-200 hover:bg-slate-600/80 border border-slate-600/50`;
    const btnAccent = `${btnBase} bg-cyan-600/80 text-white hover:bg-cyan-500/80 border border-cyan-500/50`;
    const btnDisabled = `${btnBase} bg-slate-800/50 text-slate-500 border border-slate-700/30 cursor-not-allowed`;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                onClick={onRotate}
                disabled={!selectedPieceId}
                className={selectedPieceId ? btnAccent : btnDisabled}
                title="旋转选中拼图块 (R)"
            >
                <span>↻</span>
                旋转
            </button>
            <button
                onClick={onFlip}
                disabled={!selectedPieceId}
                className={selectedPieceId ? btnAccent : btnDisabled}
                title="翻转选中拼图块 (F)"
            >
                <span>↔</span>
                翻转
            </button>

            <div className="w-px h-6 bg-slate-700/50 mx-1" />

            <button onClick={onUndo} className={btnPrimary} title="撤销 (Ctrl+Z)">
                <span>↩</span>
                撤销
            </button>
            <button onClick={onRedo} className={btnPrimary} title="重做 (Ctrl+Y)">
                <span>↪</span>
                重做
            </button>

            <div className="w-px h-6 bg-slate-700/50 mx-1" />

            <button onClick={onRestart} className={btnPrimary} title="重新开始">
                <span>⟲</span>
                重置
            </button>
        </div>
    );
};
