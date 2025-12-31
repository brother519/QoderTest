import React, { useRef, useState } from 'react';
import { GRID_SIZE, DIRECTIONS } from '../../logic/constants.js';
import Tile from '../Tile/Tile.jsx';
import styles from './Board.module.css';

const Board = ({ tiles, onMove }) => {
  const boardRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onMove(deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
    } else {
      onMove(deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
    }

    setTouchStart(null);
  };

  return (
    <div
      ref={boardRef}
      className={styles.board}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.gridBackground}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div key={index} className={styles.gridCell} />
        ))}
      </div>
      <div className={styles.tileContainer}>
        {tiles.map(tile => (
          <Tile
            key={tile.id}
            value={tile.value}
            row={tile.row}
            col={tile.col}
            isNew={tile.isNew}
            isMerged={tile.isMerged}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
