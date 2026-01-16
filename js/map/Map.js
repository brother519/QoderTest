import { Constants } from '../utils/Constants.js';
import { Tile } from './Tile.js';

// 地图管理器
export class GameMap {
    constructor() {
        this.grid = [];
        this.width = Math.floor(Constants.CANVAS_WIDTH / Constants.TILE_SIZE);
        this.height = Math.floor(Constants.CANVAS_HEIGHT / Constants.TILE_SIZE);
        this.tileSize = Constants.TILE_SIZE;
    }
    
    loadLevel(levelData) {
        this.grid = [];
        const mapData = levelData.map;
        
        for (let y = 0; y < mapData.length; y++) {
            this.grid[y] = [];
            for (let x = 0; x < mapData[y].length; x++) {
                const tileType = mapData[y][x];
                if (tileType !== Constants.TILE_TYPE.EMPTY && tileType !== Constants.TILE_TYPE.BASE) {
                    this.grid[y][x] = new Tile(x, y, tileType);
                } else {
                    this.grid[y][x] = null;
                }
            }
        }
    }
    
    getTileAt(gridX, gridY) {
        if (gridY >= 0 && gridY < this.grid.length && 
            gridX >= 0 && gridX < this.grid[gridY].length) {
            return this.grid[gridY][gridX];
        }
        return null;
    }
    
    getTileAtWorld(worldX, worldY) {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);
        return this.getTileAt(gridX, gridY);
    }
    
    isPassable(worldX, worldY) {
        const tile = this.getTileAtWorld(worldX, worldY);
        return tile === null || tile.isPassable;
    }
    
    // 检查矩形区域是否可通行
    isAreaPassable(x, y, width, height) {
        // 检查四个角和中心
        const points = [
            { x: x, y: y },
            { x: x + width - 1, y: y },
            { x: x, y: y + height - 1 },
            { x: x + width - 1, y: y + height - 1 }
        ];
        
        for (const point of points) {
            if (!this.isPassable(point.x, point.y)) {
                return false;
            }
        }
        return true;
    }
    
    // 获取与矩形区域碰撞的所有瓦片
    getTilesInArea(x, y, width, height) {
        const tiles = [];
        const startGridX = Math.floor(x / this.tileSize);
        const startGridY = Math.floor(y / this.tileSize);
        const endGridX = Math.floor((x + width - 1) / this.tileSize);
        const endGridY = Math.floor((y + height - 1) / this.tileSize);
        
        for (let gy = startGridY; gy <= endGridY; gy++) {
            for (let gx = startGridX; gx <= endGridX; gx++) {
                const tile = this.getTileAt(gx, gy);
                if (tile && !tile.isPassable) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
    
    destroyTile(gridX, gridY) {
        const tile = this.getTileAt(gridX, gridY);
        if (tile && tile.isDestructible) {
            this.grid[gridY][gridX] = null;
            return true;
        }
        return false;
    }
    
    destroyTileAtWorld(worldX, worldY) {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);
        return this.destroyTile(gridX, gridY);
    }
    
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }
    
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.tileSize,
            y: gridY * this.tileSize
        };
    }
    
    render(ctx) {
        // 先渲染非草地瓦片
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const tile = this.grid[y][x];
                if (tile && tile.type !== Constants.TILE_TYPE.GRASS) {
                    tile.render(ctx);
                }
            }
        }
    }
    
    // 单独渲染草地（在坦克之后渲染以产生遮挡效果）
    renderGrass(ctx) {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const tile = this.grid[y][x];
                if (tile && tile.type === Constants.TILE_TYPE.GRASS) {
                    tile.render(ctx);
                }
            }
        }
    }
}
