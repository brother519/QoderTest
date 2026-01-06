// 敌方坦克类
class EnemyTank extends Tank {
    constructor(x, y) {
        super(x, y, CONFIG.DIRECTION.DOWN, CONFIG.COLORS.ENEMY_TANK);
        this.health = CONFIG.ENEMY_HEALTH;
        this.lastDirectionChangeTime = 0;
        this.directionChangeInterval = randomInt(1000, 2000);
        this.lastShootAttemptTime = 0;
        this.shootInterval = randomInt(1500, 3000);
    }
    
    // AI更新
    update(deltaTime, map) {
        if (!this.alive) return;
        
        const now = Date.now();
        
        // 随机改变方向
        if (now - this.lastDirectionChangeTime > this.directionChangeInterval) {
            this.changeDirection();
            this.lastDirectionChangeTime = now;
            this.directionChangeInterval = randomInt(1000, 2000);
        }
        
        // 尝试移动
        const moved = this.move(this.direction, map);
        
        // 如果移动失败，立即改变方向
        if (!moved) {
            this.changeDirection();
        }
    }
    
    // 改变方向
    changeDirection() {
        const directions = [
            CONFIG.DIRECTION.UP,
            CONFIG.DIRECTION.RIGHT,
            CONFIG.DIRECTION.DOWN,
            CONFIG.DIRECTION.LEFT
        ];
        this.direction = randomChoice(directions);
    }
    
    // AI射击决策
    shouldShoot() {
        const now = Date.now();
        if (now - this.lastShootAttemptTime > this.shootInterval) {
            this.lastShootAttemptTime = now;
            this.shootInterval = randomInt(1500, 3000);
            return Math.random() < 0.5; // 50%概率射击
        }
        return false;
    }
}
