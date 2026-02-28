import { DIRECTION, DIRECTION_VECTORS } from '../utils/Constants.js';

// 子弹类
export class Bullet {
    constructor(x, y, direction, speed, damage, isPlayerBullet, enhanced = false) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.isPlayerBullet = isPlayerBullet;
        this.enhanced = enhanced; // 增强子弹可以打穿钢墙
        this.destroyed = false;
    }

    // 更新位置
    update(deltaTime) {
        const vector = DIRECTION_VECTORS[this.direction];
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
    }
}
