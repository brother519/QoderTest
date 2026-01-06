// 坦克基类
class Tank {
    constructor(x, y, direction, color) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.TANK_SIZE;
        this.height = CONFIG.TANK_SIZE;
        this.direction = direction;
        this.speed = CONFIG.TANK_SPEED;
        this.color = color;
        this.health = 1;
        this.alive = true;
        this.lastShootTime = 0;
    }
    
    // 移动
    move(direction, map) {
        // 保存当前位置
        const oldX = this.x;
        const oldY = this.y;
        
        // 更新方向
        this.direction = direction;
        
        // 计算新位置
        const vector = DIRECTION_VECTORS[direction];
        const newX = this.x + vector.x * this.speed;
        const newY = this.y + vector.y * this.speed;
        
        // 临时移动
        this.x = newX;
        this.y = newY;
        
        // 边界检测
        if (this.x < 0 || this.x + this.width > CONFIG.CANVAS_WIDTH ||
            this.y < 0 || this.y + this.height > CONFIG.CANVAS_HEIGHT) {
            this.x = oldX;
            this.y = oldY;
            return false;
        }
        
        // 地图碰撞检测
        if (!map.isRectPassable(this)) {
            this.x = oldX;
            this.y = oldY;
            return false;
        }
        
        return true;
    }
    
    // 射击
    shoot() {
        const now = Date.now();
        if (now - this.lastShootTime < CONFIG.SHOOT_COOLDOWN) {
            return null;
        }
        
        this.lastShootTime = now;
        
        // 计算子弹初始位置（坦克中心）
        const center = getRectCenter(this);
        let bulletX = center.x - CONFIG.BULLET_SIZE / 2;
        let bulletY = center.y - CONFIG.BULLET_SIZE / 2;
        
        // 根据方向调整子弹位置（让子弹从炮管口发射）
        switch (this.direction) {
            case CONFIG.DIRECTION.UP:
                bulletY = this.y - CONFIG.BULLET_SIZE;
                break;
            case CONFIG.DIRECTION.RIGHT:
                bulletX = this.x + this.width;
                break;
            case CONFIG.DIRECTION.DOWN:
                bulletY = this.y + this.height;
                break;
            case CONFIG.DIRECTION.LEFT:
                bulletX = this.x - CONFIG.BULLET_SIZE;
                break;
        }
        
        return new Bullet(bulletX, bulletY, this.direction, this);
    }
    
    // 受到伤害
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
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
    
    // 更新
    update(deltaTime) {
        // 子类实现
    }
}
