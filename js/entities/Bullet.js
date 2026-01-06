// 子弹类
class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.BULLET_SIZE;
        this.height = CONFIG.BULLET_SIZE;
        this.direction = direction;
        this.speed = CONFIG.BULLET_SPEED;
        this.owner = owner;
        this.active = true;
    }
    
    // 更新位置
    update() {
        if (!this.active) return;
        
        const vector = DIRECTION_VECTORS[this.direction];
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
        
        // 边界检测
        if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
            this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
            this.active = false;
        }
    }
    
    // 检查与地图碰撞
    checkMapCollision(map) {
        if (!this.active) return false;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 检查是否可穿过
        if (!map.isPointBulletPassable(centerX, centerY)) {
            // 尝试销毁tile
            map.destroyTileAtPixel(centerX, centerY);
            this.active = false;
            return true;
        }
        
        // 检查是否击中基地
        const gridX = pixelToGrid(centerX);
        const gridY = pixelToGrid(centerY);
        if (map.isBaseAt(gridX, gridY)) {
            return true;
        }
        
        return false;
    }
    
    // 检查与坦克碰撞
    checkTankCollision(tank) {
        if (!this.active || !tank.alive) return false;
        if (this.owner === tank) return false;
        
        return checkAABBCollision(this, tank);
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
    
    // 销毁
    destroy() {
        this.active = false;
    }
}
