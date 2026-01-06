// 玩家坦克类
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, CONFIG.DIRECTION.UP, CONFIG.COLORS.PLAYER_TANK);
        this.health = CONFIG.PLAYER_HEALTH;
    }
    
    // 更新
    update(deltaTime, inputHandler, map) {
        if (!this.alive) return;
        
        // 处理移动输入
        if (inputHandler.isMoving()) {
            const direction = inputHandler.getMoveDirection();
            if (direction !== null) {
                this.move(direction, map);
            }
        }
    }
}
