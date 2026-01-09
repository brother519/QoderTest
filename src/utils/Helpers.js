// 辅助函数集合
const Helpers = {
    /**
     * 检测两个矩形是否碰撞（AABB算法）
     */
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * 检测点是否在矩形内
     */
    pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    },
    
    /**
     * 将像素坐标转换为网格坐标
     */
    pixelToGrid(pixelX, pixelY) {
        return {
            col: Math.floor(pixelX / Constants.TILE_SIZE),
            row: Math.floor(pixelY / Constants.TILE_SIZE)
        };
    },
    
    /**
     * 将网格坐标转换为像素坐标
     */
    gridToPixel(col, row) {
        return {
            x: col * Constants.TILE_SIZE,
            y: row * Constants.TILE_SIZE
        };
    },
    
    /**
     * 对齐到网格
     */
    alignToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    },
    
    /**
     * 获取方向向量
     */
    getDirectionVector(direction) {
        return Constants.DIRECTION_VECTORS[direction];
    },
    
    /**
     * 限制值在范围内
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * 获取随机整数
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 获取随机方向
     */
    randomDirection() {
        return this.randomInt(0, 3);
    },
    
    /**
     * 获取对立方向
     */
    oppositeDirection(direction) {
        return (direction + 2) % 4;
    },
    
    /**
     * 计算两点距离
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * 检查坐标是否在边界内
     */
    inBounds(x, y, width, height) {
        return x >= 0 && 
               y >= 0 && 
               x + width <= Constants.CANVAS_WIDTH && 
               y + height <= Constants.CANVAS_HEIGHT;
    },
    
    /**
     * 深拷贝对象
     */
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};
