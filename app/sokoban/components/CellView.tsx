'use client';

/**
 * 推箱子格子渲染组件
 *
 * 根据格子类型和实体渲染对应的视觉效果。
 *
 * @module sokoban/components/CellView
 */

import { CellType, Position } from '../types/game';
import { CELL_SIZE } from '../constants/config';

interface CellViewProps {
    /** 格子静态类型 */
    cellType: CellType;
    /** 是否有玩家 */
    hasPlayer: boolean;
    /** 是否有箱子 */
    hasBox: boolean;
    /** 是否是目标点 */
    isTarget: boolean;
}

export function CellView({ cellType, hasPlayer, hasBox, isTarget }: CellViewProps) {
    const size = CELL_SIZE;

    if (cellType === 'wall') {
        return (
            <div
                className="bg-stone-700 border border-stone-600 rounded-sm"
                style={{ width: size, height: size }}
            >
                <div className="w-full h-full bg-gradient-to-br from-stone-600 to-stone-800 rounded-sm" />
            </div>
        );
    }

    if (cellType === 'floor' && !hasPlayer && !hasBox && !isTarget) {
        return <div style={{ width: size, height: size }} />;
    }

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            {/* 地板背景 */}
            <div className="absolute inset-0 bg-stone-900/30 rounded-sm" />

            {/* 目标点标记 */}
            {isTarget && !hasBox && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-400/60 animate-pulse" />
                </div>
            )}

            {/* 箱子 */}
            {hasBox && (
                <div
                    className={`relative z-10 rounded-md flex items-center justify-center shadow-md transition-all duration-150 ${
                        isTarget
                            ? 'bg-emerald-500 border-2 border-emerald-300'
                            : 'bg-amber-600 border-2 border-amber-400'
                    }`}
                    style={{ width: size - 8, height: size - 8 }}
                >
                    <span className="text-lg">{isTarget ? '✓' : '📦'}</span>
                </div>
            )}

            {/* 玩家 */}
            {hasPlayer && (
                <div
                    className="relative z-10 rounded-full flex items-center justify-center bg-sky-500 border-2 border-sky-300 shadow-lg shadow-sky-500/30 transition-all duration-150"
                    style={{ width: size - 8, height: size - 8 }}
                >
                    <span className="text-lg">😊</span>
                </div>
            )}
        </div>
    );
}
