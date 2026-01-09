// 子弹类
class Bullet extends Entity {
    constructor(x, y, direction, owner) {
        super(x, y, Constants.BULLET_SIZE);
        this.direction = direction;
        this.speed = Constants.BULLET_SPEED;
        this.owner = owner;
    }
    
    /**
     * 更新子弹位置
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 根据方向移动
        const vector = Helpers.getDirectionVector(this.direction);
        this.x += vector.x * this.speed;
        this.y += vector.y * this.speed;
        
        // 检查是否超出边界
        if (this.x < 0 || this.x > Constants.CANVAS_WIDTH ||
            this.y < 0 || this.y > Constants.CANVAS_HEIGHT) {
            this.destroy();
        }
    }
    
    /**
     * 渲染子弹
     */
    render(renderer) {
        if (this.active) {
            renderer.drawBullet(this);
        }
    }
}
