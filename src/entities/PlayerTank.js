// 玩家坦克
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, Constants.COLORS.PLAYER_TANK);
        this.lives = Constants.PLAYER_LIVES;
        this.type = Constants.TANK_TYPE.PLAYER;
    }
    
    /**
     * 更新玩家坦克
     */
    update(deltaTime, inputManager, collisionDetector, otherTanks) {
        if (!this.active) return;
        
        // 获取方向输入
        const directionInput = inputManager.getDirectionInput();
        
        if (directionInput !== null) {
            this.move(directionInput, collisionDetector, otherTanks);
        }
        
        // 检查射击输入
        if (inputManager.isFirePressed()) {
            const bullet = this.fire();
            if (bullet) {
                return bullet; // 返回新子弹给游戏管理
            }
        }
        
        return null;
    }
    
    /**
     * 重生
     */
    respawn() {
        if (this.lives > 0) {
            this.x = Constants.PLAYER_SPAWN.x;
            this.y = Constants.PLAYER_SPAWN.y;
            this.direction = Constants.DIRECTION.UP;
            this.hp = 1;
            this.active = true;
            this.bullet = null;
            return true;
        }
        return false;
    }
    
    /**
     * 死亡处理
     */
    die() {
        this.lives--;
        this.active = false;
        return this.lives > 0;
    }
}
