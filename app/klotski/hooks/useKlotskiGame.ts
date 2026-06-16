'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Block, KlotskiGameState, KlotskiStatus } from '../types/game';
import { BOARD_COLS, BOARD_ROWS, EXIT_ROW, EXIT_COL, BEST_STEPS_PREFIX, MOVE_DURATION } from '../constants/config';
import { LEVELS } from '../constants/levels';

function buildOccupancyGrid(blocks: Block[], excludeId?: string): boolean[][] {
  const grid: boolean[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(false)
  );
  for (const block of blocks) {
    if (block.id === excludeId) continue;
    for (let r = 0; r < block.size.height; r++) {
      for (let c = 0; c < block.size.width; c++) {
        grid[block.position.row + r][block.position.col + c] = true;
      }
    }
  }
  return grid;
}

function canMove(
  block: Block,
  dr: number,
  dc: number,
  grid: boolean[][]
): boolean {
  const newRow = block.position.row + dr;
  const newCol = block.position.col + dc;
  if (newRow < 0 || newRow + block.size.height > BOARD_ROWS) return false;
  if (newCol < 0 || newCol + block.size.width > BOARD_COLS) return false;
  for (let r = 0; r < block.size.height; r++) {
    for (let c = 0; c < block.size.width; c++) {
      if (grid[newRow + r][newCol + c]) return false;
    }
  }
  return true;
}

function checkWin(blocks: Block[]): boolean {
  const caocao = blocks.find((b) => b.id === 'caocao');
  if (!caocao) return false;
  return caocao.position.row === EXIT_ROW && caocao.position.col === EXIT_COL;
}

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => ({
    ...b,
    position: { ...b.position },
    size: { ...b.size },
  }));
}

function loadBestSteps(levelId: string): number | null {
  try {
    const val = localStorage.getItem(BEST_STEPS_PREFIX + levelId);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

function saveBestSteps(levelId: string, steps: number): void {
  try {
    const key = BEST_STEPS_PREFIX + levelId;
    const existing = localStorage.getItem(key);
    if (!existing || steps < parseInt(existing, 10)) {
      localStorage.setItem(key, String(steps));
    }
  } catch {
    // ignore
  }
}

export function useKlotskiGame() {
  const [status, setStatus] = useState<KlotskiStatus>('selecting');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState<Block[][]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [bestStepsMap, setBestStepsMap] = useState<Record<string, number | null>>({});
  const [shakingBlockId, setShakingBlockId] = useState<string | null>(null);
  const [wonLevelId, setWonLevelId] = useState<string | null>(null);

  const blocksRef = useRef(blocks);
  const stepsRef = useRef(steps);
  const statusRef = useRef(status);
  const lockRef = useRef(false);

  blocksRef.current = blocks;
  stepsRef.current = steps;
  statusRef.current = status;

  useEffect(() => {
    const map: Record<string, number | null> = {};
    for (const level of LEVELS) {
      map[level.id] = loadBestSteps(level.id);
    }
    setBestStepsMap(map);
  }, []);

  const startLevel = useCallback((levelId: string) => {
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level) return;
    const initialBlocks = cloneBlocks(level.blocks);
    setBlocks(initialBlocks);
    setSteps(0);
    setHistory([]);
    setSelectedBlockId(null);
    setCurrentLevelId(levelId);
    setStatus('playing');
    setShakingBlockId(null);
    setWonLevelId(null);
  }, []);

  const goBackToSelect = useCallback(() => {
    setStatus('selecting');
    setCurrentLevelId(null);
    setSelectedBlockId(null);
    setBlocks([]);
    setSteps(0);
    setHistory([]);
  }, []);

  const moveBlock = useCallback(
    (blockId: string, dr: number, dc: number): boolean => {
      if (statusRef.current !== 'playing' || lockRef.current) return false;

      const currentBlocks = blocksRef.current;
      const block = currentBlocks.find((b) => b.id === blockId);
      if (!block) return false;

      const grid = buildOccupancyGrid(currentBlocks, blockId);

      if (!canMove(block, dr, dc, grid)) {
        setShakingBlockId(blockId);
        setTimeout(() => setShakingBlockId(null), 300);
        return false;
      }

      lockRef.current = true;

      const prevBlocks = cloneBlocks(currentBlocks);
      const newBlocks = cloneBlocks(currentBlocks);
      const target = newBlocks.find((b) => b.id === blockId)!;
      target.position = {
        row: target.position.row + dr,
        col: target.position.col + dc,
      };

      setHistory((prev) => [...prev, prevBlocks]);
      setBlocks(newBlocks);
      setSteps((s) => s + 1);

      if (checkWin(newBlocks)) {
        const newSteps = stepsRef.current + 1;
        setStatus('won');
        setWonLevelId(currentLevelId);
        if (currentLevelId) {
          saveBestSteps(currentLevelId, newSteps);
          setBestStepsMap((prev) => {
            const existing = prev[currentLevelId];
            if (existing === null || newSteps < existing) {
              return { ...prev, [currentLevelId]: newSteps };
            }
            return prev;
          });
        }
      }

      setTimeout(() => {
        lockRef.current = false;
      }, MOVE_DURATION);

      return true;
    },
    [currentLevelId]
  );

  const undo = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setBlocks(last);
      setSteps((s) => s - 1);
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    if (!currentLevelId) return;
    startLevel(currentLevelId);
  }, [currentLevelId, startLevel]);

  const selectBlock = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
  }, []);

  const moveSelected = useCallback(
    (dr: number, dc: number) => {
      if (!selectedBlockId) return false;
      return moveBlock(selectedBlockId, dr, dc);
    },
    [selectedBlockId, moveBlock]
  );

  const dragMove = useCallback(
    (blockId: string, dr: number, dc: number) => {
      return moveBlock(blockId, dr, dc);
    },
    [moveBlock]
  );

  return {
    status,
    blocks,
    steps,
    history,
    selectedBlockId,
    currentLevelId,
    bestStepsMap,
    shakingBlockId,
    wonLevelId,
    startLevel,
    goBackToSelect,
    moveBlock,
    dragMove,
    undo,
    reset,
    selectBlock,
    moveSelected,
    canUndo: history.length > 0,
  };
}
