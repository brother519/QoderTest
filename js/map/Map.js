import { Tile } from './Tile.js';
import { TILE_TYPES, TILE_SIZE, GRID_COLS, GRID_ROWS } from '../constants.js';

export class Map {
    constructor(game) {
        this.game = game;
        this.tiles = [];
        this.baseTiles = [];
        this.playerSpawn = { x: 0, y: 0 };
        this.enemySpawns = [];
        this.isBaseDestroyed = false;
    }
    
    loadFromData(levelData) {
        this.tiles = [];
        this.baseTiles = [];
        
        for (let row = 0; row < GRID_ROWS; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const type = levelData.tiles[row]?.[col] ?? TILE_TYPES.EMPTY;
                const tile = new Tile(type, col, row);
                this.tiles[row][col] = tile;
                
                if (type === TILE_TYPES.BASE) {
                    this.baseTiles.push(tile);
                }
            }
        }
        
        this.playerSpawn = levelData.playerSpawn;
        this.enemySpawns = levelData.enemySpawns;
        this.isBaseDestroyed = false;
    }
    
    getTileAt(pixelX, pixelY) {
        const col = Math.floor(pixelX / TILE_SIZE);
        const row = Math.floor(pixelY / TILE_SIZE);
        
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
            return null;
        }
        
        return this.tiles[row][col];
    }
    
    getTileAtGrid(col, row) {
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
            return null;
        }
        return this.tiles[row][col];
    }
    
    setTileAt(col, row, type) {
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
            return;
        }
        this.tiles[row][col] = new Tile(type, col, row);
    }
    
    isPassable(pixelX, pixelY) {
        const tile = this.getTileAt(pixelX, pixelY);
        return tile ? tile.isPassable : false;
    }
    
    getTilesInRect(x, y, width, height) {
        const tiles = [];
        
        const startCol = Math.floor(x / TILE_SIZE);
        const endCol = Math.floor((x + width - 1) / TILE_SIZE);
        const startRow = Math.floor(y / TILE_SIZE);
        const endRow = Math.floor((y + height - 1) / TILE_SIZE);
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tile = this.getTileAtGrid(col, row);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        
        return tiles;
    }
    
    checkCollision(bounds) {
        const tiles = this.getTilesInRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        for (const tile of tiles) {
            if (!tile.isPassable) {
                return tile;
            }
        }
        
        return null;
    }
    
    handleBulletCollision(bullet, canDestroySteel) {
        const bounds = bullet.getBounds();
        const tiles = this.getTilesInRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        for (const tile of tiles) {
            if (tile.blocksBuillets) {
                const result = tile.takeDamage(1, canDestroySteel);
                
                if (result === 'base_destroyed') {
                    this.isBaseDestroyed = true;
                    this.game.eventBus.emit('baseDestroyed', {});
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    getEnemySpawnPoints() {
        return this.enemySpawns;
    }
    
    getPlayerSpawnPoint() {
        return this.playerSpawn;
    }
    
    checkBaseDestroyed() {
        return this.isBaseDestroyed;
    }
    
    renderBottom(ctx) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = this.tiles[row][col];
                if (tile.type !== TILE_TYPES.GRASS) {
                    tile.render(ctx);
                }
            }
        }
    }
    
    renderTop(ctx) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = this.tiles[row][col];
                if (tile.type === TILE_TYPES.GRASS) {
                    tile.render(ctx);
                }
            }
        }
    }
    
    toJSON() {
        const tiles = this.tiles.map(row => 
            row.map(tile => tile.type)
        );
        
        return {
            tiles,
            playerSpawn: this.playerSpawn,
            enemySpawns: this.enemySpawns
        };
    }
}
