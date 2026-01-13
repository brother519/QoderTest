import { TILE_SIZE, GRID_COLS, GRID_ROWS, TILE_EMPTY, TILE_BRICK, TILE_STEEL, TILE_WATER, TILE_GRASS, TILE_BASE } from './constants.js';
import { Tile } from './tile.js';
import { Base } from './base.js';
import { LEVELS } from '../levels/levels.js';

export class GameMap {
    constructor() {
        this.tiles = [];
        this.base = null;
    }

    loadLevel(levelNum) {
        this.tiles = [];
        const levelData = LEVELS[levelNum - 1] || LEVELS[0];

        for (let row = 0; row < GRID_ROWS; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const type = levelData[row] ? levelData[row][col] || TILE_EMPTY : TILE_EMPTY;
                if (type === TILE_BASE) {
                    this.base = new Base(col * TILE_SIZE, row * TILE_SIZE);
                    this.tiles[row][col] = null;
                } else if (type !== TILE_EMPTY) {
                    this.tiles[row][col] = new Tile(col, row, type);
                } else {
                    this.tiles[row][col] = null;
                }
            }
        }

        if (!this.base) {
            this.base = new Base(9 * TILE_SIZE, 19 * TILE_SIZE);
        }
    }

    getTile(col, row) {
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
            return null;
        }
        return this.tiles[row][col];
    }

    destroyTile(col, row) {
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            this.tiles[row][col] = null;
        }
    }

    isWalkable(x, y, width, height) {
        const left = Math.floor(x / TILE_SIZE);
        const right = Math.floor((x + width - 1) / TILE_SIZE);
        const top = Math.floor(y / TILE_SIZE);
        const bottom = Math.floor((y + height - 1) / TILE_SIZE);

        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                const tile = this.getTile(col, row);
                if (tile && !tile.isPassable) {
                    return false;
                }
            }
        }
        return true;
    }

    draw(ctx) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = this.tiles[row][col];
                if (tile && tile.type !== TILE_GRASS) {
                    tile.draw(ctx);
                }
            }
        }
        if (this.base) {
            this.base.draw(ctx);
        }
    }

    drawGrass(ctx) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = this.tiles[row][col];
                if (tile && tile.type === TILE_GRASS) {
                    tile.drawGrass(ctx);
                }
            }
        }
    }
}
