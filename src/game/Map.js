import { CONFIG } from '../config.js';

/**
 * 地图系统
 */
export class Map {
    constructor(level) {
        this.level = level;
        this.cols = CONFIG.MAP_COLS;
        this.rows = CONFIG.MAP_ROWS;
        this.tileSize = CONFIG.TILE_SIZE;
        
        // 生成地图数据
        this.tiles = this.generateMap(level);
    }
    
    /**
     * 生成地图
     */
    generateMap(level) {
        const tiles = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(CONFIG.TILE_TYPE.EMPTY)
        );
        
        // 基础关卡地图模板
        const template = this.getMapTemplate(level);
        
        // 应用模板
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (template[row] && template[row][col] !== undefined) {
                    tiles[row][col] = template[row][col];
                }
            }
        }
        
        // 添加基地周围的保护墙
        this.addBaseProtection(tiles);
        
        return tiles;
    }
    
    /**
     * 获取地图模板
     */
    getMapTemplate(level) {
        // 简化的地图模板
        const template = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(CONFIG.TILE_TYPE.EMPTY)
        );
        
        // 添加一些随机障碍物
        const obstacleCount = 30 + level * 5;
        for (let i = 0; i < obstacleCount; i++) {
            const row = Math.floor(Math.random() * (this.rows - 6)) + 3;
            const col = Math.floor(Math.random() * this.cols);
            
            // 随机选择障碍物类型
            const rand = Math.random();
            if (rand < 0.6) {
                template[row][col] = CONFIG.TILE_TYPE.BRICK;
            } else if (rand < 0.8) {
                template[row][col] = CONFIG.TILE_TYPE.STEEL;
            } else if (rand < 0.9) {
                template[row][col] = CONFIG.TILE_TYPE.WATER;
            } else {
                template[row][col] = CONFIG.TILE_TYPE.GRASS;
            }
        }
        
        // 确保出生点区域清空
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < this.cols; col++) {
                template[row][col] = CONFIG.TILE_TYPE.EMPTY;
            }
        }
        
        // 确保玩家出生点区域清空
        for (let row = this.rows - 4; row < this.rows; row++) {
            for (let col = 6; col < 18; col++) {
                template[row][col] = CONFIG.TILE_TYPE.EMPTY;
            }
        }
        
        return template;
    }
    
    /**
     * 添加基地保护墙
     */
    addBaseProtection(tiles) {
        const baseX = CONFIG.SPAWN_POINTS.BASE_POSITION.x;
        const baseY = CONFIG.SPAWN_POINTS.BASE_POSITION.y;
        
        // 在基地周围建立砖墙
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 3; dx++) {
                const row = baseY + dy;
                const col = baseX + dx;
                
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    // 基地本身位置
                    if (dx >= 0 && dx <= 1 && dy >= 0 && dy <= 1) {
                        tiles[row][col] = CONFIG.TILE_TYPE.EMPTY;
                    } else {
                        tiles[row][col] = CONFIG.TILE_TYPE.BRICK;
                    }
                }
            }
        }
    }
    
    /**
     * 检查坦克碰撞
     */
    checkTankCollision(x, y, width, height) {
        const startCol = Math.floor(x / this.tileSize);
        const endCol = Math.floor((x + width - 1) / this.tileSize);
        const startRow = Math.floor(y / this.tileSize);
        const endRow = Math.floor((y + height - 1) / this.tileSize);
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
                    return true;
                }
                
                const tile = this.tiles[row][col];
                
                // 坦克不能通过的地形
                if (tile === CONFIG.TILE_TYPE.BRICK ||
                    tile === CONFIG.TILE_TYPE.STEEL ||
                    tile === CONFIG.TILE_TYPE.WATER) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 检查子弹碰撞
     */
    checkBulletCollision(bullet) {
        const col = Math.floor((bullet.x + bullet.width / 2) / this.tileSize);
        const row = Math.floor((bullet.y + bullet.height / 2) / this.tileSize);
        
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        
        const tile = this.tiles[row][col];
        
        // 砖墙可以被摧毁
        if (tile === CONFIG.TILE_TYPE.BRICK) {
            this.tiles[row][col] = CONFIG.TILE_TYPE.EMPTY;
            return true;
        }
        
        // 钢墙不能被摧毁
        if (tile === CONFIG.TILE_TYPE.STEEL) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 改变基地周围的墙为钢墙
     */
    fortifyBase(duration) {
        const baseX = CONFIG.SPAWN_POINTS.BASE_POSITION.x;
        const baseY = CONFIG.SPAWN_POINTS.BASE_POSITION.y;
        
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 3; dx++) {
                const row = baseY + dy;
                const col = baseX + dx;
                
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    if (dx < 0 || dx > 1 || dy < 0 || dy > 1) {
                        this.tiles[row][col] = CONFIG.TILE_TYPE.STEEL;
                    }
                }
            }
        }
        
        // 定时恢复
        setTimeout(() => {
            this.addBaseProtection(this.tiles);
        }, duration * 1000 / 60); // 转换为毫秒
    }
    
    /**
     * 获取指定位置的地形类型
     */
    getTile(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.tiles[row][col];
    }
    
    /**
     * 渲染地图
     */
    render(renderer, frameCount) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.tiles[row][col];
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                
                switch (tile) {
                    case CONFIG.TILE_TYPE.BRICK:
                        renderer.drawBrick(x, y, this.tileSize);
                        break;
                    case CONFIG.TILE_TYPE.STEEL:
                        renderer.drawSteel(x, y, this.tileSize);
                        break;
                    case CONFIG.TILE_TYPE.WATER:
                        renderer.drawWater(x, y, this.tileSize, frameCount);
                        break;
                    case CONFIG.TILE_TYPE.GRASS:
                        renderer.drawGrass(x, y, this.tileSize);
                        break;
                    case CONFIG.TILE_TYPE.ICE:
                        renderer.drawIce(x, y, this.tileSize);
                        break;
                }
            }
        }
    }
}
