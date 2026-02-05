// 坦克基类
class Tank extends Entity {
    constructor(x, y, color) {
        super(x, y, Constants.TANK_SIZE);
        this.direction = Constants.DIRECTION.UP;
        this.speed = Constants.TANK_SPEED;
        this.color = color;
        this.bullet = null;
        this.lastFireTime = 0;
        this.hp = 1;
    }
    
    /**
     * 移动坦克
     */
    move(direction, collisionDetector, otherTanks) {
        // 如果改变方向，先对齐网格
        if (this.direction !== direction) {
            this.alignToGrid();
            this.direction = direction;
        }
        
        // 计算新位置
        const vector = Helpers.getDirectionVector(direction);
        const newX = this.x + vector.x * this.speed;
        const newY = this.y + vector.y * this.speed;
        
        // 检查碰撞
        if (collisionDetector.canTankMove(this, newX, newY)) {
            // 检查与其他坦克的碰撞
            const oldX = this.x;
            const oldY = this.y;
            this.x = newX;
            this.y = newY;
            
            if (collisionDetector.checkTankCollisions(this, otherTanks)) {
                // 恢复位置
                this.x = oldX;
                this.y = oldY;
                return false;
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 对齐到网格（转向时使用）
     */
    alignToGrid() {
        const gridSize = Constants.TANK_GRID_ALIGN;
        
        // 根据当前方向决定如何对齐
        if (this.direction === Constants.DIRECTION.UP || this.direction === Constants.DIRECTION.DOWN) {
            // 垂直移动时，对齐X坐标
            this.x = Helpers.alignToGrid(this.x, gridSize);
        } else {
            // 水平移动时，对齐Y坐标
            this.y = Helpers.alignToGrid(this.y, gridSize);
        }
    }
    
    /**
     * 射击
     */
    fire() {
        const currentTime = Date.now();
        
        // 检查射击冷却
        if (this.bullet && this.bullet.active) {
            return null;
        }
        
        if (currentTime - this.lastFireTime < Constants.FIRE_COOLDOWN) {
            return null;
        }
        
        this.lastFireTime = currentTime;
        
        // 计算子弹位置（从炮管发射）
        const vector = Helpers.getDirectionVector(this.direction);
        let bulletX = this.x + this.size / 2 - Constants.BULLET_SIZE / 2;
        let bulletY = this.y + this.size / 2 - Constants.BULLET_SIZE / 2;
        
        // 根据方向调整子弹起始位置
        const offset = this.size / 2 + 8;
        bulletX += vector.x * offset;
        bulletY += vector.y * offset;
        
        this.bullet = new Bullet(bulletX, bulletY, this.direction, this);
        return this.bullet;
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
    
    /**
     * 更新坦克
     */
    update(deltaTime) {
        // 子类实现具体的更新逻辑
    }
    
    /**
     * 渲染坦克
     */
    render(renderer) {
        renderer.drawTank(this);
    }
}
