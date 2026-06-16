'use client';

import { Block } from '../types/game';
import { BOARD_COLS, BOARD_ROWS, EXIT_ROW, EXIT_COL, EXIT_WIDTH, EXIT_HEIGHT } from '../constants/config';
import { BlockView } from './BlockView';

interface BoardProps {
  blocks: Block[];
  selectedBlockId: string | null;
  shakingBlockId: string | null;
  cellSize: number;
  gap: number;
  onSelectBlock: (id: string) => void;
  onDragMove: (id: string, dr: number, dc: number) => void;
}

export function Board({
  blocks,
  selectedBlockId,
  shakingBlockId,
  cellSize,
  gap,
  onSelectBlock,
  onDragMove,
}: BoardProps) {
  const boardWidth = BOARD_COLS * cellSize + (BOARD_COLS + 1) * gap;
  const boardHeight = BOARD_ROWS * cellSize + (BOARD_ROWS + 1) * gap;

  const exitLeft = EXIT_COL * (cellSize + gap) + gap;
  const exitTop = EXIT_ROW * (cellSize + gap) + gap;
  const exitWidth = EXIT_WIDTH * cellSize + (EXIT_WIDTH - 1) * gap;
  const exitHeight = EXIT_HEIGHT * cellSize + (EXIT_HEIGHT - 1) * gap;

  return (
    <div
      className="relative bg-stone-800 rounded-xl border-4 border-stone-600 shadow-2xl"
      style={{
        width: boardWidth,
        height: boardHeight,
        padding: gap,
      }}
    >
      {/* Background grid */}
      {Array.from({ length: BOARD_ROWS }).map((_, r) =>
        Array.from({ length: BOARD_COLS }).map((_, c) => (
          <div
            key={`cell-${r}-${c}`}
            className="absolute bg-stone-700/50 rounded"
            style={{
              width: cellSize,
              height: cellSize,
              left: c * (cellSize + gap) + gap,
              top: r * (cellSize + gap) + gap,
            }}
          />
        ))
      )}

      {/* Exit indicator */}
      <div
        className="absolute rounded border-2 border-dashed border-yellow-500/50 bg-yellow-500/10"
        style={{
          width: exitWidth,
          height: exitHeight,
          left: exitLeft,
          top: exitTop,
        }}
      />

      {/* Exit label */}
      <div
        className="absolute text-yellow-500/60 text-xs font-bold pointer-events-none"
        style={{
          left: exitLeft,
          top: exitTop + exitHeight + 4,
          width: exitWidth,
          textAlign: 'center',
        }}
      >
        出口
      </div>

      {/* Blocks */}
      {blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          cellSize={cellSize}
          gap={gap}
          isSelected={selectedBlockId === block.id}
          isShaking={shakingBlockId === block.id}
          onSelect={onSelectBlock}
          onDragMove={onDragMove}
        />
      ))}
    </div>
  );
}
