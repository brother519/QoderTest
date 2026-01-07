// 碰撞检测工具函数

// AABB矩形碰撞检测
export function checkCollision(obj1, obj2) {
    const box1 = obj1.getCollisionBox ? obj1.getCollisionBox() : obj1;
    const box2 = obj2.getCollisionBox ? obj2.getCollisionBox() : obj2;

    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
}

// 圆形碰撞检测(可选,更精确)
export function checkCircleCollision(obj1, obj2) {
    const center1 = obj1.getCenter();
    const center2 = obj2.getCenter();
    
    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const radius1 = Math.min(obj1.width, obj1.height) / 2;
    const radius2 = Math.min(obj2.width, obj2.height) / 2;
    
    return distance < radius1 + radius2;
}

// 点与矩形碰撞检测
export function pointInRect(point, rect) {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
}

// 计算两点间距离
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// 计算角度(弧度)
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
