// 子弹类

import { GameObject } from './GameObject.js';
import { BULLET_CONFIG, ENEMY_BULLET_CONFIG } from '../config.js';

export class Bullet extends GameObject {
    constructor(x, y, isPlayerBullet = true) {
        const config = isPlayerBullet ? BULLET_CONFIG : ENEMY_BULLET_CONFIG;
        super(x, y, config.width, config.height);
        
        this.isPlayerBullet = isPlayerBullet;
        this.speed = config.speed;
        this.color = config.color;
        this.velocityY = isPlayerBullet ? -this.speed : this.speed;
        this.velocityX = 0;
    }

    // 设置速度(用于扇形射击等)
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    update(deltaTime) {
        if (!this.active) return;

        // 移动子弹
        this.y += this.velocityY;
        this.x += this.velocityX;

        // 检查是否超出屏幕
        if (this.isOffScreen()) {
            this.destroy();
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加光晕效果
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    // 重置子弹(对象池使用)
    reset(x, y, isPlayerBullet = true) {
        const config = isPlayerBullet ? BULLET_CONFIG : ENEMY_BULLET_CONFIG;
        this.x = x;
        this.y = y;
        this.width = config.width;
        this.height = config.height;
        this.isPlayerBullet = isPlayerBullet;
        this.speed = config.speed;
        this.color = config.color;
        this.velocityY = isPlayerBullet ? -this.speed : this.speed;
        this.velocityX = 0;
        this.active = true;
    }
}
