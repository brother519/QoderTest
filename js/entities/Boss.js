// Boss类

import { GameObject } from './GameObject.js';
import { BOSS_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class Boss extends GameObject {
    constructor(x, y) {
        super(x, y, BOSS_CONFIG.width, BOSS_CONFIG.height);
        
        this.health = BOSS_CONFIG.health;
        this.maxHealth = BOSS_CONFIG.health;
        this.speed = BOSS_CONFIG.speed;
        this.score = BOSS_CONFIG.score;
        this.color = BOSS_CONFIG.color;
        this.shootInterval = BOSS_CONFIG.shootInterval;
        this.lastShootTime = 0;
        
        // 阶段相关
        this.phase = 1;
        this.phaseThresholds = BOSS_CONFIG.phaseThresholds;
        
        // 移动模式
        this.moveTimer = 0;
        this.moveDirection = 1;
        this.originalX = x;
        
        // 入场动画
        this.entering = true;
        this.targetY = 80;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.moveTimer += deltaTime;

        // 入场动画
        if (this.entering) {
            if (this.y < this.targetY) {
                this.y += this.speed * 0.5;
            } else {
                this.entering = false;
            }
            return;
        }

        // 根据阶段更新行为
        this.updatePhase();

        // 移动模式
        switch (this.phase) {
            case 1:
                // 阶段1: 左右移动
                this.x += this.speed * this.moveDirection;
                if (this.x <= 0 || this.x >= CANVAS_WIDTH - this.width) {
                    this.moveDirection *= -1;
                }
                break;
                
            case 2:
                // 阶段2: 加速移动
                this.x += this.speed * 1.5 * this.moveDirection;
                if (this.x <= 0 || this.x >= CANVAS_WIDTH - this.width) {
                    this.moveDirection *= -1;
                }
                break;
                
            case 3:
                // 阶段3: 随机传送
                if (this.moveTimer % 3000 < deltaTime) {
                    this.x = Math.random() * (CANVAS_WIDTH - this.width);
                }
                break;
        }
    }

    render(ctx) {
        if (!this.active) return;

        // 绘制Boss(大矩形)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制细节
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 绘制眼睛效果
        const eyeY = this.y + 30;
        const leftEyeX = this.x + 30;
        const rightEyeX = this.x + this.width - 30;
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 8, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();

        // 绘制Boss血条(大血条在顶部)
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = CANVAS_WIDTH - 40;
        const barHeight = 20;
        const barX = 20;
        const barY = 10;
        const healthPercent = this.health / this.maxHealth;
        
        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量(根据阶段改变颜色)
        let barColor = '#0f0';
        if (healthPercent <= this.phaseThresholds[1]) {
            barColor = '#f00';
        } else if (healthPercent <= this.phaseThresholds[0]) {
            barColor = '#ff0';
        }
        
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`BOSS - ${this.health}/${this.maxHealth}`, CANVAS_WIDTH / 2, barY + barHeight / 2);
    }

    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent <= this.phaseThresholds[1] && this.phase < 3) {
            this.phase = 3;
            console.log('Boss进入阶段3!');
        } else if (healthPercent <= this.phaseThresholds[0] && this.phase < 2) {
            this.phase = 2;
            console.log('Boss进入阶段2!');
        }
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    canShoot(currentTime) {
        return currentTime - this.lastShootTime >= this.shootInterval;
    }

    shoot(currentTime) {
        this.lastShootTime = currentTime;
        const bullets = [];
        
        // 根据阶段决定弹幕模式
        switch (this.phase) {
            case 1:
                // 阶段1: 扇形3发
                for (let i = -1; i <= 1; i++) {
                    bullets.push({
                        x: this.x + this.width / 2 - 2,
                        y: this.y + this.height,
                        angle: i * 20
                    });
                }
                break;
                
            case 2:
                // 阶段2: 5发扇形
                for (let i = -2; i <= 2; i++) {
                    bullets.push({
                        x: this.x + this.width / 2 - 2,
                        y: this.y + this.height,
                        angle: i * 15
                    });
                }
                break;
                
            case 3:
                // 阶段3: 散弹(8方向)
                for (let i = 0; i < 8; i++) {
                    bullets.push({
                        x: this.x + this.width / 2 - 2,
                        y: this.y + this.height,
                        angle: i * 45
                    });
                }
                break;
        }
        
        return bullets;
    }
}
