import { Constants, DirectionVectors } from '../utils/Constants.js';

// 坦克基类
export class Tank {
    constructor(x, y, direction = Constants.DIRECTION.UP) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = Constants.TANK_SIZE;
        this.speed = Constants.PLAYER_SPEED;
        this.health = 1;
        this.isAlive = true;
        this.fireRate = Constants.PLAYER_FIRE_RATE;
        this.lastFireTime = 0;
        this.bulletSpeed = Constants.BULLET_SPEED;
    }
    
    update(deltaTime) {
        // 子类实现
    }
    
    move(direction, deltaTime, map) {
        this.direction = direction;
        const vector = DirectionVectors[direction];
        const moveDistance = this.speed * deltaTime;
        
        const newX = this.x + vector.x * moveDistance;
        const newY = this.y + vector.y * moveDistance;
        
        // 检查地图边界
        const clampedX = Math.max(0, Math.min(newX, Constants.CANVAS_WIDTH - this.size));
        const clampedY = Math.max(0, Math.min(newY, Constants.CANVAS_HEIGHT - this.size));
        
        // 检查地图碰撞
        if (map && !map.isAreaPassable(clampedX, clampedY, this.size, this.size)) {
            // 尝试滑动移动
            if (vector.x !== 0) {
                // 水平移动时尝试垂直方向滑动
                if (map.isAreaPassable(clampedX, this.y, this.size, this.size)) {
                    this.x = clampedX;
                }
            }
            if (vector.y !== 0) {
                // 垂直移动时尝试水平方向滑动
                if (map.isAreaPassable(this.x, clampedY, this.size, this.size)) {
                    this.y = clampedY;
                }
            }
            return;
        }
        
        this.x = clampedX;
        this.y = clampedY;
    }
    
    canFire(currentTime) {
        return currentTime - this.lastFireTime >= this.fireRate * 1000;
    }
    
    fire(currentTime) {
        if (!this.canFire(currentTime)) {
            return null;
        }
        
        this.lastFireTime = currentTime;
        
        // 计算子弹起始位置（从坦克前方发射）
        const vector = DirectionVectors[this.direction];
        const bulletX = this.x + this.size / 2 - Constants.BULLET_SIZE / 2 + vector.x * (this.size / 2);
        const bulletY = this.y + this.size / 2 - Constants.BULLET_SIZE / 2 + vector.y * (this.size / 2);
        
        return {
            x: bulletX,
            y: bulletY,
            direction: this.direction,
            speed: this.bulletSpeed,
            owner: this
        };
    }
    
    takeDamage(amount = 1) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        this.isAlive = false;
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
    
    render(ctx, color, darkColor) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // 移动到坦克中心
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        ctx.translate(centerX, centerY);
        
        // 根据方向旋转
        const rotations = {
            [Constants.DIRECTION.UP]: 0,
            [Constants.DIRECTION.RIGHT]: Math.PI / 2,
            [Constants.DIRECTION.DOWN]: Math.PI,
            [Constants.DIRECTION.LEFT]: -Math.PI / 2
        };
        ctx.rotate(rotations[this.direction]);
        
        // 绘制坦克主体
        const halfSize = this.size / 2;
        
        // 履带
        ctx.fillStyle = darkColor;
        ctx.fillRect(-halfSize, -halfSize, 8, this.size);
        ctx.fillRect(halfSize - 8, -halfSize, 8, this.size);
        
        // 车身
        ctx.fillStyle = color;
        ctx.fillRect(-halfSize + 6, -halfSize + 4, this.size - 12, this.size - 8);
        
        // 炮塔
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 炮管
        ctx.fillStyle = color;
        ctx.fillRect(-3, -halfSize, 6, halfSize - 2);
        
        ctx.restore();
    }
}
