// 敌机类

import { GameObject } from './GameObject.js';
import { ENEMY_TYPES, CANVAS_WIDTH } from '../config.js';

export class Enemy extends GameObject {
    constructor(x, y, type = 'SMALL') {
        const config = ENEMY_TYPES[type];
        super(x, y, config.width, config.height);
        
        this.type = type;
        this.config = config;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.score = config.score;
        this.color = config.color;
        this.shootInterval = config.shootInterval;
        this.lastShootTime = 0;
        this.movePattern = config.movePattern;
        
        // 移动参数
        this.moveTimer = 0;
        this.amplitude = 50; // S型移动幅度
        this.frequency = 0.002; // 移动频率
        this.originalX = x;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.moveTimer += deltaTime;

        // 根据移动模式更新位置
        switch (this.movePattern) {
            case 'straight':
                this.y += this.speed;
                break;
                
            case 'sine':
                this.y += this.speed;
                this.x = this.originalX + Math.sin(this.moveTimer * this.frequency) * this.amplitude;
                break;
                
            case 'zigzag':
                this.y += this.speed;
                const zigzagPeriod = 1000;
                const phase = Math.floor(this.moveTimer / zigzagPeriod) % 2;
                this.x += (phase === 0 ? 1 : -1) * this.speed * 0.5;
                this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
                break;
        }

        // 检查是否超出屏幕
        if (this.isOffScreen()) {
            this.destroy();
        }
    }

    render(ctx) {
        if (!this.active) return;

        // 绘制敌机(矩形)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 绘制血量条(如果不是满血)
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
    }

    // 受伤
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
            return true; // 敌机死亡
        }
        return false;
    }

    // 是否可以射击
    canShoot(currentTime) {
        if (this.shootInterval === 0) return false;
        return currentTime - this.lastShootTime >= this.shootInterval;
    }

    // 射击
    shoot(currentTime) {
        this.lastShootTime = currentTime;
        return {
            x: this.x + this.width / 2 - 2,
            y: this.y + this.height
        };
    }
}
