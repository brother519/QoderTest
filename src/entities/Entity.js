// 游戏实体基类
class Entity {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.active = true;
    }
    
    /**
     * 更新实体状态
     */
    update(deltaTime) {
        // 子类实现
    }
    
    /**
     * 渲染实体
     */
    render(renderer) {
        // 子类实现
    }
    
    /**
     * 获取边界盒
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
    
    /**
     * 销毁实体
     */
    destroy() {
        this.active = false;
    }
}
