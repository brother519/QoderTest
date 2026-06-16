/**
 * 滑动拼图方块组件
 *
 * @module sliding-puzzle/components/Tile
 */

'use client';

import { TILE_STYLES, TILE_STYLE_FALLBACK } from '../constants/config';

interface TileProps {
    value: number;
    size: number;
    cellSize: number;
    gap: number;
    isMovable: boolean;
    isSelected: boolean;
    moveDuration: number;
    onClick: () => void;
}

export function Tile({
    value,
    size,
    cellSize,
    gap,
    isMovable,
    isSelected,
    moveDuration,
    onClick,
}: TileProps) {
    if (value === 0) {
        return (
            <div
                className="rounded-xl"
                style={{ width: cellSize, height: cellSize }}
                aria-hidden="true"
            />
        );
    }

    const styleClass = TILE_STYLES[value] ?? TILE_STYLE_FALLBACK;

    return (
        <button
            onClick={onClick}
            disabled={!isMovable}
            className={`
                rounded-xl flex items-center justify-center font-bold shadow-lg
                transition-all duration-${moveDuration}
                ${styleClass}
                ${isMovable ? 'cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95' : 'cursor-default opacity-90'}
                ${isSelected ? 'ring-4 ring-white/50 scale-105' : ''}
            `}
            style={{
                width: cellSize,
                height: cellSize,
                fontSize: cellSize * 0.45,
            }}
            aria-label={`方块 ${value}${isMovable ? '，可移动' : ''}`}
        >
            {value}
        </button>
    );
}
