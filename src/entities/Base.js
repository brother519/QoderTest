import { CONFIG } from '../config.js';

/**
 * 基地实体
 */
export class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.TILE_SIZE * 2;
        this.height = CONFIG.TILE_SIZE * 2;
        this.isDestroyed = false;
        this.hasShield = false;
        this.shieldTime = 0;
    }
    
    /**
     * 摧毁基地
     */
    destroy() {
        this.isDestroyed = true;
    }
    
    /**
     * 激活护盾
     */
    activateShield(duration) {
        this.hasShield = true;
        this.shieldTime = duration;
    }
    
    /**
     * 更新基地
     */
    update() {
        if (this.hasShield && this.shieldTime > 0) {
            this.shieldTime--;
            if (this.shieldTime <= 0) {
                this.hasShield = false;
            }
        }
    }
    
    /**
     * 渲染基地
     */
    render(renderer) {
        renderer.drawBase(this.x, this.y, CONFIG.TILE_SIZE, this.isDestroyed);
        
        if (this.hasShield && !this.isDestroyed) {
            renderer.drawShield(this.x, this.y, this.width, this.shieldTime);
        }
    }
}
