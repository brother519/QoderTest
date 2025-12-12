import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_BRICK, TILE_STEEL, TILE_WATER } from './constants.js';

export class CollisionSystem {
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkTankMapCollision(tankBounds, map) {
        if (tankBounds.x < 0 || tankBounds.x + tankBounds.width > CANVAS_WIDTH ||
            tankBounds.y < 0 || tankBounds.y + tankBounds.height > CANVAS_HEIGHT) {
            return true;
        }

        const left = Math.floor(tankBounds.x / TILE_SIZE);
        const right = Math.floor((tankBounds.x + tankBounds.width - 1) / TILE_SIZE);
        const top = Math.floor(tankBounds.y / TILE_SIZE);
        const bottom = Math.floor((tankBounds.y + tankBounds.height - 1) / TILE_SIZE);

        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                const tile = map.getTile(col, row);
                if (tile && !tile.isPassable) {
                    return true;
                }
            }
        }

        if (map.base && !map.base.isDestroyed) {
            if (this.checkRectCollision(tankBounds, map.base.getBounds())) {
                return true;
            }
        }

        return false;
    }

    checkTankTankCollision(tankBounds, tanks) {
        for (const other of tanks) {
            if (!other || !other.isAlive) continue;
            if (this.checkRectCollision(tankBounds, other.getBounds())) {
                return true;
            }
        }
        return false;
    }

    checkBulletMapCollision(bullet, map) {
        const bulletBounds = bullet.getBounds();
        const col = Math.floor((bulletBounds.x + bulletBounds.width / 2) / TILE_SIZE);
        const row = Math.floor((bulletBounds.y + bulletBounds.height / 2) / TILE_SIZE);

        const tile = map.getTile(col, row);
        if (tile) {
            if (tile.type === TILE_BRICK) {
                return { type: 'brick', col, row };
            } else if (tile.type === TILE_STEEL) {
                return { type: 'steel', col, row };
            }
        }
        return null;
    }

    checkBulletTankCollision(bullet, tank) {
        return this.checkRectCollision(bullet.getBounds(), tank.getBounds());
    }

    checkBulletBulletCollision(bullet1, bullet2) {
        return this.checkRectCollision(bullet1.getBounds(), bullet2.getBounds());
    }

    checkBulletBaseCollision(bullet, base) {
        if (!base || base.isDestroyed) return false;
        return this.checkRectCollision(bullet.getBounds(), base.getBounds());
    }
}
