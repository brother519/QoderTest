'use client';

import { useRef, useCallback } from 'react';
import { Block } from '../types/game';
import { BLOCK_COLORS, MOVE_DURATION } from '../constants/config';

interface BlockViewProps {
    block: Block;
    cellSize: number;
    gap: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDragMove: (id: string, dr: number, dc: number) => void;
}

/**
 * A draggable block piece with ancient Chinese ink-painting aesthetic.
 * Supports both mouse and touch drag interactions.
 */
export function BlockView({
    block,
    cellSize,
    gap,
    isSelected,
    onSelect,
    onDragMove,
}: BlockViewProps) {
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const isDraggingRef = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Calculate pixel dimensions and position
    const width = block.width * cellSize + (block.width - 1) * gap;
    const height = block.height * cellSize + (block.height - 1) * gap;
    const left = block.col * (cellSize + gap);
    const top = block.row * (cellSize + gap);

    const colors = BLOCK_COLORS[block.type];

    // Determine font size based on block dimensions
    const isKing = block.type === 'king';
    const fontSize = isKing
        ? 'text-2xl'
        : block.width >= 2 || block.height >= 2
            ? 'text-lg'
            : 'text-sm';

    // Compute drag direction from start to end coordinates
    const computeDrag = useCallback(
        (endX: number, endY: number) => {
            if (!dragStartRef.current) return;
            const dx = endX - dragStartRef.current.x;
            const dy = endY - dragStartRef.current.y;
            const threshold = cellSize * 0.25;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > threshold) {
                    onDragMove(block.id, 0, dx > 0 ? 1 : -1);
                }
            } else {
                if (Math.abs(dy) > threshold) {
                    onDragMove(block.id, dy > 0 ? 1 : -1, 0);
                }
            }
        },
        [block.id, cellSize, onDragMove],
    );

    // --- Mouse event handlers ---
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            onSelect(block.id);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            isDraggingRef.current = true;

            const handleMouseMove = (_ev: MouseEvent) => {
                // Dragging visual state managed by CSS active pseudo-class
            };

            const handleMouseUp = (ev: MouseEvent) => {
                if (isDraggingRef.current) {
                    computeDrag(ev.clientX, ev.clientY);
                }
                isDraggingRef.current = false;
                dragStartRef.current = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [block.id, onSelect, computeDrag],
    );

    // --- Touch event handlers ---
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            const touch = e.touches[0];
            onSelect(block.id);
            dragStartRef.current = { x: touch.clientX, y: touch.clientY };
            isDraggingRef.current = true;
        },
        [block.id, onSelect],
    );

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        // Prevent page scrolling while dragging a block
        e.preventDefault();
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (isDraggingRef.current && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                computeDrag(touch.clientX, touch.clientY);
            }
            isDraggingRef.current = false;
            dragStartRef.current = null;
        },
        [computeDrag],
    );

    return (
        <div
            ref={elementRef}
            className={`absolute rounded-lg border-2 cursor-grab active:cursor-grabbing
                flex items-center justify-center font-bold select-none
                shadow-lg transition-all
                ${colors.bg} ${colors.border} ${colors.text} ${colors.shadow}
                ${isSelected ? 'ring-2 ring-yellow-400/80 ring-offset-1 ring-offset-transparent z-20 scale-[1.02]' : 'z-10'}
                ${isKing ? 'border-[3px] shadow-xl' : ''}
                hover:brightness-110 active:scale-[1.04] active:shadow-2xl active:z-30
            `}
            style={{
                width,
                height,
                left,
                top,
                transition: `left ${MOVE_DURATION}ms ease-out, top ${MOVE_DURATION}ms ease-out, transform 100ms ease, box-shadow 100ms ease`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="button"
            tabIndex={0}
            aria-label={block.label}
        >
            {/* King block gets a special crown indicator */}
            {isKing && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-300/80 text-xs">
                    &#9819;
                </span>
            )}
            <span className={`${fontSize} drop-shadow-md tracking-wider`}>
                {block.label}
            </span>
            {/* Subtle ink-wash texture overlay */}
            <div className="absolute inset-0 rounded-lg opacity-10 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-black/20" />
        </div>
    );
}
