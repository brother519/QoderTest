// 基地类
class Base {
    constructor() {
        const basePos = MAP_DATA.findIndex(row => row.includes(CONFIG.TILE_TYPE.BASE));
        const baseCol = MAP_DATA[basePos].indexOf(CONFIG.TILE_TYPE.BASE);
        
        this.gridX = baseCol;
        this.gridY = basePos;
        this.x = gridToPixel(baseCol);
        this.y = gridToPixel(basePos);
        this.width = CONFIG.TILE_SIZE * 2;
        this.height = CONFIG.TILE_SIZE * 2;
        this.destroyed = false;
    }
    
    // 检查子弹碰撞
    checkBulletCollision(bullet) {
        if (this.destroyed) return false;
        
        const centerX = bullet.x + bullet.width / 2;
        const centerY = bullet.y + bullet.height / 2;
        
        return centerX >= this.x && centerX <= this.x + this.width &&
               centerY >= this.y && centerY <= this.y + this.height;
    }
    
    // 销毁基地
    destroy() {
        this.destroyed = true;
    }
    
    // 获取边界框
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
