// 道具类

import { GameObject } from './GameObject.js';
import { POWERUP_TYPES } from '../config.js';

export class PowerUp extends GameObject {
    constructor(x, y, type = 'HEALTH') {
        const config = POWERUP_TYPES[type];
        super(x, y, config.width, config.height);
        
        this.type = type;
        this.config = config;
        this.speed = config.speed;
        this.color = config.color;
        this.effect = config.effect;
    }

    update(deltaTime) {
        if (!this.active) return;

        // 向下移动
        this.y += this.speed;

        // 检查是否超出屏幕
        if (this.isOffScreen()) {
            this.destroy();
        }
    }

    render(ctx) {
        if (!this.active) return;

        // 绘制道具(圆形)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = this.width / 2;

        // 外圈光晕
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 绘制道具图标
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch (this.type) {
            case 'HEALTH':
                icon = '+';
                break;
            case 'FIREPOWER':
                icon = 'F';
                break;
            case 'SHIELD':
                icon = 'S';
                break;
        }
        
        ctx.fillText(icon, centerX, centerY);
    }

    // 应用道具效果
    applyEffect(player) {
        switch (this.effect) {
            case 'health':
                player.heal();
                break;
            case 'firepower':
                player.upgradeFire();
                break;
            case 'shield':
                player.gainShield();
                break;
        }
        this.destroy();
    }
}
