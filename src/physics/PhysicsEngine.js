import { CONSTANTS } from '../utils/Constants.js';
import { Collision } from './Collision.js';

export class PhysicsEngine {
    constructor(level) {
        this.level = level;
        this.gravity = CONSTANTS.GRAVITY;
    }

    update(entities, deltaTime) {
        for (const entity of entities) {
            if (!entity.active || !entity.hasPhysics) continue;

            entity.onGround = false;

            entity.velocityY += this.gravity * deltaTime;
            entity.velocityY = Math.min(entity.velocityY, CONSTANTS.MAX_FALL_SPEED);

            entity.x += entity.velocityX * deltaTime;
            this.checkHorizontalCollisions(entity);

            entity.y += entity.velocityY * deltaTime;
            this.checkVerticalCollisions(entity);
        }
    }

    checkHorizontalCollisions(entity) {
        if (!this.level) return;

        const bounds = entity.getBounds();
        const tiles = this.level.getTilesAround(bounds);

        for (const tile of tiles) {
            if (tile.solid && Collision.checkAABB(bounds, tile.bounds)) {
                const separation = Collision.separateBoxes(bounds, tile.bounds);
                entity.x += separation.x;
                
                if (separation.direction === CONSTANTS.COLLISION_DIRS.LEFT || 
                    separation.direction === CONSTANTS.COLLISION_DIRS.RIGHT) {
                    entity.velocityX = 0;
                }

                if (entity.onHitWall) {
                    entity.onHitWall(separation.direction);
                }
            }
        }
    }

    checkVerticalCollisions(entity) {
        if (!this.level) return;

        const bounds = entity.getBounds();
        const tiles = this.level.getTilesAround(bounds);

        for (const tile of tiles) {
            if (tile.solid && Collision.checkAABB(bounds, tile.bounds)) {
                const separation = Collision.separateBoxes(bounds, tile.bounds);
                entity.y += separation.y;

                if (separation.direction === CONSTANTS.COLLISION_DIRS.TOP) {
                    entity.velocityY = Math.max(0, entity.velocityY);
                    entity.onGround = true;
                } else if (separation.direction === CONSTANTS.COLLISION_DIRS.BOTTOM) {
                    entity.velocityY = Math.min(0, entity.velocityY);
                    if (entity.onHitCeiling) {
                        entity.onHitCeiling(tile);
                    }
                }
            }
        }
    }

    checkEntityCollisions(entities) {
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                if (!entityA.active || !entityB.active) continue;
                if (!entityA.hasCollision || !entityB.hasCollision) continue;

                const boundsA = entityA.getBounds();
                const boundsB = entityB.getBounds();

                if (Collision.checkAABB(boundsA, boundsB)) {
                    const direction = Collision.getCollisionDirection(boundsA, boundsB);
                    
                    if (entityA.onCollision) {
                        entityA.onCollision(entityB, direction);
                    }
                    if (entityB.onCollision) {
                        const oppositeDir = this.getOppositeDirection(direction);
                        entityB.onCollision(entityA, oppositeDir);
                    }
                }
            }
        }
    }

    getOppositeDirection(direction) {
        switch (direction) {
            case CONSTANTS.COLLISION_DIRS.TOP: return CONSTANTS.COLLISION_DIRS.BOTTOM;
            case CONSTANTS.COLLISION_DIRS.BOTTOM: return CONSTANTS.COLLISION_DIRS.TOP;
            case CONSTANTS.COLLISION_DIRS.LEFT: return CONSTANTS.COLLISION_DIRS.RIGHT;
            case CONSTANTS.COLLISION_DIRS.RIGHT: return CONSTANTS.COLLISION_DIRS.LEFT;
            default: return CONSTANTS.COLLISION_DIRS.NONE;
        }
    }
}

export default PhysicsEngine;
