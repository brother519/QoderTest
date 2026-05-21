/**
 * 扫雷游戏核心逻辑 Hook
 *
 * @module minesweeper/hooks/useMinesweeperGame
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BEST_TIME_STORAGE_KEY,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  DIFFICULTY_ORDER,
} from '../constants/config';
import type {
  BestTimeMap,
  Cell,
  Difficulty,
  DifficultyKey,
  GameStatus,
  GridPosition,
} from '../types/game';

/** Hook 返回值 */
export interface UseMinesweeperGameReturn {
  board: Cell[][];
  difficulty: Difficulty;
  difficultyKey: DifficultyKey;
  status: GameStatus;
  elapsedTime: number;
  bestTime: number | null;
  remainingMines: number;
  revealCell: (row: number, col: number) => void;
  toggleFlag: (row: number, col: number) => void;
  chordCell: (row: number, col: number) => void;
  restart: () => void;
  changeDifficulty: (difficultyKey: DifficultyKey) => void;
}

/** 创建空白单元格 */
function createEmptyCell(): Cell {
  return {
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0,
    isExploded: false,
  };
}

/** 创建空白棋盘 */
function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => createEmptyCell()));
}

/** 深拷贝棋盘 */
function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/** 获取周围 8 邻域坐标 */
function getNeighbors(row: number, col: number, rows: number, cols: number): GridPosition[] {
  const neighbors: GridPosition[] = [];

  for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
    for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
      if (deltaRow === 0 && deltaCol === 0) continue;

      const nextRow = row + deltaRow;
      const nextCol = col + deltaCol;

      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }
  }

  return neighbors;
}

/** 统计插旗数量 */
function countFlags(board: Cell[][]): number {
  return board.reduce(
    (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + (cell.isFlagged ? 1 : 0), 0),
    0
  );
}

/** 判断是否已胜利 */
function isVictory(board: Cell[][]): boolean {
  return board.every((row) => row.every((cell) => (cell.isMine ? true : cell.isRevealed)));
}

/** 揭示所有地雷 */
function revealAllMines(board: Cell[][], exploded: GridPosition): void {
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
      if (rowIndex === exploded.row && colIndex === exploded.col) {
        cell.isExploded = true;
      }
    });
  });
}

/** 将剩余地雷自动插旗 */
function flagRemainingMines(board: Cell[][]): void {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.isMine) {
        cell.isFlagged = true;
      }
    });
  });
}

/** 根据地雷分布计算相邻雷数 */
function fillAdjacentMines(board: Cell[][]): void {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMine) {
        cell.adjacentMines = 0;
        return;
      }

      cell.adjacentMines = getNeighbors(rowIndex, colIndex, rows, cols).reduce(
        (count, position) => count + (board[position.row][position.col].isMine ? 1 : 0),
        0
      );
    });
  });
}

/** 首次点击后生成真实棋盘，并保证点击点及周围 8 格安全 */
function createBoardWithMines(difficulty: Difficulty, firstClick: GridPosition, initialBoard: Cell[][]): Cell[][] {
  const board = cloneBoard(initialBoard);
  const safeZone = new Set<string>([
    `${firstClick.row}-${firstClick.col}`,
    ...getNeighbors(firstClick.row, firstClick.col, difficulty.rows, difficulty.cols).map(
      ({ row, col }) => `${row}-${col}`
    ),
  ]);
  const candidates: GridPosition[] = [];

  for (let row = 0; row < difficulty.rows; row++) {
    for (let col = 0; col < difficulty.cols; col++) {
      if (!safeZone.has(`${row}-${col}`)) {
        candidates.push({ row, col });
      }
    }
  }

  for (let index = candidates.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
  }

  candidates.slice(0, difficulty.mines).forEach(({ row, col }) => {
    board[row][col].isMine = true;
  });

  fillAdjacentMines(board);
  return board;
}

/** 从指定格子开始展开安全区域 */
function revealArea(board: Cell[][], start: GridPosition): boolean {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const startCell = board[start.row]?.[start.col];

  if (!startCell || startCell.isFlagged || startCell.isRevealed) {
    return false;
  }

  if (startCell.isMine) {
    startCell.isRevealed = true;
    return true;
  }

  const queue: GridPosition[] = [start];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const cell = board[current.row][current.col];
    if (cell.isRevealed || cell.isFlagged) {
      continue;
    }

    cell.isRevealed = true;

    if (cell.adjacentMines > 0) {
      continue;
    }

    getNeighbors(current.row, current.col, rows, cols).forEach((neighbor) => {
      const neighborCell = board[neighbor.row][neighbor.col];
      if (!neighborCell.isRevealed && !neighborCell.isFlagged && !neighborCell.isMine) {
        queue.push(neighbor);
      }
    });
  }

  return false;
}

/** 过滤并标准化最佳时间记录 */
function normalizeBestTimes(rawValue: unknown): BestTimeMap {
  if (!rawValue || typeof rawValue !== 'object') {
    return {};
  }

  const record = rawValue as Record<string, unknown>;
  const normalized: BestTimeMap = {};

  DIFFICULTY_ORDER.forEach((difficultyKey) => {
    const value = record[difficultyKey];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      normalized[difficultyKey] = Math.floor(value);
    }
  });

  return normalized;
}

export function useMinesweeperGame(
  initialDifficulty: DifficultyKey = DEFAULT_DIFFICULTY
): UseMinesweeperGameReturn {
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>(initialDifficulty);
  const [board, setBoard] = useState<Cell[][]>(() => {
    const difficulty = DIFFICULTIES[initialDifficulty];
    return createEmptyBoard(difficulty.rows, difficulty.cols);
  });
  const [status, setStatus] = useState<GameStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<BestTimeMap>({});

  const difficulty = DIFFICULTIES[difficultyKey];

  const boardRef = useRef(board);
  const statusRef = useRef(status);
  const elapsedTimeRef = useRef(elapsedTime);
  const difficultyRef = useRef(difficulty);
  const difficultyKeyRef = useRef(difficultyKey);

  boardRef.current = board;
  statusRef.current = status;
  elapsedTimeRef.current = elapsedTime;
  difficultyRef.current = difficulty;
  difficultyKeyRef.current = difficultyKey;

  /** 读取本地最佳时间 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_TIME_STORAGE_KEY);
      if (saved) {
        setBestTimes(normalizeBestTimes(JSON.parse(saved) as unknown));
      }
    } catch {
      // localStorage 不可用或数据损坏时回退为空对象
    }
  }, []);

  /** 仅在 playing 状态下累计时间 */
  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  /** 通用重置逻辑 */
  const resetGame = useCallback((nextDifficulty: Difficulty) => {
    setBoard(createEmptyBoard(nextDifficulty.rows, nextDifficulty.cols));
    setStatus('idle');
    setElapsedTime(0);
  }, []);

  /** 更新最佳时间（更短更优） */
  const updateBestTime = useCallback((nextTime: number, nextDifficultyKey: DifficultyKey) => {
    setBestTimes((previous) => {
      const current = previous[nextDifficultyKey];
      if (typeof current === 'number' && current > 0 && current <= nextTime) {
        return previous;
      }

      const nextRecord: BestTimeMap = {
        ...previous,
        [nextDifficultyKey]: nextTime,
      };

      try {
        localStorage.setItem(BEST_TIME_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch {
        // localStorage 不可用时忽略持久化失败
      }

      return nextRecord;
    });
  }, []);

  /** 胜利结算 */
  const finishWin = useCallback(
    (nextBoard: Cell[][]) => {
      flagRemainingMines(nextBoard);
      setBoard(nextBoard);
      setStatus('won');
      updateBestTime(Math.max(1, elapsedTimeRef.current), difficultyKeyRef.current);
    },
    [updateBestTime]
  );

  /** 左键揭开格子 */
  const revealCell = useCallback(
    (row: number, col: number) => {
      if (statusRef.current === 'won' || statusRef.current === 'lost') {
        return;
      }

      const currentBoard = boardRef.current;
      const currentCell = currentBoard[row]?.[col];

      if (!currentCell || currentCell.isRevealed || currentCell.isFlagged) {
        return;
      }

      const nextBoard =
        statusRef.current === 'idle'
          ? createBoardWithMines(difficultyRef.current, { row, col }, currentBoard)
          : cloneBoard(currentBoard);

      if (statusRef.current === 'idle') {
        setStatus('playing');
      }

      const hitMine = revealArea(nextBoard, { row, col });

      if (hitMine) {
        revealAllMines(nextBoard, { row, col });
        setBoard(nextBoard);
        setStatus('lost');
        return;
      }

      if (isVictory(nextBoard)) {
        finishWin(nextBoard);
        return;
      }

      setBoard(nextBoard);
    },
    [finishWin]
  );

  /** 右键/长按插旗 */
  const toggleFlag = useCallback((row: number, col: number) => {
    if (statusRef.current === 'won' || statusRef.current === 'lost') {
      return;
    }

    const currentBoard = boardRef.current;
    const currentCell = currentBoard[row]?.[col];

    if (!currentCell || currentCell.isRevealed) {
      return;
    }

    const nextBoard = cloneBoard(currentBoard);
    nextBoard[row][col].isFlagged = !nextBoard[row][col].isFlagged;
    setBoard(nextBoard);
  }, []);

  /** 双击数字格快速展开周围区域 */
  const chordCell = useCallback(
    (row: number, col: number) => {
      if (statusRef.current !== 'playing') {
        return;
      }

      const currentBoard = boardRef.current;
      const targetCell = currentBoard[row]?.[col];

      if (!targetCell || !targetCell.isRevealed || targetCell.adjacentMines <= 0) {
        return;
      }

      const nextBoard = cloneBoard(currentBoard);
      const neighbors = getNeighbors(row, col, nextBoard.length, nextBoard[0]?.length ?? 0);
      const flaggedNeighbors = neighbors.filter(
        (position) => nextBoard[position.row][position.col].isFlagged
      ).length;

      const unrevealedUnflagged = neighbors.filter(
        (position) => {
          const n = nextBoard[position.row][position.col];
          return !n.isFlagged && !n.isRevealed;
        }
      );

      // 当结果确定时自动标记，省去玩家手动标记明显地雷的操作
      const remainingMines = targetCell.adjacentMines - flaggedNeighbors;
      if (remainingMines > 0 && unrevealedUnflagged.length === remainingMines) {
        unrevealedUnflagged.forEach((position) => {
          nextBoard[position.row][position.col].isFlagged = true;
        });
        setBoard(nextBoard);
        return;
      }

      if (flaggedNeighbors !== targetCell.adjacentMines) {
        return;
      }

      let hitMine = false;

      neighbors.forEach((position) => {
        const neighbor = nextBoard[position.row][position.col];
        if (!neighbor.isFlagged && !neighbor.isRevealed) {
          hitMine = revealArea(nextBoard, position) || hitMine;
        }
      });

      if (hitMine) {
        revealAllMines(nextBoard, { row, col });
        setBoard(nextBoard);
        setStatus('lost');
        return;
      }

      if (isVictory(nextBoard)) {
        finishWin(nextBoard);
        return;
      }

      setBoard(nextBoard);
    },
    [finishWin]
  );

  /** 重新开始当前难度 */
  const restart = useCallback(() => {
    resetGame(difficultyRef.current);
  }, [resetGame]);

  /** 切换难度并重置棋盘 */
  const changeDifficulty = useCallback(
    (nextDifficultyKey: DifficultyKey) => {
      const nextDifficulty = DIFFICULTIES[nextDifficultyKey];
      setDifficultyKey(nextDifficultyKey);
      resetGame(nextDifficulty);
    },
    [resetGame]
  );

  return {
    board,
    difficulty,
    difficultyKey,
    status,
    elapsedTime,
    bestTime: bestTimes[difficultyKey] ?? null,
    remainingMines: difficulty.mines - countFlags(board),
    revealCell,
    toggleFlag,
    chordCell,
    restart,
    changeDifficulty,
  };
}
