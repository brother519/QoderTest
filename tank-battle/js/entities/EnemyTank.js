import { Tank } from './Tank.js';
import { ENEMY_TYPE, ENEMY_CONFIG, DIRECTION, GAME_CONFIG } from '../utils/Constants.js';

// 敌方坦克
export class EnemyTank extends Tank {
    constructor(x, y, type = ENEMY_TYPE.NORMAL) {
        super(x, y);
        this.isPlayer = false;
        this.type = type;
        
        // 根据类型设置属性
        const config = ENEMY_CONFIG[type];
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.color = config.color;
        this.score = config.score;
        
        // AI相关
        this.aiTimer = 0;
        this.aiDecisionInterval = 500 + Math.random() * 500; // 500-1000ms
        this.currentDirection = DIRECTION.DOWN;
        this.shootTimer = 0;
        this.shootInterval = 1500 + Math.random() * 1000; // 1.5-2.5秒
        
        // 卡住检测
        this.stuckTimer = 0;
        this.lastX = x;
        this.lastY = y;
    }

    // 更新
    update(deltaTime, player, map) {
        super.update(deltaTime);
        
        // AI决策
        this.aiTimer += deltaTime;
        if (this.aiTimer >= this.aiDecisionInterval) {
            this.makeDecision(player, map);
            this.aiTimer = 0;
        }
        
        // 射击计时
        this.shootTimer += deltaTime;
        
        // 执行移动
        this.move(this.currentDirection);
        
        // 卡住检测
        this.checkStuck();
    }

    // AI决策
    makeDecision(player, map) {
        // 根据类型选择不同的AI行为
        switch (this.type) {
            case ENEMY_TYPE.FAST:
                this.aggressiveAI(player);
                break;
            case ENEMY_TYPE.ARMORED:
                this.strategyAI(player);
                break;
            default:
                this.simpleAI();
        }
    }

    // 简单AI：随机移动
    simpleAI() {
        const random = Math.random();
        
        if (random < 0.3) {
            // 30%概率改变方向
            this.currentDirection = Math.floor(Math.random() * 4);
        }
        // 否则继续当前方向
    }

    // 攻击型AI：追踪玩家
    aggressiveAI(player) {
        if (!player || player.destroyed) {
            this.simpleAI();
            return;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        // 计算玩家相对位置
        const random = Math.random();
        
        if (random < 0.7) {
            // 70%概率朝向玩家移动
            if (Math.abs(dx) > Math.abs(dy)) {
                this.currentDirection = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
            } else {
                this.currentDirection = dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
            }
        } else {
            // 30%概率随机移动(防止太过预测)
            this.simpleAI();
        }
    }

    // 策略型AI：优先攻击基地
    strategyAI(player) {
        // 基地在底部中央
        const baseX = GAME_CONFIG.CANVAS_WIDTH / 2;
        const baseY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.TILE_SIZE * 2;
        
        const dx = baseX - this.x;
        const dy = baseY - this.y;
        
        const random = Math.random();
        
        if (random < 0.6) {
            // 60%概率朝向基地
            if (Math.abs(dx) > Math.abs(dy)) {
                this.currentDirection = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
            } else {
                this.currentDirection = dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
            }
        } else if (random < 0.8 && player && !player.destroyed) {
            // 20%概率追踪玩家
            this.aggressiveAI(player);
        } else {
            // 20%概率随机移动
            this.simpleAI();
        }
    }

    // 检查是否卡住
    checkStuck() {
        const moved = Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1;
        
        if (!moved) {
            this.stuckTimer += 16; // 约一帧
            if (this.stuckTimer > 500) {
                // 卡住超过500ms，改变方向
                this.currentDirection = (this.currentDirection + 1 + Math.floor(Math.random() * 3)) % 4;
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastX = this.x;
        this.lastY = this.y;
    }

    // 尝试射击
    tryShoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shootInterval = 1500 + Math.random() * 1000;
            return this.shoot();
        }
        return null;
    }
}
