import { GRID_SIZE } from './constants.js';

export function createEmptyBoard() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

export function cloneBoard(board) {
  return board.map(row => [...row]);
}

export function compareBoards(board1, board2) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }
  return true;
}

export function getEmptyCells(board) {
  const empty = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

export function addRandomTile(board) {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;
  
  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = cloneBoard(board);
  newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

export function rotateBoard(board, times = 1) {
  let rotated = cloneBoard(board);
  for (let i = 0; i < times; i++) {
    const temp = createEmptyBoard();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        temp[col][GRID_SIZE - 1 - row] = rotated[row][col];
      }
    }
    rotated = temp;
  }
  return rotated;
}

export function flipBoardHorizontally(board) {
  return board.map(row => [...row].reverse());
}
