import { Constants, DirectionVectors } from '../utils/Constants.js';

// 子弹类
export class Bullet {
    constructor(x, y, direction, speed, owner) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.owner = owner;
        this.size = Constants.BULLET_SIZE;
        this.isActive = true;
        this.damage = 1;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const vector = DirectionVectors[this.direction];
        this.x += vector.x * this.speed * deltaTime;
        this.y += vector.y * this.speed * deltaTime;
        
        // 检查是否超出边界
        if (this.x < 0 || this.x > Constants.CANVAS_WIDTH ||
            this.y < 0 || this.y > Constants.CANVAS_HEIGHT) {
            this.destroy();
        }
    }
    
    onHit() {
        this.destroy();
    }
    
    destroy() {
        this.isActive = false;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
    
    getCenter() {
        return {
            x: this.x + this.size / 2,
            y: this.y + this.size / 2
        };
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = Constants.COLORS.BULLET;
        
        // 根据方向绘制子弹
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        
        const rotations = {
            [Constants.DIRECTION.UP]: 0,
            [Constants.DIRECTION.RIGHT]: Math.PI / 2,
            [Constants.DIRECTION.DOWN]: Math.PI,
            [Constants.DIRECTION.LEFT]: -Math.PI / 2
        };
        ctx.rotate(rotations[this.direction]);
        
        // 绘制子弹形状
        ctx.fillRect(-2, -4, 4, 8);
        
        ctx.restore();
    }
}
