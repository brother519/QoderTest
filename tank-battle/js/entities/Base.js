import { GAME_CONFIG } from '../utils/Constants.js';

// 基地类
export class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.TILE_SIZE * 2; // 基地占2x2格子
        this.destroyed = false;
        this.protected = false; // 是否有保护(铁墙)
        this.protectionTimer = 0;
    }

    // 更新
    update(deltaTime) {
        if (this.protectionTimer > 0) {
            this.protectionTimer -= deltaTime;
            if (this.protectionTimer <= 0) {
                this.protected = false;
            }
        }
    }

    // 添加保护
    addProtection(duration) {
        this.protected = true;
        this.protectionTimer = duration;
    }
}
