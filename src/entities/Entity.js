import { AABB } from '../physics/AABB.js';

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.active = true;
        this.hasPhysics = true;
        this.hasCollision = true;
        this.onGround = false;
    }

    getBounds() {
        return new AABB(this.x, this.y, this.width, this.height);
    }

    update(deltaTime) {
    }

    render(ctx, camera) {
    }

    onCollision(other, direction) {
    }

    destroy() {
        this.active = false;
    }
}

export default Entity;
