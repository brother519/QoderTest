'use client';

import { Block } from '../types/game';
import { BLOCK_STYLES, MOVE_DURATION } from '../constants/config';

interface BlockViewProps {
  block: Block;
  cellSize: number;
  gap: number;
  isSelected: boolean;
  isShaking: boolean;
  onSelect: (id: string) => void;
  onDragMove: (id: string, dr: number, dc: number) => void;
}

export function BlockView({
  block,
  cellSize,
  gap,
  isSelected,
  isShaking,
  onSelect,
  onDragMove,
}: BlockViewProps) {
  const width = block.size.width * cellSize + (block.size.width - 1) * gap;
  const height = block.size.height * cellSize + (block.size.height - 1) * gap;
  const left = block.position.col * (cellSize + gap);
  const top = block.position.row * (cellSize + gap);

  const style = BLOCK_STYLES[block.type];
  const fontSize =
    block.size.width >= 2 && block.size.height >= 2
      ? 'text-2xl'
      : block.size.width >= 2 || block.size.height >= 2
        ? 'text-lg'
        : 'text-sm';

  let dragStartX = 0;
  let dragStartY = 0;
  let dragging = false;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onSelect(block.id);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const threshold = cellSize * 0.3;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        onDragMove(block.id, 0, dx > 0 ? 1 : -1);
      }
    } else {
      if (Math.abs(dy) > threshold) {
        onDragMove(block.id, dy > 0 ? 1 : -1, 0);
      }
    }
  };

  return (
    <div
      className={`absolute rounded-lg border-2 cursor-grab active:cursor-grabbing
        flex items-center justify-center font-bold select-none
        shadow-md transition-all
        ${style}
        ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent z-10' : ''}
        ${isShaking ? 'animate-shake' : ''}
      `}
      style={{
        width,
        height,
        left,
        top,
        transition: `left ${MOVE_DURATION}ms ease-out, top ${MOVE_DURATION}ms ease-out`,
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      role="button"
      tabIndex={0}
      aria-label={block.label}
    >
      <span className={fontSize}>{block.label}</span>
    </div>
  );
}
