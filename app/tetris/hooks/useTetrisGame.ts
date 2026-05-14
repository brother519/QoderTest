/**
 * 俄罗斯方块游戏核心逻辑 Hook
 * Tetris Game Core Logic Hook
 *
 * 管理方块的下落、移动、旋转、碰撞检测、消行计算和等级递增。
 * 使用 Ref 同步模式避免 setInterval 闭包陷阱，所有暴露方法用 useCallback 包裹。
 *
 * Manages piece falling, movement, rotation, collision detection, line clearing,
 * and level progression. Uses Ref sync pattern to avoid setInterval closure traps,
 * all exposed methods are wrapped with useCallback.
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

/** 所有方块类型列表，用于随机生成 / All piece types list, used for random generation */
const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * 创建空棋盘
 * Create an empty board
 *
 * @param rows - 行数 / Number of rows
 * @param cols - 列数 / Number of columns
 * @returns 填满 null 的二维数组 / 2D array filled with null
 */
function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

/**
 * 随机生成方块类型
 * Randomly generate a piece type
 *
 * @returns 随机的 TetrominoType / Random TetrominoType
 */
function randomType(): TetrominoType {
  return ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
}

/**
 * 检测方块在指定位置是否与棋盘发生碰撞
 * Check if a piece at a given position collides with the board
 *
 * 遍历方块矩阵中所有实心格，检查：
 * 1. 是否超出棋盘左右/下边界
 * 2. 是否与已锁定方块重叠
 *
 * Iterates all solid cells in the piece matrix, checking:
 * 1. Whether it exceeds board left/right/bottom boundaries
 * 2. Whether it overlaps with locked pieces
 *
 * @param board - 当前棋盘 / Current board
 * @param piece - 方块类型 / Piece type
 * @param rotation - 旋转状态 / Rotation state
 * @param position - 目标位置 / Target position
 * @param cols - 棋盘列数 / Board columns
 * @param rows - 棋盘行数 / Board rows
 * @returns true 表示有碰撞，false 表示无碰撞 / true = collision, false = no collision
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
        // 超出左右下边界 / Exceeds left/right/bottom boundaries
        if (boardX < 0 || boardX >= cols || boardY >= rows) return true;
        // 超出顶部不算碰撞（允许方块在顶部以上生成）
        // Above top is not collision (allows pieces to spawn above the top)
        if (boardY < 0) continue;
        // 与已锁定方块重叠 / Overlaps with locked pieces
        if (board[boardY][boardX] !== null) return true;
      }
    }
  }
  return false;
}

/**
 * 将当前活动方块锁定到棋盘
 * Lock the current active piece onto the board
 *
 * 遍历方块矩阵，将实心格对应的颜色写入 board 数组。
 * Iterates the piece matrix and writes solid cell colors into the board array.
 *
 * @param board - 当前棋盘 / Current board
 * @param piece - 活动方块 / Active piece
 * @param cols - 棋盘列数 / Board columns
 * @param rows - 棋盘行数 / Board rows
 * @returns 锁定后的新棋盘 / New board after locking
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
 * Check and clear full lines
 *
 * 扫描棋盘所有行，将完全填满的行移除，
 * 在顶部补充相应数量的空行。
 *
 * Scans all board rows, removes fully filled lines,
 * and prepends the corresponding number of empty rows at the top.
 *
 * @param board - 当前棋盘 / Current board
 * @param cols - 棋盘列数 / Board columns
 * @param rows - 棋盘行数 / Board rows
 * @returns [新棋盘, 消除行数] / [new board, lines cleared]
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
 * Get drop speed for a given level
 *
 * @param level - 当前等级 / Current level
 * @returns 下落间隔（毫秒） / Drop interval (ms)
 */
function getSpeedForLevel(level: number): number {
  return LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
}

/**
 * 俄罗斯方块核心游戏 Hook
 * Tetris Core Game Hook
 *
 * @param config - 游戏配置 / Game configuration
 * @returns 游戏状态和操作方法 / Game state and action methods
 */
export function useTetrisGame(config: GameConfig): UseTetrisGameReturn {
  const { cols, rows } = config;

  // 内部状态 / Internal state
  const [board, setBoard] = useState<Board>(() => createEmptyBoard(rows, cols));
  const [currentPiece, setCurrentPiece] = useState<ActivePiece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>(() => randomType());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [highScore, updateHighScore] = useHighScore('tetrisHighScore');

  // 使用 ref 避免 setInterval 闭包捕获旧值
  // Use refs to avoid setInterval closure capturing stale values
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceTypeRef = useRef(nextPieceType);
  const scoreRef = useRef(score);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);
  const statusRef = useRef(status);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 同步 ref / Sync refs
  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  nextPieceTypeRef.current = nextPieceType;
  scoreRef.current = score;
  levelRef.current = level;
  linesRef.current = lines;
  statusRef.current = status;

  /** 停止游戏循环 / Stop game loop */
  const stopLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  /** 游戏结束处理 / Handle game over */
  const handleGameOver = useCallback(() => {
    stopLoop();
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [stopLoop, updateHighScore]);

  /**
   * 生成新方块
   * Spawn a new piece
   *
   * 1. 将 nextPieceType 作为当前方块
   * 2. 随机生成新的 nextPieceType
   * 3. 初始位置：水平居中，y = 0（从顶部进入）
   * 4. 如果初始位置就碰撞 → 游戏结束
   *
   * 1. Use nextPieceType as the current piece
   * 2. Randomly generate a new nextPieceType
   * 3. Initial position: horizontally centered, y = 0 (enters from top)
   * 4. If collision at initial position → game over
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
   * Update score and level
   *
   * 得分公式：LINE_SCORES[行数] × 等级
   * 等级公式：Math.floor(总消行数 / LINES_PER_LEVEL) + 1
   *
   * Score formula: LINE_SCORES[lines] × level
   * Level formula: Math.floor(totalLines / LINES_PER_LEVEL) + 1
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
        // Restart game loop on level change (adjust speed)
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
   * Game main loop - executes every interval
   *
   * 流程：
   * 1. 检查当前方块能否向下移动一格
   * 2. 如果能 → 更新 position.y + 1
   * 3. 如果不能 → 锁定方块到棋盘 → 消行检查 → 更新得分 → 生成新方块
   * 4. 新方块生成后如果立即碰撞 → 游戏结束
   *
   * Flow:
   * 1. Check if current piece can move down one row
   * 2. If yes → update position.y + 1
   * 3. If no → lock piece to board → check line clears → update score → spawn new piece
   * 4. If new piece collides immediately after spawn → game over
   */
  const tick = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const piece = currentPieceRef.current;
    if (!piece) return;

    const newPos = { x: piece.position.x, y: piece.position.y + 1 };

    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      // 可以下落 / Can drop
      setCurrentPiece({ ...piece, position: newPos });
    } else {
      // 不能下落，锁定方块 / Cannot drop, lock piece
      const lockedBoard = lockPiece(boardRef.current, piece, cols, rows);
      const [clearedBoard, clearedCount] = clearLines(lockedBoard, cols, rows);
      setBoard(clearedBoard);

      // 需要先更新 boardRef 再生成新方块
      // Must update boardRef before spawning new piece
      boardRef.current = clearedBoard;

      updateScoreAndLevel(clearedCount);
      spawnNewPiece();
    }
  }, [cols, rows, updateScoreAndLevel, spawnNewPiece]);

  // tick 的 ref，用于 setInterval 中引用最新的 tick
  // Ref for tick, used to reference the latest tick in setInterval
  const tickRef = useRef(tick);
  tickRef.current = tick;

  /** 启动游戏循环 / Start game loop */
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

  /** 开始游戏 / Start game */
  const start = useCallback(() => {
    // 生成第一个方块 / Generate first piece
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

  /** 暂停/继续 / Pause/Resume */
  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      stopLoop();
      setStatus('paused');
    } else if (statusRef.current === 'paused') {
      setStatus('playing');
      startLoop(levelRef.current);
    }
  }, [stopLoop, startLoop]);

  /** 重新开始 / Restart */
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

  /** 左移 / Move left */
  const moveLeft = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || statusRef.current !== 'playing') return;

    const newPos = { x: piece.position.x - 1, y: piece.position.y };
    if (!hasCollision(boardRef.current, piece.type, piece.rotation, newPos, cols, rows)) {
      setCurrentPiece({ ...piece, position: newPos });
    }
  }, [cols, rows]);

  /** 右移 / Move right */
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
   * Rotate piece clockwise
   *
   * 使用预定义旋转状态（shapes 数组），索引循环 0→1→2→3→0。
   * 旋转后如果发生碰撞，则不执行旋转（简单旋转系统，不做 wall kick）。
   *
   * Uses predefined rotation states (shapes array), index cycles 0→1→2→3→0.
   * If collision occurs after rotation, rotation is not applied (simple rotation system, no wall kick).
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
   * Soft drop - accelerate drop by one row
   *
   * 每软降一格加 SOFT_DROP_SCORE 分
   * Awards SOFT_DROP_SCORE points per row dropped
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
   * Hard drop - piece drops directly to the bottom
   *
   * 逐行向下检测直到碰撞，计算落下的格数用于加分。
   * 加分 = 落下格数 × HARD_DROP_SCORE
   *
   * Checks row by row downward until collision, calculates drop distance for scoring.
   * Score bonus = drop distance × HARD_DROP_SCORE
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

    // 加分 / Add score
    setScore((prev) => prev + dropDistance * HARD_DROP_SCORE);

    // 锁定 / Lock piece
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

  /** 组件卸载时清理游戏循环 / Cleanup game loop on component unmount */
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
