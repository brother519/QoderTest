import { useState, useEffect, useCallback } from 'react';
import { initializeBoard, move, canMove, checkWin } from '../logic/gameEngine.js';
import { addRandomTile, compareBoards } from '../logic/boardUtils.js';
import { useLocalStorage } from './useLocalStorage.js';
import { ANIMATION_DURATION } from '../logic/constants.js';

let tileIdCounter = 0;

function generateTileId() {
  return `tile-${tileIdCounter++}`;
}

function boardToTiles(board) {
  const tiles = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== 0) {
        tiles.push({
          id: generateTileId(),
          value: board[row][col],
          row,
          col,
          isNew: false,
          isMerged: false
        });
      }
    }
  }
  return tiles;
}

export function useGameState() {
  const [savedState, setSavedState] = useLocalStorage('game2048', null);
  const [bestScore, setBestScore] = useLocalStorage('bestScore2048', 0);
  
  const [board, setBoard] = useState(() => {
    if (savedState?.board) {
      return savedState.board;
    }
    return initializeBoard();
  });
  
  const [score, setScore] = useState(() => savedState?.score || 0);
  const [tiles, setTiles] = useState(() => {
    if (savedState?.tiles) {
      return savedState.tiles;
    }
    return boardToTiles(board);
  });
  
  const [gameStatus, setGameStatus] = useState('playing');
  const [isAnimating, setIsAnimating] = useState(false);

  const saveGame = useCallback(() => {
    setSavedState({ board, score, tiles, timestamp: Date.now() });
  }, [board, score, tiles, setSavedState]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore, setBestScore]);

  useEffect(() => {
    saveGame();
  }, [board, score]);

  const startNewGame = useCallback(() => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setScore(0);
    setTiles(boardToTiles(newBoard));
    setGameStatus('playing');
    setIsAnimating(false);
  }, []);

  const handleMove = useCallback((direction) => {
    if (isAnimating || gameStatus === 'lost') {
      return;
    }

    const result = move(board, direction);
    
    if (!result.moved) {
      return;
    }

    setIsAnimating(true);
    setScore(prevScore => prevScore + result.score);

    const newTiles = boardToTiles(result.board);
    setTiles(newTiles);
    setBoard(result.board);

    setTimeout(() => {
      const boardWithNewTile = addRandomTile(result.board);
      setBoard(boardWithNewTile);
      
      const updatedTiles = boardToTiles(boardWithNewTile);
      const newTilePositions = updatedTiles.filter(tile => {
        return !newTiles.some(oldTile => 
          oldTile.row === tile.row && 
          oldTile.col === tile.col && 
          oldTile.value === tile.value
        );
      });
      
      const finalTiles = updatedTiles.map(tile => {
        const isNew = newTilePositions.some(
          newTile => newTile.row === tile.row && newTile.col === tile.col
        );
        return { ...tile, isNew };
      });
      
      setTiles(finalTiles);

      if (checkWin(boardWithNewTile) && gameStatus === 'playing') {
        setGameStatus('won');
      }

      if (!canMove(boardWithNewTile)) {
        setGameStatus('lost');
      }

      setTimeout(() => {
        setTiles(tiles => tiles.map(tile => ({ ...tile, isNew: false, isMerged: false })));
        setIsAnimating(false);
      }, ANIMATION_DURATION);
    }, ANIMATION_DURATION);

  }, [board, isAnimating, gameStatus]);

  const continueGame = useCallback(() => {
    if (gameStatus === 'won') {
      setGameStatus('playing');
    }
  }, [gameStatus]);

  return {
    board,
    score,
    bestScore,
    tiles,
    gameStatus,
    isAnimating,
    startNewGame,
    handleMove,
    continueGame
  };
}
