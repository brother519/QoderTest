// 游戏对象基类

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.speed = 0;
    }

    // 更新对象状态(子类实现)
    update(deltaTime) {
        // 由子类重写
    }

    // 渲染对象(子类实现)
    render(ctx) {
        // 由子类重写
    }

    // 获取碰撞盒
    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // 获取中心点
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // 检查是否在屏幕内
    isOnScreen() {
        return this.x + this.width >= 0 &&
               this.x <= CANVAS_WIDTH &&
               this.y + this.height >= 0 &&
               this.y <= CANVAS_HEIGHT;
    }

    // 检查是否超出屏幕
    isOffScreen() {
        return !this.isOnScreen();
    }

    // 销毁对象
    destroy() {
        this.active = false;
    }
}
