import React from 'react';
import { GameBoard } from '../../types/game';
import Cell from './Cell';
import './GameBoard.css';

interface GameBoardProps {
  board: GameBoard;
  onCellLeftClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
}

const GameBoardComponent: React.FC<GameBoardProps> = ({ board, onCellLeftClick, onCellRightClick }) => {
  const gridStyle = {
    gridTemplateColumns: `repeat(${board.width}, var(--cell-size))`,
    gap: '1px'
  };

  return (
    <div className="game-board-container">
      <div className="game-board" style={gridStyle}>
        {board.cells.map(cell => (
          <Cell
            key={cell.id}
            cell={cell}
            onLeftClick={onCellLeftClick}
            onRightClick={onCellRightClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoardComponent;
