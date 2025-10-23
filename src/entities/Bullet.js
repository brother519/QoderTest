import { CONFIG } from '../config.js';

/**
 * 子弹实体
 */
export class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.BULLET.SIZE;
        this.height = CONFIG.BULLET.SIZE;
        this.direction = direction;
        this.speed = CONFIG.BULLET.SPEED;
        this.owner = owner;
        this.isActive = true;
        this.power = 1;
    }
    
    /**
     * 更新子弹位置
     */
    update() {
        if (!this.isActive) return;
        
        switch (this.direction) {
            case CONFIG.DIRECTION.UP:
                this.y -= this.speed;
                break;
            case CONFIG.DIRECTION.DOWN:
                this.y += this.speed;
                break;
            case CONFIG.DIRECTION.LEFT:
                this.x -= this.speed;
                break;
            case CONFIG.DIRECTION.RIGHT:
                this.x += this.speed;
                break;
        }
    }
    
    /**
     * 渲染子弹
     */
    render(renderer) {
        if (!this.isActive) return;
        renderer.drawBullet(this.x, this.y, this.direction, this.width);
    }
    
    /**
     * 销毁子弹
     */
    destroy() {
        if (this.isActive) {
            this.isActive = false;
            // 通知所有者减少活跃子弹数
            if (this.owner && this.owner.decreaseBulletCount) {
                this.owner.decreaseBulletCount();
            }
        }
    }
}
