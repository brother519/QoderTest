// 道具管理器

import { PowerUp } from '../entities/PowerUp.js';
import { POWERUP_TYPES } from '../config.js';

export class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
    }

    update(deltaTime) {
        // 更新所有道具
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return powerUp.active;
        });
    }

    render(ctx) {
        this.powerUps.forEach(powerUp => powerUp.render(ctx));
    }

    // 敌机死亡时尝试生成道具
    trySpawnPowerUp(x, y) {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const [type, config] of Object.entries(POWERUP_TYPES)) {
            cumulativeProbability += config.dropRate;
            if (rand < cumulativeProbability) {
                this.spawnPowerUp(x, y, type);
                return;
            }
        }
    }

    spawnPowerUp(x, y, type) {
        const powerUp = new PowerUp(x, y, type);
        this.powerUps.push(powerUp);
    }

    clear() {
        this.powerUps = [];
    }
}
