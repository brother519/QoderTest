import { Tank } from './Tank.js';
import { Constants } from '../utils/Constants.js';

// 玩家坦克类
export class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, Constants.DIRECTION.UP);
        this.lives = Constants.PLAYER_LIVES;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = Constants.PLAYER_INVINCIBLE_TIME * 1000;
        this.spawnX = x;
        this.spawnY = y;
    }
    
    update(deltaTime, inputHandler, map, currentTime) {
        if (!this.isAlive) return;
        
        // 更新无敌状态
        if (this.isInvincible) {
            this.invincibleTimer -= deltaTime * 1000;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        // 处理移动输入
        if (inputHandler.isUpPressed()) {
            this.move(Constants.DIRECTION.UP, deltaTime, map);
        } else if (inputHandler.isDownPressed()) {
            this.move(Constants.DIRECTION.DOWN, deltaTime, map);
        } else if (inputHandler.isLeftPressed()) {
            this.move(Constants.DIRECTION.LEFT, deltaTime, map);
        } else if (inputHandler.isRightPressed()) {
            this.move(Constants.DIRECTION.RIGHT, deltaTime, map);
        }
        
        // 处理射击
        if (inputHandler.isFirePressed()) {
            return this.fire(currentTime);
        }
        
        return null;
    }
    
    takeDamage(amount = 1) {
        if (this.isInvincible) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.lives--;
            if (this.lives > 0) {
                this.respawn();
            } else {
                this.destroy();
            }
        }
    }
    
    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.direction = Constants.DIRECTION.UP;
        this.health = 1;
        this.isAlive = true;
        this.isInvincible = true;
        this.invincibleTimer = this.invincibleDuration;
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        const colors = Constants.COLORS;
        
        // 无敌状态闪烁效果
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        super.render(ctx, colors.PLAYER_TANK, colors.PLAYER_TANK_DARK);
        
        ctx.globalAlpha = 1;
        
        // 无敌护盾效果
        if (this.isInvincible) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.size / 2,
                this.y + this.size / 2,
                this.size / 2 + 4,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
}
