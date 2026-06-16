/**
 * 俄罗斯方块游戏核心逻辑 Hook
 *
 * 管理方块的下落、移动、旋转、碰撞检测、消行计算和等级递增。
 * 使用 useIntervalLoop 管理游戏循环，Ref 同步模式避免闭包陷阱。
 *
 * @module tetris/hooks/useTetrisGame
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
  TetrominoType,
  GameStatus,
  ActivePiece,
  Board,
  GameConfig,
  UseTetrisGameReturn,
} from '../types/game';
import {
  TETROMINOES,
  LINE_SCORES,
  SOFT_DROP_SCORE,
  HARD_DROP_SCORE,
  LEVEL_SPEEDS,
  LINES_PER_LEVEL,
} from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';
import { useIntervalLoop } from '@/lib/hooks/useIntervalLoop';

const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function randomType(): TetrominoType {
  return ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
}

function hasCollision(
  board: Board,
  piece: TetrominoType,
  rotation: number,
  position: { x: number; y: number },
  cols: number,
  rows: number
): boolean {
  const shape = TETROMINOES[piece].shapes[rotation];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = position.x + col;
        const boardY = position.y + row;
        if (boardX < 0 || boardX >= cols || boardY >= rows) return true;
        if (boardY < 0) continue;
        if (board[boardY][boardX] !== null) return true;
      }
    }
  }
  return false;
}

function lockPiece(board: Board, piece: ActivePiece, cols: number, rows: number): Board {
  const newBoard = board.map((row) => [...row]);
  const shape = TETROMINOES[piece.type].shapes[piece.rotation];
  const color = TETROMINOES[piece.type].color;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardY = piece.position.y + row;
        const boardX = piece.position.x + col;
        if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols) {
          newBoard[boardY][boardX] = color;
        }
      }
    }
  }
  return newBoard;
}

function clearLines(board: Board, cols: number, rows: number): [Board, number] {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const clearedCount = rows - newBoard.length;
  const emptyRows = Array.from({ length: clearedCount }, () =>
    Array(cols).fill(null)
  );
  return [[...emptyRows, ...newBoard], clearedCount];
}

function getSpeedForLevel(level: number): number {
  return LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
}

export function useTetrisGame(config: GameConfig): UseTetrisGameReturn {
  const { cols, rows } = config;

  const [board, setBoard] = useState<Board>(() => createEmptyBoard(rows, cols));
  const [currentPiece, setCurrentPiece] = useState<ActivePiece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>(() => randomType());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [highScore, updateHighScore] = useHighScore('tetrisHighScore');

  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceTypeRef = useRef(nextPieceType);
  const scoreRef = useRef(score);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);

  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  nextPieceTypeRef.current = nextPieceType;
  scoreRef.current = score;
  levelRef.current = level;
  linesRef.current = lines;

  const handleGameOver = useCallback(() => {
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [updateHighScore]);

  const spawnNewPiece = useCallback(() => {
    const type = nextPieceTypeRef.current;
    const shape = TETROMINOES[type].shapes[0];
    const startX = Math.floor((cols - shape[0].length) / 2);
    const startY = 0;

    if (hasCollision(boardRef.current, type, 0, { x: startX, y: startY }, cols, rows)) {
      handleGameOver();
      return;
    }

    const newPiece: ActivePiece = {
      type,
      rotation: 0,
      position: { x: startX, y: startY },
    };

    setCurrentPiece(newPiece);
    const newNext = randomType();
    setNextPieceType(newNext);
  }, [cols, rows, handleGameOver]);

  const updateScoreAndLevel = useCallback(
    (clearedCount: number) => {
      if (clearedCount === 0) return;

      const baseScore = LINE_SCORES[clearedCount] || 0;
      const newScore = scoreRef.current + baseScore * levelRef.current;
      const newTotalLines = linesRef.current + clearedCount;
      const newLevel = Math.floor(newTotalLines / LINES_PER_LEVEL) + 1;

      setScore(newScore);
      setLines(newTotalLines);

      if (newLevel !== levelRef.current) {
        setLevel(newLevel);
      }
    },
    []
  );

  const tick = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;

    const newPos = { x: piece.position.x, y: piece.position.y + 1 };

    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    } else {
      const lockedBoard = lockPiece(boardRef.current, piece, cols, rows);
      const [clearedBoard, clearedCount] = clearLines(lockedBoard, cols, rows);
      setBoard(clearedBoard);
      boardRef.current = clearedBoard;

      updateScoreAndLevel(clearedCount);
      spawnNewPiece();
    }
  }, [cols, rows, updateScoreAndLevel, spawnNewPiece]);

  useIntervalLoop(tick, getSpeedForLevel(level), status === 'playing');

  const start = useCallback(() => {
    const type = nextPieceTypeRef.current;
    const shape = TETROMINOES[type].shapes[0];
    const startX = Math.floor((cols - shape[0].length) / 2);

    const newPiece: ActivePiece = {
      type,
      rotation: 0,
      position: { x: startX, y: 0 },
    };

    setCurrentPiece(newPiece);
    const newNext = randomType();
    setNextPieceType(newNext);

    setStatus('playing');
  }, [cols]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    }
  }, [status]);

  const restart = useCallback(() => {
    const newBoard = createEmptyBoard(rows, cols);
    setBoard(newBoard);
    boardRef.current = newBoard;
    setScore(0);
    setLevel(1);
    setLines(0);

    const type = randomType();
    const shape = TETROMINOES[type].shapes[0];
    const startX = Math.floor((cols - shape[0].length) / 2);

    const newPiece: ActivePiece = {
      type,
      rotation: 0,
      position: { x: startX, y: 0 },
    };

    setCurrentPiece(newPiece);
    const newNext = randomType();
    setNextPieceType(newNext);

    setStatus('playing');
  }, [cols, rows]);

  const moveLeft = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== 'playing') return;

    const newPos = { x: piece.position.x - 1, y: piece.position.y };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    }
  }, [cols, rows, status]);

  const moveRight = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== 'playing') return;

    const newPos = { x: piece.position.x + 1, y: piece.position.y };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    }
  }, [cols, rows, status]);

  const rotate = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== 'playing') return;

    const newRotation = (piece.rotation + 1) % 4;
    if (!hasCollision(boardRef.current, piece.type, newRotation, piece.position, cols, rows)) {
      setCurrentPiece({ ...piece, rotation: newRotation });
    }
  }, [cols, rows, status]);

  const softDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== 'playing') return;

    const newPos = { x: piece.position.x, y: piece.position.y + 1 };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
      setScore((prev) => prev + SOFT_DROP_SCORE);
    }
  }, [cols, rows, status]);

  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || status !== 'playing') return;

    let dropDistance = 0;
    let newY = piece.position.y;

    while (
      !hasCollision(
        boardRef.current,
        piece.type,
        piece.rotation,
        { x: piece.position.x, y: newY + 1 },
        cols,
        rows
      )
    ) {
      newY++;
      dropDistance++;
    }

    setScore((prev) => prev + dropDistance * HARD_DROP_SCORE);

    const droppedPiece: ActivePiece = {
      ...piece,
      position: { x: piece.position.x, y: newY },
    };
    const lockedBoard = lockPiece(boardRef.current, droppedPiece, cols, rows);
    const [clearedBoard, clearedCount] = clearLines(lockedBoard, cols, rows);
    setBoard(clearedBoard);
    boardRef.current = clearedBoard;

    updateScoreAndLevel(clearedCount);
    spawnNewPiece();
  }, [cols, rows, updateScoreAndLevel, spawnNewPiece, status]);

  return {
    board,
    currentPiece,
    nextPiece: nextPieceType,
    score,
    level,
    lines,
    status,
    highScore,
    start,
    togglePause,
    restart,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
  };
}
