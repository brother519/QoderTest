// 地图块类
class Tile {
    constructor(type, x, y) {
        this.type = type;
        this.gridX = x;
        this.gridY = y;
        this.x = gridToPixel(x);
        this.y = gridToPixel(y);
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.destroyed = false;
    }
    
    // 是否可穿越（坦克）
    isPassable() {
        return this.type === CONFIG.TILE_TYPE.EMPTY || 
               this.type === CONFIG.TILE_TYPE.GRASS ||
               this.destroyed;
    }
    
    // 是否可被子弹穿过
    isBulletPassable() {
        return this.type === CONFIG.TILE_TYPE.EMPTY || 
               this.type === CONFIG.TILE_TYPE.GRASS ||
               this.type === CONFIG.TILE_TYPE.WATER ||
               this.destroyed;
    }
    
    // 是否可被破坏
    isDestructible() {
        return this.type === CONFIG.TILE_TYPE.BRICK_WALL;
    }
    
    // 销毁地图块
    destroy() {
        if (this.isDestructible()) {
            this.destroyed = true;
        }
    }
    
    // 获取颜色
    getColor() {
        if (this.destroyed) return CONFIG.COLORS.BACKGROUND;
        
        switch (this.type) {
            case CONFIG.TILE_TYPE.BRICK_WALL:
                return CONFIG.COLORS.BRICK_WALL;
            case CONFIG.TILE_TYPE.STEEL_WALL:
                return CONFIG.COLORS.STEEL_WALL;
            case CONFIG.TILE_TYPE.WATER:
                return CONFIG.COLORS.WATER;
            case CONFIG.TILE_TYPE.BASE:
                return CONFIG.COLORS.BASE;
            case CONFIG.TILE_TYPE.GRASS:
                return CONFIG.COLORS.GRASS;
            default:
                return CONFIG.COLORS.BACKGROUND;
        }
    }
    
    // 渲染
    render(ctx) {
        if (this.type === CONFIG.TILE_TYPE.EMPTY) return;
        
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 为砖墙添加纹理
        if (this.type === CONFIG.TILE_TYPE.BRICK_WALL && !this.destroyed) {
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x + this.width / 2, this.y, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x, this.y + this.height / 2, this.width / 2, this.height / 2);
            ctx.strokeRect(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2);
        }
        
        // 为钢墙添加纹理
        if (this.type === CONFIG.TILE_TYPE.STEEL_WALL) {
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
    }
}
