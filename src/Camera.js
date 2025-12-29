import { CONSTANTS } from './utils/Constants.js';

export class Camera {
    constructor(width, height, levelWidth, levelHeight) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        this.target = null;
    }

    setTarget(entity) {
        this.target = entity;
    }

    update() {
        if (!this.target) return;

        const targetX = this.target.x + this.target.width / 2 - CONSTANTS.CAMERA.OFFSET_X;
        this.x += (targetX - this.x) * CONSTANTS.CAMERA.FOLLOW_SPEED;

        this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.levelHeight - this.height));
    }

    apply(context) {
        context.translate(-this.x, -this.y);
    }

    reset(context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
    }

    worldToScreen(x, y) {
        return { x: x - this.x, y: y - this.y };
    }

    screenToWorld(x, y) {
        return { x: x + this.x, y: y + this.y };
    }

    isVisible(bounds) {
        return (
            bounds.right > this.x &&
            bounds.left < this.x + this.width &&
            bounds.bottom > this.y &&
            bounds.top < this.y + this.height
        );
    }
}

export default Camera;
