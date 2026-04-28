/**
 * 俄罗斯方块游戏核心逻辑 Hook
 *
 * 管理方块的下落、移动、旋转、碰撞检测、消行计算和等级递增。
 * 使用 Ref 同步模式避免 setInterval 闭包陷阱，所有暴露方法用 useCallback 包裹。
 *
 * @module tetris/hooks/useTetrisGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

/** 所有方块类型列表，用于随机生成 */
const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * 创建空棋盘
 *
 * @param rows - 行数
 * @param cols - 列数
 * @returns 填满 null 的二维数组
 */
function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

/**
 * 随机生成方块类型
 *
 * @returns 随机的 TetrominoType
 */
function randomType(): TetrominoType {
  return ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
}

/**
 * 检测方块在指定位置是否与棋盘发生碰撞
 *
 * 遍历方块矩阵中所有实心格，检查：
 * 1. 是否超出棋盘左右/下边界
 * 2. 是否与已锁定方块重叠
 *
 * @param board - 当前棋盘
 * @param piece - 方块类型
 * @param rotation - 旋转状态
 * @param position - 目标位置
 * @param cols - 棋盘列数
 * @param rows - 棋盘行数
 * @returns true 表示有碰撞，false 表示无碰撞
 */
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
        // 超出左右下边界
        if (boardX < 0 || boardX >= cols || boardY >= rows) return true;
        // 超出顶部不算碰撞（允许方块在顶部以上生成）
        if (boardY < 0) continue;
        // 与已锁定方块重叠
        if (board[boardY][boardX] !== null) return true;
      }
    }
  }
  return false;
}

/**
 * 将当前活动方块锁定到棋盘
 *
 * 遍历方块矩阵，将实心格对应的颜色写入 board 数组。
 *
 * @param board - 当前棋盘
 * @param piece - 活动方块
 * @param cols - 棋盘列数
 * @param rows - 棋盘行数
 * @returns 锁定后的新棋盘
 */
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

/**
 * 检查并消除满行
 *
 * 扫描棋盘所有行，将完全填满的行移除，
 * 在顶部补充相应数量的空行。
 *
 * @param board - 当前棋盘
 * @param cols - 棋盘列数
 * @param rows - 棋盘行数
 * @returns [新棋盘, 消除行数]
 */
function clearLines(board: Board, cols: number, rows: number): [Board, number] {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const clearedCount = rows - newBoard.length;
  const emptyRows = Array.from({ length: clearedCount }, () =>
    Array(cols).fill(null)
  );
  return [[...emptyRows, ...newBoard], clearedCount];
}

/**
 * 获取指定等级的下落速度
 *
 * @param level - 当前等级
 * @returns 下落间隔（毫秒）
 */
function getSpeedForLevel(level: number): number {
  return LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
}

/**
 * 俄罗斯方块核心游戏 Hook
 *
 * @param config - 游戏配置
 * @returns 游戏状态和操作方法
 */
export function useTetrisGame(config: GameConfig): UseTetrisGameReturn {
  const { cols, rows } = config;

  // 内部状态
  const [board, setBoard] = useState<Board>(() => createEmptyBoard(rows, cols));
  const [currentPiece, setCurrentPiece] = useState<ActivePiece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>(() => randomType());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [highScore, updateHighScore] = useHighScore('tetrisHighScore');

  // 使用 ref 避免 setInterval 闭包捕获旧值
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceTypeRef = useRef(nextPieceType);
  const scoreRef = useRef(score);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);
  const statusRef = useRef(status);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 同步 ref
  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  nextPieceTypeRef.current = nextPieceType;
  scoreRef.current = score;
  levelRef.current = level;
  linesRef.current = lines;
  statusRef.current = status;

  /** 停止游戏循环 */
  const stopLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  /** 游戏结束处理 */
  const handleGameOver = useCallback(() => {
    stopLoop();
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [stopLoop, updateHighScore]);

  /**
   * 生成新方块
   *
   * 1. 将 nextPieceType 作为当前方块
   * 2. 随机生成新的 nextPieceType
   * 3. 初始位置：水平居中，y = 0（从顶部进入）
   * 4. 如果初始位置就碰撞 → 游戏结束
   */
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

  /**
   * 更新得分和等级
   *
   * 得分公式：LINE_SCORES[行数] × 等级
   * 等级公式：Math.floor(总消行数 / LINES_PER_LEVEL) + 1
   */
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
        // 等级变化时重启游戏循环（调整速度）
        stopLoop();
        const speed = getSpeedForLevel(newLevel);
        gameLoopRef.current = setInterval(() => {
          tickRef.current();
        }, speed);
      }
    },
    [stopLoop]
  );

  /**
   * 游戏主循环 - 每个时间间隔执行一次
   *
   * 流程：
   * 1. 检查当前方块能否向下移动一格
   * 2. 如果能 → 更新 position.y + 1
   * 3. 如果不能 → 锁定方块到棋盘 → 消行检查 → 更新得分 → 生成新方块
   * 4. 新方块生成后如果立即碰撞 → 游戏结束
   */
  const tick = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const piece = currentPieceRef.current;
    if (!piece) return;

    const newPos = { x: piece.position.x, y: piece.position.y + 1 };

    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      // 可以下落
      setCurrentPiece({ ...piece, position: newPos });
    } else {
      // 不能下落，锁定方块
      const lockedBoard = lockPiece(boardRef.current, piece, cols, rows);
      const [clearedBoard, clearedCount] = clearLines(lockedBoard, cols, rows);
      setBoard(clearedBoard);

      // 需要先更新 boardRef 再生成新方块
      boardRef.current = clearedBoard;

      updateScoreAndLevel(clearedCount);
      spawnNewPiece();
    }
  }, [cols, rows, updateScoreAndLevel, spawnNewPiece]);

  // tick 的 ref，用于 setInterval 中引用最新的 tick
  const tickRef = useRef(tick);
  tickRef.current = tick;

  /** 启动游戏循环 */
  const startLoop = useCallback(
    (currentLevel: number) => {
      stopLoop();
      const speed = getSpeedForLevel(currentLevel);
      gameLoopRef.current = setInterval(() => {
        tickRef.current();
      }, speed);
    },
    [stopLoop]
  );

  /** 开始游戏 */
  const start = useCallback(() => {
    // 生成第一个方块
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
    startLoop(1);
  }, [cols, startLoop]);

  /** 暂停/继续 */
  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      stopLoop();
      setStatus('paused');
    } else if (statusRef.current === 'paused') {
      setStatus('playing');
      startLoop(levelRef.current);
    }
  }, [stopLoop, startLoop]);

  /** 重新开始 */
  const restart = useCallback(() => {
    stopLoop();
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
    startLoop(1);
  }, [cols, rows, stopLoop, startLoop]);

  /** 左移 */
  const moveLeft = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

    const newPos = { x: piece.position.x - 1, y: piece.position.y };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    }
  }, [cols, rows]);

  /** 右移 */
  const moveRight = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

    const newPos = { x: piece.position.x + 1, y: piece.position.y };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    }
  }, [cols, rows]);

  /**
   * 顺时针旋转方块
   *
   * 使用预定义旋转状态（shapes 数组），索引循环 0→1→2→3→0。
   * 旋转后如果发生碰撞，则不执行旋转（简单旋转系统，不做 wall kick）。
   */
  const rotate = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

    const newRotation = (piece.rotation + 1) % 4;
    if (!hasCollision(boardRef.current, piece.type, newRotation, piece.position, cols, rows)) {
      setCurrentPiece({ ...piece, rotation: newRotation });
    }
  }, [cols, rows]);

  /**
   * 软降 - 加速下落一格
   *
   * 每软降一格加 SOFT_DROP_SCORE 分
   */
  const softDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

    const newPos = { x: piece.position.x, y: piece.position.y + 1 };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
      setScore((prev) => prev + SOFT_DROP_SCORE);
    }
  }, [cols, rows]);

  /**
   * 硬降 - 方块直接落到最底部
   *
   * 逐行向下检测直到碰撞，计算落下的格数用于加分。
   * 加分 = 落下格数 × HARD_DROP_SCORE
   */
  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

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

    // 加分
    setScore((prev) => prev + dropDistance * HARD_DROP_SCORE);

    // 锁定
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
  }, [cols, rows, updateScoreAndLevel, spawnNewPiece]);

  /** 组件卸载时清理游戏循环 */
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

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
