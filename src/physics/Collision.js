import { CONSTANTS } from '../utils/Constants.js';

export class Collision {
    static checkAABB(box1, box2) {
        return box1.intersects(box2);
    }

    static getCollisionDirection(movingBox, staticBox) {
        const overlapLeft = movingBox.right - staticBox.left;
        const overlapRight = staticBox.right - movingBox.left;
        const overlapTop = movingBox.bottom - staticBox.top;
        const overlapBottom = staticBox.bottom - movingBox.top;

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
            return overlapLeft < overlapRight ? CONSTANTS.COLLISION_DIRS.LEFT : CONSTANTS.COLLISION_DIRS.RIGHT;
        } else {
            return overlapTop < overlapBottom ? CONSTANTS.COLLISION_DIRS.TOP : CONSTANTS.COLLISION_DIRS.BOTTOM;
        }
    }

    static resolveCollision(entity, staticBox, direction) {
        switch (direction) {
            case CONSTANTS.COLLISION_DIRS.TOP:
                entity.y = staticBox.top - entity.height;
                entity.velocityY = Math.max(0, entity.velocityY);
                entity.onGround = true;
                break;
            case CONSTANTS.COLLISION_DIRS.BOTTOM:
                entity.y = staticBox.bottom;
                entity.velocityY = Math.min(0, entity.velocityY);
                break;
            case CONSTANTS.COLLISION_DIRS.LEFT:
                entity.x = staticBox.left - entity.width;
                entity.velocityX = Math.max(0, entity.velocityX);
                break;
            case CONSTANTS.COLLISION_DIRS.RIGHT:
                entity.x = staticBox.right;
                entity.velocityX = Math.min(0, entity.velocityX);
                break;
        }
    }

    static separateBoxes(box1, box2) {
        const overlapLeft = box1.right - box2.left;
        const overlapRight = box2.right - box1.left;
        const overlapTop = box1.bottom - box2.top;
        const overlapBottom = box2.bottom - box1.top;

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
            if (overlapLeft < overlapRight) {
                return { x: -overlapLeft, y: 0, direction: CONSTANTS.COLLISION_DIRS.LEFT };
            } else {
                return { x: overlapRight, y: 0, direction: CONSTANTS.COLLISION_DIRS.RIGHT };
            }
        } else {
            if (overlapTop < overlapBottom) {
                return { x: 0, y: -overlapTop, direction: CONSTANTS.COLLISION_DIRS.TOP };
            } else {
                return { x: 0, y: overlapBottom, direction: CONSTANTS.COLLISION_DIRS.BOTTOM };
            }
        }
    }
}

export default Collision;
