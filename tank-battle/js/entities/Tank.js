import { GAME_CONFIG, DIRECTION, DIRECTION_VECTORS, TANK_CONFIG } from '../utils/Constants.js';
import { Bullet } from './Bullet.js';

// 坦克基类
export class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.TILE_SIZE * 2; // 坦克占2x2格子
        this.direction = DIRECTION.UP;
        this.lastDirection = DIRECTION.UP;
        this.speed = TANK_CONFIG.PLAYER_SPEED;
        this.health = 1;
        this.maxHealth = 1;
        this.destroyed = false;
        
        this.color = '#4CAF50';
        this.isPlayer = false;
        
        // 射击相关
        this.shootCooldown = 0;
        this.shootCooldownTime = TANK_CONFIG.SHOOT_COOLDOWN;
        this.bulletSpeed = TANK_CONFIG.BULLET_SPEED;
        this.bulletDamage = 1;
        this.bulletEnhanced = false;
        
        // 护盾
        this.shielded = false;
        this.shieldTimer = 0;
        
        // 移动动画
        this.trackOffset = 0;
    }

    // 移动
    move(direction) {
        this.direction = direction;
        this.lastDirection = direction;
        
        const vector = DIRECTION_VECTORS[direction];
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
        
        // 更新履带动画
        this.trackOffset = (this.trackOffset + 1) % 8;
    }

    // 射击
    shoot() {
        if (this.shootCooldown > 0) return null;
        
        this.shootCooldown = this.shootCooldownTime;
        
        // 计算子弹初始位置(从炮管发射)
        const bulletSize = 8;
        let bulletX = this.x + this.size / 2 - bulletSize / 2;
        let bulletY = this.y + this.size / 2 - bulletSize / 2;
        
        const offset = this.size / 2;
        switch (this.direction) {
            case DIRECTION.UP:
                bulletY = this.y - bulletSize;
                break;
            case DIRECTION.DOWN:
                bulletY = this.y + this.size;
                break;
            case DIRECTION.LEFT:
                bulletX = this.x - bulletSize;
                break;
            case DIRECTION.RIGHT:
                bulletX = this.x + this.size;
                break;
        }
        
        return new Bullet(
            bulletX,
            bulletY,
            this.direction,
            this.bulletSpeed,
            this.bulletDamage,
            this.isPlayer,
            this.bulletEnhanced
        );
    }

    // 受到伤害
    takeDamage(amount) {
        if (this.shielded) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }

    // 更新
    update(deltaTime) {
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // 更新护盾
        if (this.shielded && this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shielded = false;
            }
        }
    }

    // 对齐到网格(用于更精确的移动)
    alignToGrid() {
        const halfTile = GAME_CONFIG.TILE_SIZE / 2;
        
        if (this.direction === DIRECTION.UP || this.direction === DIRECTION.DOWN) {
            // 垂直移动时对齐X轴
            this.x = Math.round(this.x / halfTile) * halfTile;
        } else {
            // 水平移动时对齐Y轴
            this.y = Math.round(this.y / halfTile) * halfTile;
        }
    }
}
