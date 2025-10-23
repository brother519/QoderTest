import { CONFIG } from '../config.js';
import { Bullet } from './Bullet.js';

/**
 * 坦克实体
 */
export class Tank {
    constructor(x, y, type, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.TANK.SIZE;
        this.height = CONFIG.TANK.SIZE;
        this.type = type;
        this.isPlayer = isPlayer;
        
        // 移动属性
        this.direction = CONFIG.DIRECTION.UP;
        this.speed = isPlayer ? CONFIG.TANK.PLAYER_SPEED : CONFIG.TANK.ENEMY_SPEED;
        
        // 战斗属性
        this.lives = isPlayer ? 3 : 1;
        this.isAlive = true;
        this.shootCooldown = 0;
        this.maxBullets = CONFIG.BULLET.MAX_COUNT;
        this.activeBullets = 0;
        
        // 特殊状态
        this.isInvincible = isPlayer; // 玩家出生时无敌
        this.invincibleTime = isPlayer ? CONFIG.TANK.SPAWN_INVINCIBLE_TIME : 0;
        this.isFrozen = false;
        this.frozenTime = 0;
        
        // 升级等级
        this.level = 0;
    }
    
    /**
     * 移动坦克
     */
    move(direction, map, otherTanks) {
        if (this.isFrozen) return;
        
        this.direction = direction;
        
        // 计算新位置
        let newX = this.x;
        let newY = this.y;
        
        switch (direction) {
            case CONFIG.DIRECTION.UP:
                newY -= this.speed;
                break;
            case CONFIG.DIRECTION.DOWN:
                newY += this.speed;
                break;
            case CONFIG.DIRECTION.LEFT:
                newX -= this.speed;
                break;
            case CONFIG.DIRECTION.RIGHT:
                newX += this.speed;
                break;
        }
        
        // 边界检查
        if (newX < 0 || newX + this.width > CONFIG.CANVAS_WIDTH ||
            newY < 0 || newY + this.height > CONFIG.CANVAS_HEIGHT) {
            return;
        }
        
        // 检查地图碰撞
        if (map.checkTankCollision(newX, newY, this.width, this.height)) {
            return;
        }
        
        // 检查与其他坦克碰撞
        for (const tank of otherTanks) {
            if (tank === this || !tank.isAlive) continue;
            
            if (this.checkCollisionWith(newX, newY, tank)) {
                return;
            }
        }
        
        // 更新位置
        this.x = newX;
        this.y = newY;
    }
    
    /**
     * 检查与其他对象碰撞
     */
    checkCollisionWith(x, y, other) {
        return x < other.x + other.width &&
               x + this.width > other.x &&
               y < other.y + other.height &&
               y + this.height > other.y;
    }
    
    /**
     * 射击
     */
    shoot() {
        if (this.shootCooldown > 0) return null;
        if (this.activeBullets >= this.maxBullets) return null;
        
        // 重置冷却时间
        this.shootCooldown = CONFIG.TANK.SHOOT_COOLDOWN;
        this.activeBullets++;
        
        // 计算子弹位置
        let bulletX = this.x + this.width / 2 - CONFIG.BULLET.SIZE / 2;
        let bulletY = this.y + this.height / 2 - CONFIG.BULLET.SIZE / 2;
        
        // 根据方向调整子弹初始位置
        switch (this.direction) {
            case CONFIG.DIRECTION.UP:
                bulletY = this.y - CONFIG.BULLET.SIZE;
                break;
            case CONFIG.DIRECTION.DOWN:
                bulletY = this.y + this.height;
                break;
            case CONFIG.DIRECTION.LEFT:
                bulletX = this.x - CONFIG.BULLET.SIZE;
                break;
            case CONFIG.DIRECTION.RIGHT:
                bulletX = this.x + this.width;
                break;
        }
        
        return new Bullet(bulletX, bulletY, this.direction, this);
    }
    
    /**
     * 受到伤害
     */
    takeDamage() {
        if (this.isInvincible) return;
        
        this.lives--;
        
        if (this.lives <= 0) {
            this.isAlive = false;
        } else if (this.isPlayer) {
            // 玩家重生，获得短暂无敌
            this.respawn();
        }
    }
    
    /**
     * 重生
     */
    respawn() {
        const spawnPoint = this.type === CONFIG.TANK_TYPE.PLAYER1
            ? CONFIG.SPAWN_POINTS.PLAYER1
            : CONFIG.SPAWN_POINTS.PLAYER2;
        
        this.x = spawnPoint.x * CONFIG.TILE_SIZE;
        this.y = spawnPoint.y * CONFIG.TILE_SIZE;
        this.direction = CONFIG.DIRECTION.UP;
        this.isInvincible = true;
        this.invincibleTime = CONFIG.TANK.SPAWN_INVINCIBLE_TIME;
    }
    
    /**
     * 冻结
     */
    freeze(duration) {
        this.isFrozen = true;
        this.frozenTime = duration;
    }
    
    /**
     * 升级
     */
    upgrade() {
        if (this.level < 3) {
            this.level++;
            // 等级越高，射速越快
            this.maxBullets = CONFIG.BULLET.MAX_COUNT + this.level;
        }
    }
    
    /**
     * 更新坦克状态
     */
    update() {
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // 更新无敌状态
        if (this.isInvincible && this.invincibleTime > 0) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.isInvincible = false;
            }
        }
        
        // 更新冻结状态
        if (this.isFrozen && this.frozenTime > 0) {
            this.frozenTime--;
            if (this.frozenTime <= 0) {
                this.isFrozen = false;
            }
        }
    }
    
    /**
     * 渲染坦克
     */
    render(renderer, frameCount) {
        if (!this.isAlive) return;
        
        // 选择颜色
        let color;
        if (this.isPlayer) {
            color = this.type === CONFIG.TANK_TYPE.PLAYER1 ? '#ffff00' : '#00ff00';
        } else {
            color = '#ff0000';
        }
        
        // 如果被冻结，变成蓝色
        if (this.isFrozen) {
            color = '#0000ff';
        }
        
        // 绘制坦克
        renderer.drawTank(this.x, this.y, this.direction, color, this.width);
        
        // 绘制无敌护盾
        if (this.isInvincible) {
            renderer.drawShield(this.x, this.y, this.width, frameCount);
        }
    }
    
    /**
     * 减少活跃子弹计数
     */
    decreaseBulletCount() {
        if (this.activeBullets > 0) {
            this.activeBullets--;
        }
    }
}
