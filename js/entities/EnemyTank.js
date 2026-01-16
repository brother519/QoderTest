import { Tank } from './Tank.js';
import { Constants } from '../utils/Constants.js';

// 敌方坦克类型配置
const EnemyTypes = {
    NORMAL: {
        speed: 60,
        health: 1,
        fireRate: 1.5,
        color: Constants.COLORS.ENEMY_TANK,
        darkColor: Constants.COLORS.ENEMY_TANK_DARK
    },
    FAST: {
        speed: 100,
        health: 1,
        fireRate: 1.2,
        color: '#FF69B4',
        darkColor: '#C71585'
    },
    ARMOR: {
        speed: 40,
        health: 3,
        fireRate: 2,
        color: '#32CD32',
        darkColor: '#228B22'
    }
};

// 敌方坦克类
export class EnemyTank extends Tank {
    constructor(x, y, type = 'NORMAL') {
        super(x, y, Constants.DIRECTION.DOWN);
        
        const config = EnemyTypes[type] || EnemyTypes.NORMAL;
        this.type = type;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.fireRate = config.fireRate;
        this.color = config.color;
        this.darkColor = config.darkColor;
        
        this.moveTimer = 0;
        this.actionInterval = Constants.AI_DECISION_INTERVAL;
        this.targetDirection = this.direction;
    }
    
    update(deltaTime, aiController, map, playerTank, base, currentTime) {
        if (!this.isAlive) return null;
        
        // AI决策
        const action = aiController.decide(this, playerTank, base, map, deltaTime);
        
        if (action.move) {
            this.move(action.direction, deltaTime, map);
        }
        
        if (action.fire && this.canFire(currentTime)) {
            return this.fire(currentTime);
        }
        
        return null;
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        super.render(ctx, this.color, this.darkColor);
        
        // 显示血量（如果是装甲坦克）
        if (this.maxHealth > 1 && this.health > 0) {
            ctx.fillStyle = '#FF0000';
            const barWidth = this.size * 0.8;
            const barHeight = 4;
            const barX = this.x + (this.size - barWidth) / 2;
            const barY = this.y - 8;
            
            // 背景
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 血量
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }
}
