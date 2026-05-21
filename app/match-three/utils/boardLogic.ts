/**
 * 消消乐棋盘纯函数逻辑层
 *
 * 所有函数均为纯函数，不修改传入的 board，返回新数组。
 *
 * @module app/match-three/utils/boardLogic
 */

import type { Board, Gem, GemType, MatchResult, LevelConfig } from '../types/game';

/** 自增 ID 计数器 */
let nextId = 0;

/** 创建单个宝石 */
function createGem(type: GemType, row: number, col: number): Gem {
  return { id: nextId++, type, row, col };
}

/** 随机选择一个宝石类型 */
function randomGemType(types: GemType[]): GemType {
  return types[Math.floor(Math.random() * types.length)];
}

/** 深拷贝棋盘 */
function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((gem) => (gem ? { ...gem } : null)));
}

/**
 * 生成初始棋盘，确保无初始匹配。
 * 逐个放置宝石，检查左边2个和上边2个是否同类型，避免形成3连。
 */
export function initBoard(config: LevelConfig): Board {
  const { rows, cols, gemTypes } = config;
  const board: Board = [];

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      let type = randomGemType(gemTypes);
      // 避免水平3连：检查左边2个
      if (
        c >= 2 &&
        board[r][c - 1]?.type === type &&
        board[r][c - 2]?.type === type
      ) {
        // 重新选择直到不同
        const forbidden = new Set<GemType>();
        forbidden.add(type);
        while (c >= 2 && forbidden.has(type)) {
          // 检查左边2个是否相同
          if (
            board[r][c - 1]?.type === board[r][c - 2]?.type &&
            board[r][c - 1]?.type === type
          ) {
            forbidden.add(type);
            type = randomGemType(gemTypes);
          } else {
            break;
          }
        }
        // 如果还是不行，直接选一个非禁止的类型
        if (
          c >= 2 &&
          board[r][c - 1]?.type === type &&
          board[r][c - 2]?.type === type
        ) {
          for (const t of gemTypes) {
            if (t !== board[r][c - 1]?.type || t !== board[r][c - 2]?.type) {
              if (
                !(
                  c >= 2 &&
                  board[r][c - 1]?.type === t &&
                  board[r][c - 2]?.type === t
                )
              ) {
                type = t;
                break;
              }
            }
          }
        }
      }
      // 避免垂直3连：检查上边2个
      if (
        r >= 2 &&
        board[r - 1][c]?.type === type &&
        board[r - 2][c]?.type === type
      ) {
        // 选一个与上方不同的类型
        const aboveType = board[r - 1][c]!.type;
        const candidates = gemTypes.filter((t) => t !== aboveType);
        type = candidates[Math.floor(Math.random() * candidates.length)];
        // 还要再检查水平3连
        if (
          c >= 2 &&
          board[r][c - 1]?.type === type &&
          board[r][c - 2]?.type === type
        ) {
          // 找一个既不形成水平3连也不形成垂直3连的类型
          for (const t of gemTypes) {
            const horizontalOk =
              c < 2 ||
              board[r][c - 1]?.type !== t ||
              board[r][c - 2]?.type !== t;
            const verticalOk =
              r < 2 ||
              board[r - 1][c]?.type !== t ||
              board[r - 2][c]?.type !== t;
            if (horizontalOk && verticalOk) {
              type = t;
              break;
            }
          }
        }
      }

      board[r][c] = createGem(type, r, c);
    }
  }

  return board;
}

/**
 * 扫描整个棋盘找出所有水平和垂直 >= 3 的连线匹配。
 */
export function findMatches(board: Board): MatchResult[] {
  if (board.length === 0) return [];

  const rows = board.length;
  const cols = board[0].length;
  const matches: MatchResult[] = [];

  // 水平扫描
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const gem = board[r][c];
      if (!gem) {
        c++;
        continue;
      }
      // 找连续相同类型
      let end = c + 1;
      while (end < cols && board[r][end]?.type === gem.type) {
        end++;
      }
      const length = end - c;
      if (length >= 3) {
        const positions: { row: number; col: number }[] = [];
        for (let i = c; i < end; i++) {
          positions.push({ row: r, col: i });
        }
        matches.push({ positions, type: gem.type });
      }
      c = end;
    }
  }

  // 垂直扫描
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const gem = board[r][c];
      if (!gem) {
        r++;
        continue;
      }
      let end = r + 1;
      while (end < rows && board[end][c]?.type === gem.type) {
        end++;
      }
      const length = end - r;
      if (length >= 3) {
        const positions: { row: number; col: number }[] = [];
        for (let i = r; i < end; i++) {
          positions.push({ row: i, col: c });
        }
        matches.push({ positions, type: gem.type });
      }
      r = end;
    }
  }

  return matches;
}

/**
 * 将匹配位置的宝石设为 null（返回新 board）。
 */
export function removeMatches(board: Board, matches: MatchResult[]): Board {
  const newBoard = cloneBoard(board);
  for (const match of matches) {
    for (const pos of match.positions) {
      newBoard[pos.row][pos.col] = null;
    }
  }
  return newBoard;
}

/**
 * 上方宝石下落填充空位（返回新 board）。
 * 从下往上处理每列，null 上浮（宝石下沉）。
 */
export function applyGravity(board: Board): Board {
  if (board.length === 0) return board;
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: Board = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );

  for (let c = 0; c < cols; c++) {
    // 收集该列非空宝石（从下到上的顺序保留）
    const gems: Gem[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r][c]) {
        gems.push(board[r][c]!);
      }
    }
    // 从下往上放置
    for (let i = 0; i < gems.length; i++) {
      const newRow = rows - 1 - i;
      newBoard[newRow][c] = { ...gems[i], row: newRow, col: c };
    }
  }

  return newBoard;
}

/**
 * 顶部空位填充新随机宝石（返回新 board）。
 */
export function fillEmptySpaces(board: Board, gemTypes: GemType[]): Board {
  if (board.length === 0) return board;
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = cloneBoard(board);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c]) {
        const type = randomGemType(gemTypes);
        newBoard[r][c] = createGem(type, r, c);
      }
    }
  }

  return newBoard;
}

/**
 * 交换两个位置的宝石（返回新 board）。
 */
export function swapGems(
  board: Board,
  pos1: { row: number; col: number },
  pos2: { row: number; col: number },
): Board {
  const newBoard = cloneBoard(board);
  const gem1 = newBoard[pos1.row][pos1.col];
  const gem2 = newBoard[pos2.row][pos2.col];

  // 交换
  newBoard[pos1.row][pos1.col] = gem2
    ? { ...gem2, row: pos1.row, col: pos1.col }
    : null;
  newBoard[pos2.row][pos2.col] = gem1
    ? { ...gem1, row: pos2.row, col: pos2.col }
    : null;

  return newBoard;
}

/**
 * 判断交换后是否能产生匹配。
 */
export function isValidSwap(
  board: Board,
  pos1: { row: number; col: number },
  pos2: { row: number; col: number },
): boolean {
  const swapped = swapGems(board, pos1, pos2);
  return findMatches(swapped).length > 0;
}

/**
 * 死局检测：遍历每个位置尝试与右方和下方交换，检查是否产生匹配。
 */
export function hasAvailableMoves(
  board: Board,
  _gemTypes?: GemType[],
): boolean {
  if (board.length === 0) return false;
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 尝试与右方交换
      if (c + 1 < cols) {
        if (isValidSwap(board, { row: r, col: c }, { row: r, col: c + 1 })) {
          return true;
        }
      }
      // 尝试与下方交换
      if (r + 1 < rows) {
        if (isValidSwap(board, { row: r, col: c }, { row: r + 1, col: c })) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * 重排棋盘：保持宝石类型数量不变，只打乱位置，
 * 确保无初始匹配且有可用移动。
 */
export function reshuffleBoard(board: Board, gemTypes: GemType[]): Board {
  if (board.length === 0) return board;
  const rows = board.length;
  const cols = board[0].length;

  // 收集所有宝石类型
  const types: GemType[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c]) {
        types.push(board[r][c]!.type);
      }
    }
  }

  // 尝试多次打乱
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Fisher-Yates shuffle
    const shuffled = [...types];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 重建棋盘
    const newBoard: Board = Array.from({ length: rows }, () =>
      Array(cols).fill(null),
    );
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newBoard[r][c] = createGem(shuffled[idx++], r, c);
      }
    }

    // 检查无初始匹配且有可用移动
    if (findMatches(newBoard).length === 0 && hasAvailableMoves(newBoard, gemTypes)) {
      return newBoard;
    }
  }

  // 如果多次打乱都失败，回退到重新生成（使用 initBoard 的逻辑）
  // 构造一个临时 config
  const tempConfig: LevelConfig = {
    id: 'reshuffle',
    name: 'reshuffle',
    description: '',
    icon: '',
    targetScore: 0,
    moves: 0,
    rows,
    cols,
    gemTypes,
  };
  return initBoard(tempConfig);
}
