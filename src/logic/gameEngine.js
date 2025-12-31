import { GRID_SIZE, DIRECTIONS, WIN_TILE } from './constants.js';
import { 
  createEmptyBoard, 
  cloneBoard, 
  compareBoards, 
  addRandomTile, 
  rotateBoard, 
  flipBoardHorizontally 
} from './boardUtils.js';

export function initializeBoard() {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

function compressRow(row) {
  const newRow = row.filter(cell => cell !== 0);
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }
  return newRow;
}

function mergeRow(row) {
  let score = 0;
  const merged = [];
  
  for (let i = 0; i < row.length; i++) {
    if (i < row.length - 1 && row[i] === row[i + 1] && row[i] !== 0) {
      const mergedValue = row[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      i++;
    } else {
      merged.push(row[i]);
    }
  }
  
  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }
  
  return { row: merged, score };
}

function moveLeft(board) {
  let totalScore = 0;
  const newBoard = board.map(row => {
    const compressed = compressRow(row);
    const { row: merged, score } = mergeRow(compressed);
    totalScore += score;
    return merged;
  });
  
  return { board: newBoard, score: totalScore };
}

export function move(board, direction) {
  let transformedBoard = cloneBoard(board);
  let needsRotationBack = false;
  let needsFlipBack = false;
  
  switch (direction) {
    case DIRECTIONS.LEFT:
      break;
    case DIRECTIONS.RIGHT:
      transformedBoard = flipBoardHorizontally(transformedBoard);
      needsFlipBack = true;
      break;
    case DIRECTIONS.UP:
      transformedBoard = rotateBoard(transformedBoard, 1);
      needsRotationBack = 1;
      break;
    case DIRECTIONS.DOWN:
      transformedBoard = rotateBoard(transformedBoard, 3);
      needsRotationBack = 3;
      break;
    default:
      return { board, score: 0, moved: false };
  }
  
  const { board: movedBoard, score } = moveLeft(transformedBoard);
  
  let finalBoard = movedBoard;
  if (needsFlipBack) {
    finalBoard = flipBoardHorizontally(finalBoard);
  }
  if (needsRotationBack) {
    finalBoard = rotateBoard(finalBoard, 4 - needsRotationBack);
  }
  
  const moved = !compareBoards(board, finalBoard);
  
  return { board: finalBoard, score, moved };
}

export function canMove(board) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        return true;
      }
      
      if (col < GRID_SIZE - 1 && board[row][col] === board[row][col + 1]) {
        return true;
      }
      
      if (row < GRID_SIZE - 1 && board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }
  return false;
}

export function checkWin(board) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === WIN_TILE) {
        return true;
      }
    }
  }
  return false;
}
