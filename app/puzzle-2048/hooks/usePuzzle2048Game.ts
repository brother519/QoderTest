/**
 * 2048 游戏核心逻辑 Hook
 *
 * 管理棋盘上的方块状态、滑动合并算法、得分、胜负判定与最高分持久化。
 *
 * 算法要点：
 * - 每次移动前生成 size x size 的网格快照（按 id 索引），
 *   按方向遍历轴线，使用"双指针挤压 + 单次合并"算法计算下一帧位置。
 * - 合并产生新 Tile（id 自增），原两个 Tile 在动画完成后被替换；
 *   动画期间通过 row/col 的 CSS 过渡平移，再叠加 isMerged/isNew 关键帧。
 *
 * @module puzzle-2048/hooks/usePuzzle2048Game
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Tile, GameStatus, Direction, GameConfig, MoveResult } from '../types/game';
import { useHighScore } from '@/lib/hooks/useHighScore';
import { HIGH_SCORE_KEY } from '../constants/config';

/** Hook 返回类型 */
export interface UsePuzzle2048GameReturn {
  /** 当前所有方块（包含动画标记） */
  tiles: Tile[];
  /** 棋盘大小 */
  size: number;
  /** 当前得分 */
  score: number;
  /** 历史最高分 */
  highScore: number;
  /** 游戏状态 */
  status: GameStatus;
  /** 是否已经达成 2048（即使 won 状态被关闭后也保持 true） */
  reached2048: boolean;
  /** 开始/重新开始游戏 */
  restart: () => void;
  /** 在已经胜利后选择继续游戏（保留盘面，状态切回 playing） */
  keepPlaying: () => void;
  /** 按指定方向滑动 */
  move: (direction: Direction) => void;
}

/** 全局自增 id（保证 React key 稳定） */
let TILE_ID_SEED = 1;

/** 生成新的 Tile id */
function nextTileId(): number {
  return TILE_ID_SEED++;
}

/**
 * 生成空棋盘网格（用于按 row/col 索引方块）
 *
 * @param size - 棋盘边长
 * @returns size x size 的二维数组，元素为 null 或 Tile
 */
function createGrid(size: number): (Tile | null)[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

/**
 * 将方块列表填入网格快照（按当前 row/col）
 *
 * @param tiles - 方块列表
 * @param size - 棋盘边长
 * @returns 二维网格快照
 */
function tilesToGrid(tiles: Tile[], size: number): (Tile | null)[][] {
  const grid = createGrid(size);
  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile;
  });
  return grid;
}

/**
 * 在棋盘空格中随机生成一个新方块
 *
 * @param tiles - 当前方块列表（不会被修改）
 * @param size - 棋盘大小
 * @param fourChance - 数值为 4 的概率（其余为 2）
 * @returns 新增方块；若棋盘已满返回 null
 */
function spawnRandomTile(tiles: Tile[], size: number, fourChance: number): Tile | null {
  const grid = tilesToGrid(tiles, size);
  const empties: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) empties.push({ row: r, col: c });
    }
  }
  if (empties.length === 0) return null;
  const pos = empties[Math.floor(Math.random() * empties.length)];
  return {
    id: nextTileId(),
    value: Math.random() < fourChance ? 4 : 2,
    row: pos.row,
    col: pos.col,
    isNew: true,
  };
}

/**
 * 沿"行从左到右"做一次挤压合并
 *
 * 通用滑动算法：将任意方向的滑动转换为"在每条轴线上向左挤压"，
 * 调用方需先把目标方向的轴线顺序传入。
 *
 * @param line - 单条轴线上的方块（按目标方向起点 -> 终点排序）
 * @returns { line: 处理后的方块（含新位置 col=0..n、合并产物的新 id 与 isMerged 标记）, gained: 合并得分, moved: 是否变化 }
 */
function compressLine(
  line: Tile[]
): { line: Tile[]; gained: number; moved: boolean } {
  const result: Tile[] = [];
  let gained = 0;
  let moved = false;
  let i = 0;
  while (i < line.length) {
    const cur = line[i];
    const next = line[i + 1];
    if (next && next.value === cur.value) {
      // 合并：产生一个新 Tile（新 id），原两个 Tile 由调用方移除
      const newValue = cur.value * 2;
      const newCol = result.length;
      result.push({
        id: nextTileId(),
        value: newValue,
        row: cur.row, // 行/列由调用方按方向重映射，这里保留原行
        col: newCol,
        isMerged: true,
      });
      gained += newValue;
      moved = true;
      i += 2;
    } else {
      const newCol = result.length;
      if (cur.col !== newCol) moved = true;
      result.push({ ...cur, col: newCol, isNew: false, isMerged: false });
      i += 1;
    }
  }
  return { line: result, gained, moved };
}

/**
 * 按指定方向计算移动结果
 *
 * 处理流程：
 * 1. 把所有方块按"目标方向轴线"分组并排序（远端到近端）。
 * 2. 对每条轴线调用 compressLine，得到结果列表。
 * 3. 把 compressLine 输出的"行内位置"映射回真实棋盘行列。
 *
 * @param tiles - 当前所有方块
 * @param size - 棋盘边长
 * @param direction - 滑动方向
 * @param winValue - 胜利目标值（用于 reached2048 判定）
 * @returns 移动结果
 */
function applyMove(
  tiles: Tile[],
  size: number,
  direction: Direction,
  winValue: number
): MoveResult {
  // 清除上一帧的动画标记，并按 id 复制
  const cleaned: Tile[] = tiles.map((t) => ({ ...t, isNew: false, isMerged: false }));
  const grid = tilesToGrid(cleaned, size);

  // 按方向构造轴线序列：每条轴线是单行/单列上从"目标终点"到"起点"反向收集的方块
  const lines: Tile[][] = [];
  const isHorizontal = direction === 'left' || direction === 'right';
  const reverse = direction === 'right' || direction === 'down';

  for (let a = 0; a < size; a++) {
    const line: Tile[] = [];
    for (let b = 0; b < size; b++) {
      const r = isHorizontal ? a : b;
      const c = isHorizontal ? b : a;
      const cell = grid[r][c];
      if (cell) line.push(cell);
    }
    if (reverse) line.reverse();
    lines.push(line);
  }

  let totalGained = 0;
  let anyMoved = false;
  let reached = false;
  const next: Tile[] = [];

  lines.forEach((line, axisIdx) => {
    const { line: compressed, gained, moved } = compressLine(line);
    if (moved) anyMoved = true;
    totalGained += gained;

    compressed.forEach((tile, posInLine) => {
      // 把 compressLine 输出的列号映射回真实行列
      const indexFromStart = reverse ? size - 1 - posInLine : posInLine;
      const row = isHorizontal ? axisIdx : indexFromStart;
      const col = isHorizontal ? indexFromStart : axisIdx;
      if (tile.value >= winValue && tile.isMerged) reached = true;
      next.push({ ...tile, row, col });
    });
  });

  return { tiles: next, gained: totalGained, moved: anyMoved, reached2048: reached };
}

/**
 * 判断棋盘上是否还存在任意可行的移动
 *
 * 当且仅当：
 * - 仍有空格，或
 * - 任意相邻（上下/左右）方块数值相等
 * 时游戏可以继续，否则游戏结束。
 *
 * @param tiles - 当前方块列表
 * @param size - 棋盘边长
 */
function hasAnyMove(tiles: Tile[], size: number): boolean {
  if (tiles.length < size * size) return true;
  const grid = tilesToGrid(tiles, size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cur = grid[r][c];
      if (!cur) return true;
      const right = c + 1 < size ? grid[r][c + 1] : null;
      const down = r + 1 < size ? grid[r + 1][c] : null;
      if (right && right.value === cur.value) return true;
      if (down && down.value === cur.value) return true;
    }
  }
  return false;
}

/**
 * 创建初始盘面（两个随机方块）
 *
 * @param size - 棋盘大小
 * @param fourChance - 数值为 4 的概率
 */
function createInitialTiles(size: number, fourChance: number): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < 2; i++) {
    const t = spawnRandomTile(tiles, size, fourChance);
    if (t) tiles.push(t);
  }
  return tiles;
}

/**
 * 2048 游戏 Hook
 *
 * 封装：
 * - 方块状态、得分、状态机（idle/playing/won/over）
 * - 上下左右移动算法 + 合并 + 新方块生成
 * - 胜负判定（达到 winValue 触发 won，无可行移动触发 over）
 * - 最高分持久化（localStorage）
 * - 移动节流（防止动画期间连续输入造成视觉错乱）
 *
 * @param config - 游戏配置
 */
export function usePuzzle2048Game(config: GameConfig): UsePuzzle2048GameReturn {
  const { size, winValue, fourChance, moveDuration } = config;

  // 初始状态为空数组，避免 SSR/CSR 水合错误（随机数在服务端和客户端不一致）
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [reached2048, setReached2048] = useState(false);
  const [highScore, updateHighScore] = useHighScore(HIGH_SCORE_KEY);

  // 客户端首次挂载时生成初始方块
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setTiles(createInitialTiles(size, fourChance));
      setStatus('playing');
    }
  }, [size, fourChance]);

  // 在回调中访问最新值，避免闭包陷阱
  const tilesRef = useRef(tiles);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const lockRef = useRef(false); // 移动动画锁
  tilesRef.current = tiles;
  scoreRef.current = score;
  statusRef.current = status;

  /** 重新开始：重置所有状态，生成两个初始方块 */
  const restart = useCallback(() => {
    setTiles(createInitialTiles(size, fourChance));
    setScore(0);
    setStatus('playing');
    setReached2048(false);
    lockRef.current = false;
  }, [size, fourChance]);

  /** 胜利后选择继续：保留盘面，状态切回 playing */
  const keepPlaying = useCallback(() => {
    if (statusRef.current === 'won') {
      setStatus('playing');
    }
  }, []);

  /**
   * 按方向滑动
   *
   * 1. 仅在 playing 状态生效，且未处于动画锁定中。
   * 2. 计算移动结果，无变化则直接返回。
   * 3. 应用新位置 → 更新分数 → 生成新方块 → 判定胜负。
   * 4. 通过 lockRef 节流，moveDuration 后解锁。
   */
  const move = useCallback(
    (direction: Direction) => {
      if (statusRef.current !== 'playing') return;
      if (lockRef.current) return;

      const result = applyMove(tilesRef.current, size, direction, winValue);
      if (!result.moved) return;

      lockRef.current = true;

      // 应用移动后的方块位置
      let nextTiles = result.tiles;
      const newScore = scoreRef.current + result.gained;
      setScore(newScore);
      updateHighScore(newScore);

      // 胜利判定（首次达成才弹出 won）
      let nextStatus: GameStatus = 'playing';
      if (result.reached2048 && !reached2048) {
        setReached2048(true);
        nextStatus = 'won';
      }

      // 生成一个新方块
      const spawned = spawnRandomTile(nextTiles, size, fourChance);
      if (spawned) nextTiles = [...nextTiles, spawned];

      // 失败判定（无可行移动）
      if (!hasAnyMove(nextTiles, size)) {
        nextStatus = 'over';
      }

      setTiles(nextTiles);
      if (nextStatus !== 'playing') setStatus(nextStatus);

      // 解锁
      window.setTimeout(() => {
        lockRef.current = false;
      }, moveDuration);
    },
    [size, winValue, fourChance, moveDuration, reached2048, updateHighScore]
  );

  // 组件卸载时确保锁释放（无定时器需清理，但保持习惯）
  useEffect(() => {
    return () => {
      lockRef.current = false;
    };
  }, []);

  return {
    tiles,
    size,
    score,
    highScore,
    status,
    reached2048,
    restart,
    keepPlaying,
    move,
  };
}
