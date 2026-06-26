'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Cell, Position } from '../types/game';
import { FLOW_COLORS, ENDPOINT_RADIUS, PATH_WIDTH } from '../constants/config';

interface FlowBoardProps {
  board: Cell[][];
  paths: Map<number, Position[]>;
  completedColors: Set<number>;
  disabled: boolean;
  onStartDrawing: (row: number, col: number) => void;
  onExtendPath: (row: number, col: number) => void;
  onEndDrawing: () => void;
}

// Board styling constants
const BOARD_BG = '#1a1a2e';
const GRID_LINE_COLOR = '#2a2a4a';
const PADDING = 2;

export default function FlowBoard({
  board,
  paths,
  completedColors,
  disabled,
  onStartDrawing,
  onExtendPath,
  onEndDrawing,
}: FlowBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(50);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);

  const gridSize = board.length;
  const svgSize = gridSize * cellSize + PADDING * 2;

  // Responsive cell size based on container width
  useEffect(() => {
    if (!containerRef.current || gridSize === 0) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const maxSize = Math.min(containerWidth - 16, 500);
        const newCellSize = Math.floor((maxSize - PADDING * 2) / gridSize);
        setCellSize(Math.max(30, Math.min(60, newCellSize)));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [gridSize]);

  // Convert mouse/touch event to grid coordinates
  const getGridPosition = useCallback(
    (clientX: number, clientY: number): { row: number; col: number } | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - PADDING;
      const y = clientY - rect.top - PADDING;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
      return { row, col };
    },
    [cellSize, gridSize]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      const pos = getGridPosition(e.clientX, e.clientY);
      if (pos) {
        lastCellRef.current = pos;
        onStartDrawing(pos.row, pos.col);
      }
    },
    [disabled, getGridPosition, onStartDrawing]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      const pos = getGridPosition(e.clientX, e.clientY);
      if (!pos) return;
      // Only trigger if we moved to a new cell
      if (lastCellRef.current && lastCellRef.current.row === pos.row && lastCellRef.current.col === pos.col) {
        return;
      }
      lastCellRef.current = pos;
      onExtendPath(pos.row, pos.col);
    },
    [disabled, getGridPosition, onExtendPath]
  );

  const handleMouseUp = useCallback(() => {
    if (disabled) return;
    lastCellRef.current = null;
    onEndDrawing();
  }, [disabled, onEndDrawing]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getGridPosition(touch.clientX, touch.clientY);
      if (pos) {
        lastCellRef.current = pos;
        onStartDrawing(pos.row, pos.col);
      }
    },
    [disabled, getGridPosition, onStartDrawing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getGridPosition(touch.clientX, touch.clientY);
      if (!pos) return;
      if (lastCellRef.current && lastCellRef.current.row === pos.row && lastCellRef.current.col === pos.col) {
        return;
      }
      lastCellRef.current = pos;
      onExtendPath(pos.row, pos.col);
    },
    [disabled, getGridPosition, onExtendPath]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    lastCellRef.current = null;
    onEndDrawing();
  }, [disabled, onEndDrawing]);

  // Render grid lines
  const renderGridLines = () => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      lines.push(
        <line
          key={`h-${i}`}
          x1={PADDING}
          y1={PADDING + i * cellSize}
          x2={PADDING + gridSize * cellSize}
          y2={PADDING + i * cellSize}
          stroke={GRID_LINE_COLOR}
          strokeWidth={1}
        />
      );
      // Vertical lines
      lines.push(
        <line
          key={`v-${i}`}
          x1={PADDING + i * cellSize}
          y1={PADDING}
          x2={PADDING + i * cellSize}
          y2={PADDING + gridSize * cellSize}
          stroke={GRID_LINE_COLOR}
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  // Render endpoints as colored circles
  const renderEndpoints = () => {
    const circles: React.ReactNode[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = board[row][col];
        if (cell.isEndpoint && cell.colorId !== null) {
          const cx = PADDING + col * cellSize + cellSize / 2;
          const cy = PADDING + row * cellSize + cellSize / 2;
          const r = cellSize * ENDPOINT_RADIUS;
          const color = FLOW_COLORS[cell.colorId] || '#ffffff';
          circles.push(
            <circle
              key={`ep-${row}-${col}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              stroke={color}
              strokeWidth={2}
              opacity={0.95}
            />
          );
        }
      }
    }
    return circles;
  };

  // Render paths as polylines
  const renderPaths = () => {
    const pathElements: React.ReactNode[] = [];
    paths.forEach((positions, colorId) => {
      if (positions.length < 2) return;
      const color = FLOW_COLORS[colorId] || '#ffffff';
      const isCompleted = completedColors.has(colorId);
      const lineWidth = cellSize * PATH_WIDTH;

      // Build polyline points
      const points = positions
        .map((pos) => {
          const x = PADDING + pos.col * cellSize + cellSize / 2;
          const y = PADDING + pos.row * cellSize + cellSize / 2;
          return `${x},${y}`;
        })
        .join(' ');

      // Glow filter for completed paths
      if (isCompleted) {
        pathElements.push(
          <polyline
            key={`glow-${colorId}`}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={lineWidth + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
        );
      }

      pathElements.push(
        <polyline
          key={`path-${colorId}`}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isCompleted ? 1 : 0.8}
        />
      );
    });
    return pathElements;
  };

  // Render single-cell path indicators (dots at start)
  const renderPathDots = () => {
    const dots: React.ReactNode[] = [];
    paths.forEach((positions, colorId) => {
      if (positions.length !== 1) return;
      const pos = positions[0];
      const cell = board[pos.row]?.[pos.col];
      // Don't render dot if it's already an endpoint
      if (cell?.isEndpoint) return;
      const cx = PADDING + pos.col * cellSize + cellSize / 2;
      const cy = PADDING + pos.row * cellSize + cellSize / 2;
      const color = FLOW_COLORS[colorId] || '#ffffff';
      dots.push(
        <circle
          key={`dot-${colorId}`}
          cx={cx}
          cy={cy}
          r={cellSize * 0.15}
          fill={color}
          opacity={0.6}
        />
      );
    });
    return dots;
  };

  if (gridSize === 0) return null;

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg
        ref={svgRef}
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="select-none touch-none rounded-lg shadow-lg"
        style={{ background: BOARD_BG }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderGridLines()}
        {renderPaths()}
        {renderPathDots()}
        {renderEndpoints()}
      </svg>
    </div>
  );
}
