// 地图管理类
class Map {
    constructor() {
        this.tiles = [];
        this.basePosition = null;
        this.init();
    }
    
    // 初始化地图
    init() {
        this.tiles = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tileType = MAP_DATA[y][x];
                this.tiles[y][x] = new Tile(tileType, x, y);
                
                // 记录基地位置
                if (tileType === CONFIG.TILE_TYPE.BASE) {
                    if (!this.basePosition) {
                        this.basePosition = { x: x, y: y };
                    }
                }
            }
        }
    }
    
    // 获取指定网格位置的tile
    getTile(gridX, gridY) {
        if (!isInGrid(gridX, gridY)) {
            return null;
        }
        return this.tiles[gridY][gridX];
    }
    
    // 获取指定像素位置的tile
    getTileAtPixel(pixelX, pixelY) {
        const gridX = pixelToGrid(pixelX);
        const gridY = pixelToGrid(pixelY);
        return this.getTile(gridX, gridY);
    }
    
    // 检查矩形区域是否可通过（坦克）
    isRectPassable(rect) {
        // 检查矩形四个角的tile
        const corners = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width - 1, y: rect.y },
            { x: rect.x, y: rect.y + rect.height - 1 },
            { x: rect.x + rect.width - 1, y: rect.y + rect.height - 1 }
        ];
        
        for (let corner of corners) {
            const tile = this.getTileAtPixel(corner.x, corner.y);
            if (!tile || !tile.isPassable()) {
                return false;
            }
        }
        
        return true;
    }
    
    // 检查点是否可通过（子弹）
    isPointBulletPassable(x, y) {
        const tile = this.getTileAtPixel(x, y);
        if (!tile) return false;
        return tile.isBulletPassable();
    }
    
    // 销毁指定位置的tile
    destroyTileAtPixel(x, y) {
        const tile = this.getTileAtPixel(x, y);
        if (tile && tile.isDestructible()) {
            tile.destroy();
            return true;
        }
        return false;
    }
    
    // 检查是否击中基地
    isBaseAt(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile && tile.type === CONFIG.TILE_TYPE.BASE;
    }
    
    // 获取基地的像素坐标
    getBasePixelPosition() {
        if (this.basePosition) {
            return {
                x: gridToPixel(this.basePosition.x),
                y: gridToPixel(this.basePosition.y)
            };
        }
        return null;
    }
    
    // 渲染地图
    render(ctx) {
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                this.tiles[y][x].render(ctx);
            }
        }
    }
    
    // 重置地图
    reset() {
        this.init();
    }
}
