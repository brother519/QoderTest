// 敌方坦克
class EnemyTank extends Tank {
    constructor(x, y, type = Constants.TANK_TYPE.ENEMY_NORMAL) {
        // 根据类型设置颜色
        let color;
        switch(type) {
            case Constants.TANK_TYPE.ENEMY_FAST:
                color = Constants.COLORS.ENEMY_FAST;
                break;
            case Constants.TANK_TYPE.ENEMY_ARMOR:
                color = Constants.COLORS.ENEMY_ARMOR;
                break;
            case Constants.TANK_TYPE.ENEMY_BONUS:
                color = Constants.COLORS.ENEMY_BONUS;
                break;
            default:
                color = Constants.COLORS.ENEMY_TANK;
        }
        
        super(x, y, color);
        this.type = type;
        this.ai = new EnemyAI(this);
        
        // 根据类型设置属性
        this.setupType();
    }
    
    /**
     * 根据敌人类型设置属性
     */
    setupType() {
        switch(this.type) {
            case Constants.TANK_TYPE.ENEMY_FAST:
                this.speed = Constants.TANK_SPEED * 1.5;
                this.hp = 1;
                break;
            case Constants.TANK_TYPE.ENEMY_ARMOR:
                this.speed = Constants.TANK_SPEED * 0.8;
                this.hp = 3;
                break;
            case Constants.TANK_TYPE.ENEMY_BONUS:
                this.speed = Constants.TANK_SPEED;
                this.hp = 1;
                break;
            default: // ENEMY_NORMAL
                this.speed = Constants.TANK_SPEED;
                this.hp = 1;
        }
    }
    
    /**
     * 更新敌方坦克
     */
    update(deltaTime, collisionDetector, otherTanks) {
        if (!this.active) return null;
        
        // AI决策
        const action = this.ai.makeDecision(collisionDetector, otherTanks);
        
        // 执行移动
        if (action.move) {
            this.move(action.direction, collisionDetector, otherTanks);
        }
        
        // 执行射击
        if (action.fire) {
            const bullet = this.fire();
            if (bullet) {
                return bullet;
            }
        }
        
        return null;
    }
    
    /**
     * 获取分数
     */
    getScore() {
        switch(this.type) {
            case Constants.TANK_TYPE.ENEMY_FAST:
                return Constants.SCORES.ENEMY_FAST;
            case Constants.TANK_TYPE.ENEMY_ARMOR:
                return Constants.SCORES.ENEMY_ARMOR;
            case Constants.TANK_TYPE.ENEMY_BONUS:
                return Constants.SCORES.ENEMY_BONUS;
            default:
                return Constants.SCORES.ENEMY_NORMAL;
        }
    }
}
