import { CONFIG } from '../config.js';

export function gridToPixel(gridX, gridY) {
    return {
        x: gridX * CONFIG.GRID_SIZE,
        y: gridY * CONFIG.GRID_SIZE
    };
}

export function pixelToGrid(x, y) {
    return {
        gridX: Math.floor(x / CONFIG.GRID_SIZE),
        gridY: Math.floor(y / CONFIG.GRID_SIZE)
    };
}

export function snapToGrid(x, y) {
    const grid = pixelToGrid(x, y);
    return gridToPixel(grid.gridX, grid.gridY);
}

export function isInBounds(gridX, gridY) {
    return gridX >= 0 && gridX < CONFIG.GRID_COLS && 
           gridY >= 0 && gridY < CONFIG.GRID_ROWS;
}
