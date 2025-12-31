import React from 'react';
import { TILE_COLORS, TILE_TEXT_COLORS } from '../../logic/constants.js';
import styles from './Tile.module.css';

const Tile = React.memo(({ value, row, col, isNew, isMerged }) => {
  const backgroundColor = TILE_COLORS[value] || '#3c3a32';
  const textColor = TILE_TEXT_COLORS[value] || '#f9f6f2';
  const fontSize = value >= 1000 ? '35px' : value >= 100 ? '45px' : '55px';

  return (
    <div
      className={`${styles.tile} ${isNew ? styles.tileNew : ''} ${isMerged ? styles.tileMerged : ''}`}
      style={{
        '--row': row,
        '--col': col,
        backgroundColor,
        color: textColor,
        fontSize
      }}
    >
      {value}
    </div>
  );
});

Tile.displayName = 'Tile';

export default Tile;
