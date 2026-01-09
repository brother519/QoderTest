// 敌方坦克AI控制器
class EnemyAI {
    constructor(tank) {
        this.tank = tank;
        this.lastDirectionChange = Date.now();
        this.directionChangeInterval = 2000; // 2秒改变一次方向
        this.lastFireTime = Date.now();
        this.fireInterval = Helpers.randomInt(1000, 3000); // 随机射击间隔1-3秒
        this.stuckCounter = 0;
        this.lastPosition = { x: tank.x, y: tank.y };
    }
    
    /**
     * AI决策
     */
    makeDecision(collisionDetector, otherTanks) {
        const currentTime = Date.now();
        const action = {
            move: true,
            direction: this.tank.direction,
            fire: false
        };
        
        // 检查是否卡住
        if (this.isStuck()) {
            this.stuckCounter++;
            if (this.stuckCounter > 30) { // 卡住超过30帧
                action.direction = this.getRandomDirection();
                this.lastDirectionChange = currentTime;
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
        }
        
        this.lastPosition = { x: this.tank.x, y: this.tank.y };
        
        // 随机改变方向（5%概率）
        if (Math.random() < 0.05) {
            action.direction = this.getRandomDirection();
            this.lastDirectionChange = currentTime;
        }
        
        // 定时改变方向
        if (currentTime - this.lastDirectionChange > this.directionChangeInterval) {
            action.direction = this.getRandomDirection();
            this.lastDirectionChange = currentTime;
            this.directionChangeInterval = Helpers.randomInt(1500, 3000);
        }
        
        // 检查前方是否有障碍
        if (this.hasObstacleAhead(collisionDetector, otherTanks)) {
            action.direction = this.getRandomDirection();
            this.lastDirectionChange = currentTime;
        }
        
        // 随机射击
        if (currentTime - this.lastFireTime > this.fireInterval) {
            action.fire = true;
            this.lastFireTime = currentTime;
            this.fireInterval = Helpers.randomInt(1000, 3000);
        }
        
        // 随机射击（3%概率）
        if (Math.random() < 0.03) {
            action.fire = true;
        }
        
        return action;
    }
    
    /**
     * 检查坦克是否卡住
     */
    isStuck() {
        const dx = Math.abs(this.tank.x - this.lastPosition.x);
        const dy = Math.abs(this.tank.y - this.lastPosition.y);
        return dx < 0.5 && dy < 0.5;
    }
    
    /**
     * 检查前方是否有障碍
     */
    hasObstacleAhead(collisionDetector, otherTanks) {
        const vector = Helpers.getDirectionVector(this.tank.direction);
        const checkDistance = Constants.TANK_SIZE;
        
        const newX = this.tank.x + vector.x * checkDistance;
        const newY = this.tank.y + vector.y * checkDistance;
        
        return !collisionDetector.canTankMove(this.tank, newX, newY);
    }
    
    /**
     * 获取随机方向
     */
    getRandomDirection() {
        return Helpers.randomDirection();
    }
    
    /**
     * 获取远离当前方向的随机方向
     */
    getAlternativeDirection() {
        const opposite = Helpers.oppositeDirection(this.tank.direction);
        const directions = [0, 1, 2, 3].filter(d => d !== opposite);
        return directions[Helpers.randomInt(0, directions.length - 1)];
    }
}
