import { checkAABB } from '../utils/helpers.js';

export class CollisionSystem {
    constructor() {
    }

    checkBulletVsTank(bullet, tank) {
        if (bullet.owner === tank) return false;
        
        if (checkAABB(bullet.getBounds(), tank.getBounds())) {
            tank.takeDamage(bullet.damage);
            bullet.destroy();
            return true;
        }
        return false;
    }

    checkBulletVsObstacle(bullet, obstacle) {
        if (!obstacle.blocksBullet) return false;
        
        if (checkAABB(bullet.getBounds(), obstacle.getBounds())) {
            bullet.destroy();
            if (obstacle.destructible) {
                obstacle.takeDamage(1);
            }
            return true;
        }
        return false;
    }

    checkTankVsObstacle(tank, tankOldX, tankOldY, obstacle) {
        if (!obstacle.blocksTank) return false;
        
        if (checkAABB(tank.getBounds(), obstacle.getBounds())) {
            tank.x = tankOldX;
            tank.y = tankOldY;
            return true;
        }
        return false;
    }

    checkTankVsTank(tank1, tank2) {
        if (checkAABB(tank1.getBounds(), tank2.getBounds())) {
            return true;
        }
        return false;
    }

    checkBulletVsBase(bullet, base) {
        if (checkAABB(bullet.getBounds(), base.getBounds())) {
            base.takeDamage(bullet.damage);
            bullet.destroy();
            return true;
        }
        return false;
    }
}