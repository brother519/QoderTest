// 玩家飞机类

import { GameObject } from './GameObject.js';
import { PLAYER_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT, FIREPOWER_LEVELS, GAME_BALANCE } from '../config.js';

export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, PLAYER_CONFIG.width, PLAYER_CONFIG.height);
        
        this.speed = PLAYER_CONFIG.speed;
        this.health = PLAYER_CONFIG.health;
        this.maxHealth = PLAYER_CONFIG.health;
        this.shootInterval = PLAYER_CONFIG.shootInterval;
        this.lastShootTime = 0;
        this.color = PLAYER_CONFIG.color;
        
        // 火力等级
        this.firePowerLevel = 1;
        
        // 护盾
        this.hasShield = false;
        
        // 无敌状态
        this.invincible = false;
        this.invincibleTimer = 0;
        
        // 死亡标志
        this.dead = false;
    }

    update(deltaTime, keys, mouse) {
        if (!this.active || this.dead) return;

        // 更新无敌计时器
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // 键盘控制
        const moveSpeed = this.speed;
        if (keys['w'] || keys['ArrowUp']) {
            this.y -= moveSpeed;
        }
        if (keys['s'] || keys['ArrowDown']) {
            this.y += moveSpeed;
        }
        if (keys['a'] || keys['ArrowLeft']) {
            this.x -= moveSpeed;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.x += moveSpeed;
        }

        // 边界限制
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y));
    }

    render(ctx) {
        if (!this.active || this.dead) return;

        // 无敌时闪烁
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // 绘制护盾
        if (this.hasShield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 绘制飞机(三角形)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // 添加光晕
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1.0;
    }

    // 射击
    canShoot(currentTime) {
        return currentTime - this.lastShootTime >= this.shootInterval;
    }

    shoot(currentTime) {
        this.lastShootTime = currentTime;
        return this.getBulletPositions();
    }

    // 根据火力等级获取子弹位置
    getBulletPositions() {
        const level = FIREPOWER_LEVELS[this.firePowerLevel] || FIREPOWER_LEVELS[1];
        const centerX = this.x + this.width / 2;
        const topY = this.y;
        const positions = [];

        if (level.bulletCount === 1) {
            positions.push({ x: centerX - 2, y: topY });
        } else if (level.bulletCount === 2) {
            positions.push({ x: centerX - level.spread - 2, y: topY });
            positions.push({ x: centerX + level.spread - 2, y: topY });
        } else if (level.bulletCount === 3) {
            positions.push({ x: centerX - 2, y: topY, angle: -level.spread });
            positions.push({ x: centerX - 2, y: topY, angle: 0 });
            positions.push({ x: centerX - 2, y: topY, angle: level.spread });
        }

        return positions;
    }

    // 受伤
    takeDamage() {
        if (this.invincible) return false;

        if (this.hasShield) {
            this.hasShield = false;
            return false;
        }

        this.health--;
        if (this.health <= 0) {
            this.dead = true;
            this.active = false;
            return true;
        }

        this.invincible = true;
        this.invincibleTimer = GAME_BALANCE.invincibilityDuration;
        return false;
    }

    // 加血
    heal() {
        this.health = Math.min(this.health + 1, this.maxHealth);
    }

    // 提升火力
    upgradeFire() {
        this.firePowerLevel = Math.min(this.firePowerLevel + 1, 3);
    }

    // 获得护盾
    gainShield() {
        this.hasShield = true;
    }

    // 重置
    reset() {
        this.health = this.maxHealth;
        this.firePowerLevel = 1;
        this.hasShield = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.dead = false;
        this.active = true;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - 100;
    }
}
