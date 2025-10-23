/**
 * 物理引擎
 * 处理碰撞检测
 */
export class PhysicsEngine {
    constructor() {
    }
    
    /**
     * AABB碰撞检测
     */
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    /**
     * 点与矩形碰撞检测
     */
    checkPointCollision(px, py, obj) {
        return px >= obj.x &&
               px <= obj.x + obj.width &&
               py >= obj.y &&
               py <= obj.y + obj.height;
    }
    
    /**
     * 矩形与矩形碰撞检测
     */
    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }
    
    /**
     * 获取碰撞深度（用于碰撞响应）
     */
    getCollisionDepth(obj1, obj2) {
        const overlapX = Math.min(
            obj1.x + obj1.width - obj2.x,
            obj2.x + obj2.width - obj1.x
        );
        
        const overlapY = Math.min(
            obj1.y + obj1.height - obj2.y,
            obj2.y + obj2.height - obj1.y
        );
        
        return { x: overlapX, y: overlapY };
    }
}
