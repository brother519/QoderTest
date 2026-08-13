'use client';

import { useState, useCallback, useRef } from 'react';
import { Cell, Position, FlowFreeStatus, UseFlowFreeReturn, FlowPuzzle } from '../types/game';
import { getDifficultyForLevel, BASE_LEVEL_SCORE, CLEAR_PENALTY } from '../constants/config';
import { generatePuzzle, validateSolution } from '../utils/generator';
import { useHighScore } from '@/lib/hooks/useHighScore';

// Check if two positions are adjacent (no diagonal)
function isAdjacent(a: Position, b: Position): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return rowDiff + colDiff === 1;
}

// Check if two positions are equal
function posEquals(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// Create an empty board from a puzzle
function createBoard(puzzle: FlowPuzzle): Cell[][] {
  const board: Cell[][] = Array.from({ length: puzzle.size }, () =>
    Array.from({ length: puzzle.size }, () => ({
      type: 'empty' as const,
      colorId: null,
      isEndpoint: false,
    }))
  );

  // Place endpoints
  for (const ep of puzzle.endpoints) {
    board[ep.start.row][ep.start.col] = {
      type: 'endpoint',
      colorId: ep.colorId,
      isEndpoint: true,
    };
    board[ep.end.row][ep.end.col] = {
      type: 'endpoint',
      colorId: ep.colorId,
      isEndpoint: true,
    };
  }

  return board;
}

export function useFlowFree(): UseFlowFreeReturn {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [paths, setPaths] = useState<Map<number, Position[]>>(new Map());
  const [status, setStatus] = useState<FlowFreeStatus>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [currentColor, setCurrentColor] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completedColors, setCompletedColors] = useState<Set<number>>(new Set());

  const puzzleRef = useRef<FlowPuzzle | null>(null);
  const [highScore, updateHighScore] = useHighScore('flow-free');

  // Get total colors for current puzzle
  const totalColors = puzzleRef.current?.endpoints.length ?? 0;

  // Generate a new puzzle for the given level
  const generateLevel = useCallback((lvl: number) => {
    const config = getDifficultyForLevel(lvl);
    const puzzle = generatePuzzle(config.size, config.numColors);
    puzzleRef.current = puzzle;

    const newBoard = createBoard(puzzle);
    setBoard(newBoard);
    setPaths(new Map());
    setCompletedColors(new Set());
    setMoves(0);
    setCurrentColor(null);
    setIsDrawing(false);
  }, []);

  // Start a new game
  const start = useCallback(() => {
    setLevel(1);
    setScore(0);
    generateLevel(1);
    setStatus('playing');
  }, [generateLevel]);

  // Restart the current level
  const restart = useCallback(() => {
    if (!puzzleRef.current) return;
    const newBoard = createBoard(puzzleRef.current);
    setBoard(newBoard);
    setPaths(new Map());
    setCompletedColors(new Set());
    setMoves(0);
    setCurrentColor(null);
    setIsDrawing(false);
    setStatus('playing');
  }, []);

  // Advance to next level
  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    setLevel(newLevel);
    generateLevel(newLevel);
    setStatus('playing');
  }, [level, generateLevel]);

  // Check if a position is an endpoint of a given color
  const isEndpointOf = useCallback(
    (row: number, col: number, colorId: number): boolean => {
      if (!puzzleRef.current) return false;
      const ep = puzzleRef.current.endpoints.find((e) => e.colorId === colorId);
      if (!ep) return false;
      return posEquals(ep.start, { row, col }) || posEquals(ep.end, { row, col });
    },
    []
  );

  // Check if position belongs to a specific color's path
  const getPathIndexAt = useCallback(
    (row: number, col: number, colorId: number, currentPaths: Map<number, Position[]>): number => {
      const path = currentPaths.get(colorId);
      if (!path) return -1;
      return path.findIndex((p) => p.row === row && p.col === col);
    },
    []
  );

  // Get color at a position (from board endpoints or paths)
  const getColorAt = useCallback(
    (row: number, col: number, currentBoard: Cell[][], currentPaths: Map<number, Position[]>): number | null => {
      // Check endpoints first
      const cell = currentBoard[row]?.[col];
      if (cell?.isEndpoint && cell.colorId !== null) return cell.colorId;
      // Check paths
      let foundColor: number | null = null;
      currentPaths.forEach((path, colorId) => {
        if (path.some((p: Position) => p.row === row && p.col === col)) {
          foundColor = colorId;
        }
      });
      return foundColor;
    },
    []
  );

  // Check win condition
  const checkWin = useCallback(
    (currentPaths: Map<number, Position[]>): boolean => {
      if (!puzzleRef.current) return false;
      return validateSolution(puzzleRef.current.size, puzzleRef.current.endpoints, currentPaths);
    },
    []
  );

  // Update completed colors set
  const updateCompletedColors = useCallback(
    (currentPaths: Map<number, Position[]>): Set<number> => {
      if (!puzzleRef.current) return new Set();
      const completed = new Set<number>();
      for (const ep of puzzleRef.current.endpoints) {
        const path = currentPaths.get(ep.colorId);
        if (!path || path.length < 2) continue;
        const pathStart = path[0];
        const pathEnd = path[path.length - 1];
        const connectsForward =
          posEquals(pathStart, ep.start) && posEquals(pathEnd, ep.end);
        const connectsBackward =
          posEquals(pathStart, ep.end) && posEquals(pathEnd, ep.start);
        if (connectsForward || connectsBackward) {
          completed.add(ep.colorId);
        }
      }
      return completed;
    },
    []
  );

  // Start drawing from a cell
  const startDrawing = useCallback(
    (row: number, col: number) => {
      if (status !== 'playing') return;

      const cell = board[row]?.[col];
      if (!cell) return;

      let colorId: number | null = null;

      // Case 1: Clicking on an endpoint
      if (cell.isEndpoint && cell.colorId !== null) {
        colorId = cell.colorId;
        const existingPath = paths.get(colorId);

        if (existingPath && existingPath.length > 0) {
          // If clicking on the start of existing path, clear it and start fresh
          const pathStart = existingPath[0];
          const pathEnd = existingPath[existingPath.length - 1];

          if (posEquals(pathStart, { row, col })) {
            // Start fresh from this endpoint
            const newPaths = new Map(paths);
            newPaths.set(colorId, [{ row, col }]);
            setPaths(newPaths);
          } else if (posEquals(pathEnd, { row, col })) {
            // Reverse path and start extending from this end
            const newPaths = new Map(paths);
            newPaths.set(colorId, [...existingPath].reverse());
            setPaths(newPaths);
          } else {
            // Endpoint not in path yet, clear path and start fresh
            const newPaths = new Map(paths);
            newPaths.set(colorId, [{ row, col }]);
            setPaths(newPaths);
          }
        } else {
          // No existing path, start new
          const newPaths = new Map(paths);
          newPaths.set(colorId, [{ row, col }]);
          setPaths(newPaths);
        }

        setCurrentColor(colorId);
        setIsDrawing(true);
        setMoves((m) => m + 1);
        return;
      }

      // Case 2: Clicking on a cell that is part of an existing path
      colorId = getColorAt(row, col, board, paths);
      if (colorId !== null) {
        const pathIdx = getPathIndexAt(row, col, colorId, paths);
        if (pathIdx >= 0) {
          // Truncate path at this position (keep up to and including this cell)
          const existingPath = paths.get(colorId)!;
          const truncated = existingPath.slice(0, pathIdx + 1);
          const newPaths = new Map(paths);
          newPaths.set(colorId, truncated);
          setPaths(newPaths);

          setCurrentColor(colorId);
          setIsDrawing(true);
          setMoves((m) => m + 1);
          return;
        }
      }
    },
    [status, board, paths, getColorAt, getPathIndexAt]
  );

  // Extend the current drawing path
  const extendPath = useCallback(
    (row: number, col: number) => {
      if (!isDrawing || currentColor === null || status !== 'playing') return;

      const currentPath = paths.get(currentColor);
      if (!currentPath || currentPath.length === 0) return;

      const lastPos = currentPath[currentPath.length - 1];

      // Must be adjacent to last position
      if (!isAdjacent(lastPos, { row, col })) return;

      // Don't revisit current path (except allow backtracking one step)
      const existingIdx = currentPath.findIndex((p) => p.row === row && p.col === col);
      if (existingIdx >= 0) {
        // Allow backtracking: if the cell is the second-to-last, truncate
        if (existingIdx === currentPath.length - 2) {
          const newPaths = new Map(paths);
          newPaths.set(currentColor, currentPath.slice(0, existingIdx + 1));
          setPaths(newPaths);
        }
        return;
      }

      // Check if the target cell belongs to another color
      const targetCell = board[row]?.[col];
      if (!targetCell) return;

      // If it's an endpoint of a different color, cannot enter
      if (targetCell.isEndpoint && targetCell.colorId !== null && targetCell.colorId !== currentColor) {
        return;
      }

      // If it's in another color's path, cannot enter
      let blocked = false;
      paths.forEach((path, colorId) => {
        if (colorId === currentColor) return;
        if (path.some((p: Position) => p.row === row && p.col === col)) {
          blocked = true;
        }
      });
      if (blocked) return;

      // If it's the same color endpoint (the other endpoint), allow (completes the connection)
      // Add to path
      const newPath = [...currentPath, { row, col }];
      const newPaths = new Map(paths);
      newPaths.set(currentColor, newPath);
      setPaths(newPaths);

      // Check if this completes the color (reached the other endpoint)
      if (targetCell.isEndpoint && targetCell.colorId === currentColor) {
        const newCompleted = updateCompletedColors(newPaths);
        setCompletedColors(newCompleted);

        // Check if all colors completed and board is filled (win)
        if (checkWin(newPaths)) {
          const levelScore = Math.max(BASE_LEVEL_SCORE - moves * CLEAR_PENALTY, 10);
          const newScore = score + levelScore;
          setScore(newScore);
          updateHighScore(newScore);
          setStatus('won');
          setIsDrawing(false);
          setCurrentColor(null);
        }
      }
    },
    [isDrawing, currentColor, status, paths, board, moves, score, updateHighScore, checkWin, updateCompletedColors]
  );

  // End current drawing
  const endDrawing = useCallback(() => {
    if (!isDrawing) return;

    // Update completed colors when drawing ends
    const newCompleted = updateCompletedColors(paths);
    setCompletedColors(newCompleted);

    setIsDrawing(false);
    setCurrentColor(null);
  }, [isDrawing, paths, updateCompletedColors]);

  // Clear a specific color's path
  const clearPath = useCallback(
    (colorId: number) => {
      if (status !== 'playing') return;

      const newPaths = new Map(paths);
      newPaths.delete(colorId);
      setPaths(newPaths);

      const newCompleted = new Set(completedColors);
      newCompleted.delete(colorId);
      setCompletedColors(newCompleted);

      setMoves((m) => m + 1);
    },
    [status, paths, completedColors]
  );

  return {
    board,
    paths,
    status,
    level,
    score,
    moves,
    highScore,
    isDrawing,
    currentColor,
    completedColors,
    totalColors,
    start,
    restart,
    nextLevel,
    startDrawing,
    extendPath,
    endDrawing,
    clearPath,
  };
}
