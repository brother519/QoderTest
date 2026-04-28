/**
 * 连连看棋盘纯逻辑模块
 *
 * 包含棋盘初始化、路径查找（核心连连看算法）、棋盘重排等纯函数，
 * 不依赖 React，可独立测试。
 *
 * 路径查找算法支持三种连接方式：
 * 1. 直线连接（0 次转弯）
 * 2. L 形连接（1 次转弯）
 * 3. Z/U 形连接（2 次转弯）
 *
 * @module link-match/utils/boardLogic
 */

import { Card, Position, ConnectionPath, GameConfig } from '../types/game';

/**
 * 棋盘类型
 *
 * 二维数组表示的游戏棋盘，实际尺寸为 (rows+2) x (cols+2)，
 * 外围一圈为 null（空位），用于简化边界路径的查找逻辑。
 */
export type Board = (Card | null)[][];

/**
 * Fisher-Yates 洗牌算法
 *
 * 对数组进行随机打乱，时间复杂度 O(n)，返回新数组不修改原数组。
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 初始化游戏棋盘
 *
 * 根据配置生成带有外围空位边界的棋盘：
 * 1. 从图标集中随机选取所需数量的图标
 * 2. 每个图标生成一对卡牌
 * 3. 随机洗牌后放入 (rows+2) x (cols+2) 棋盘内部区域
 *
 * @param config - 游戏配置，包含行数、列数和图标集
 * @returns 初始化完成的棋盘
 */
export function initBoard(config: GameConfig): Board {
  const { rows, cols, icons } = config;
  const totalCards = rows * cols;
  const pairsCount = totalCards / 2;

  const selectedIcons = shuffle([...icons]).slice(0, pairsCount);

  const cards: Card[] = [];
  let id = 0;
  for (const icon of selectedIcons) {
    cards.push({ id: id++, icon, row: 0, col: 0, matched: false });
    cards.push({ id: id++, icon, row: 0, col: 0, matched: false });
  }

  const shuffledCards = shuffle(cards);

  const board: Board = Array(rows + 2)
    .fill(null)
    .map(() => Array(cols + 2).fill(null));

  let cardIndex = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const card = shuffledCards[cardIndex++];
      card.row = r;
      card.col = c;
      board[r][c] = card;
    }
  }

  return board;
}

/**
 * 检查棋盘指定位置是否为空（null 或已消除）
 */
function isEmpty(board: Board, row: number, col: number): boolean {
  const cell = board[row]?.[col];
  return cell === null || cell.matched;
}

/**
 * 检查两点之间是否可以直线连接（水平或垂直方向，中间无障碍）
 */
function canConnectStraight(
  board: Board,
  start: Position,
  end: Position
): boolean {
  if (start.row === end.row) {
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    for (let c = minCol + 1; c < maxCol; c++) {
      if (!isEmpty(board, start.row, c)) return false;
    }
    return true;
  } else if (start.col === end.col) {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    for (let r = minRow + 1; r < maxRow; r++) {
      if (!isEmpty(board, r, start.col)) return false;
    }
    return true;
  }
  return false;
}

/** 查找直线连接路径（0 次转弯） */
function findStraightPath(
  board: Board,
  card1: Card,
  card2: Card
): ConnectionPath | null {
  const start: Position = { row: card1.row, col: card1.col };
  const end: Position = { row: card2.row, col: card2.col };

  if (canConnectStraight(board, start, end)) {
    return { points: [start, end] };
  }
  return null;
}

/** 查找 L 形连接路径（1 次转弯），尝试两个可能的拐角位置 */
function findLShapedPath(
  board: Board,
  card1: Card,
  card2: Card
): ConnectionPath | null {
  const start: Position = { row: card1.row, col: card1.col };
  const end: Position = { row: card2.row, col: card2.col };

  const corner1: Position = { row: start.row, col: end.col };
  const corner2: Position = { row: end.row, col: start.col };

  if (
    isEmpty(board, corner1.row, corner1.col) &&
    canConnectStraight(board, start, corner1) &&
    canConnectStraight(board, corner1, end)
  ) {
    return { points: [start, corner1, end] };
  }

  if (
    isEmpty(board, corner2.row, corner2.col) &&
    canConnectStraight(board, start, corner2) &&
    canConnectStraight(board, corner2, end)
  ) {
    return { points: [start, corner2, end] };
  }

  return null;
}

/** 扫描方向：垂直或水平 */
type ScanDirection = 'vertical' | 'horizontal';

/** 在指定方向上扫描查找 Z/U 形路径（2 次转弯） */
function scanZShapedPath(
  board: Board,
  start: Position,
  end: Position,
  direction: ScanDirection
): ConnectionPath | null {
  const isVertical = direction === 'vertical';
  const maxIndex = isVertical ? board.length : board[0].length;

  for (let i = 0; i < maxIndex; i++) {
    const mid1: Position = isVertical
      ? { row: i, col: start.col }
      : { row: start.row, col: i };

    if (
      isEmpty(board, mid1.row, mid1.col) &&
      canConnectStraight(board, start, mid1)
    ) {
      const corner: Position = isVertical
        ? { row: mid1.row, col: end.col }
        : { row: end.row, col: mid1.col };

      if (
        isEmpty(board, corner.row, corner.col) &&
        canConnectStraight(board, mid1, corner) &&
        canConnectStraight(board, corner, end)
      ) {
        return { points: [start, mid1, corner, end] };
      }
    }
  }

  return null;
}

/** 查找 Z/U 形连接路径，分别沿垂直和水平方向扫描 */
function findZShapedPath(
  board: Board,
  card1: Card,
  card2: Card
): ConnectionPath | null {
  const start: Position = { row: card1.row, col: card1.col };
  const end: Position = { row: card2.row, col: card2.col };

  return (
    scanZShapedPath(board, start, end, 'vertical') ??
    scanZShapedPath(board, start, end, 'horizontal')
  );
}

/**
 * 查找两张卡牌之间的连接路径（核心算法）
 *
 * 按转弯次数从少到多依次尝试：直线 -> L 形 -> Z/U 形
 *
 * @param board - 当前棋盘
 * @param card1 - 第一张卡牌
 * @param card2 - 第二张卡牌
 * @returns 连接路径（包含 2~4 个关键点），未找到返回 null
 */
export function findPath(
  board: Board,
  card1: Card,
  card2: Card
): ConnectionPath | null {
  return (
    findStraightPath(board, card1, card2) ??
    findLShapedPath(board, card1, card2) ??
    findZShapedPath(board, card1, card2)
  );
}

/** 收集棋盘内部所有未消除的卡牌 */
function collectUnmatchedCards(board: Board): Card[] {
  const cards: Card[] = [];
  for (let r = 1; r < board.length - 1; r++) {
    for (let c = 1; c < board[r].length - 1; c++) {
      const card = board[r][c];
      if (card && !card.matched) {
        cards.push(card);
      }
    }
  }
  return cards;
}

/**
 * 检查棋盘上是否还存在可消除的卡牌对
 *
 * 遍历所有未消除的卡牌，对每对相同图标卡牌调用 findPath 检查路径。
 */
export function hasAvailableMoves(board: Board): boolean {
  const cards = collectUnmatchedCards(board);

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].icon === cards[j].icon && findPath(board, cards[i], cards[j])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 查找第一对可消除的卡牌，用于提示功能
 *
 * @returns 可消除的卡牌对，没有可用提示时返回 null
 */
export function findHintPair(board: Board): [Card, Card] | null {
  const cards = collectUnmatchedCards(board);

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].icon === cards[j].icon && findPath(board, cards[i], cards[j])) {
        return [cards[i], cards[j]];
      }
    }
  }

  return null;
}

/** 检查棋盘上是否所有卡牌都已消除（用于胜利检测） */
export function isAllMatched(board: Board): boolean {
  for (let r = 1; r < board.length - 1; r++) {
    for (let c = 1; c < board[r].length - 1; c++) {
      const card = board[r][c];
      if (card && !card.matched) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 重排棋盘
 *
 * 当棋盘无可消除的卡牌对时，将所有未消除的卡牌收集并重新随机分配位置。
 * 已消除的卡牌位置保持不变。
 */
export function reshuffleBoard(board: Board): Board {
  const rows = board.length - 2;
  const cols = board[0].length - 2;

  const unmatchedCards = collectUnmatchedCards(board);
  if (unmatchedCards.length === 0) return board;

  const shuffled = shuffle(unmatchedCards);

  const newBoard: Board = Array(rows + 2)
    .fill(null)
    .map(() => Array(cols + 2).fill(null));

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const card = board[r][c];
      if (card && card.matched) {
        newBoard[r][c] = { ...card };
      }
    }
  }

  let cardIndex = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (newBoard[r][c] === null && cardIndex < shuffled.length) {
        const card = shuffled[cardIndex++];
        card.row = r;
        card.col = c;
        newBoard[r][c] = card;
      }
    }
  }

  return newBoard;
}
