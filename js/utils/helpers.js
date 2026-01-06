// 辅助函数

// 像素坐标转换为网格坐标
function pixelToGrid(pixel) {
    return Math.floor(pixel / CONFIG.TILE_SIZE);
}

// 网格坐标转换为像素坐标
function gridToPixel(grid) {
    return grid * CONFIG.TILE_SIZE;
}

// 检查坐标是否在网格范围内
function isInGrid(gridX, gridY) {
    return gridX >= 0 && gridX < CONFIG.GRID_WIDTH && 
           gridY >= 0 && gridY < CONFIG.GRID_HEIGHT;
}

// 随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机从数组中选择元素
function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

// AABB碰撞检测
function checkAABBCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 获取矩形中心点
function getRectCenter(rect) {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    };
}
