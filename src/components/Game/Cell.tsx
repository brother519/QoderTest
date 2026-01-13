import React, { memo, useState, useEffect } from 'react';
import { Cell as CellType } from '../../types/game';
import { useAudio } from '../../hooks/useAudio';
import './Cell.css';

interface CellProps {
  cell: CellType;
  onLeftClick: (x: number, y: number) => void;
  onRightClick: (x: number, y: number) => void;
}

const Cell: React.FC<CellProps> = memo(({ cell, onLeftClick, onRightClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { play } = useAudio(true);

  useEffect(() => {
    if (cell.isRevealed && !cell.isFlagged) {
      setIsAnimating(true);
      if (cell.hasMine) {
        play('lose');
      } else if (cell.adjacentMines === 0) {
        play('reveal');
      }
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cell.isRevealed]);

  useEffect(() => {
    if (cell.isFlagged) {
      play('flag');
    }
  }, [cell.isFlagged]);

  const handleClick = () => {
    onLeftClick(cell.x, cell.y);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(cell.x, cell.y);
  };

  const getContent = () => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.hasMine) return '💣';
    if (cell.adjacentMines === 0) return '';
    return cell.adjacentMines;
  };

  const getClassName = () => {
    let className = 'cell';
    if (cell.isRevealed) className += ' revealed';
    if (cell.isFlagged) className += ' flagged';
    if (cell.hasMine && cell.isRevealed) className += ' mine';
    if (!cell.isRevealed) className += ' hidden';
    if (cell.adjacentMines > 0 && cell.isRevealed) {
      className += ` adjacent-${cell.adjacentMines}`;
    }
    if (isAnimating && cell.isRevealed) {
      className += ' revealing';
    }
    if (isAnimating && cell.isFlagged) {
      className += ' flagging';
    }
    return className;
  };

  return (
    <div
      className={getClassName()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {getContent()}
    </div>
  );
});

Cell.displayName = 'Cell';

export default Cell;