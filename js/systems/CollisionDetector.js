// 碰撞检测系统
class CollisionDetector {
    constructor() {}
    
    // 检测子弹与坦克的碰撞
    checkBulletTankCollisions(bullets, tanks) {
        const collisions = [];
        
        for (let bullet of bullets) {
            if (!bullet.active) continue;
            
            for (let tank of tanks) {
                if (!tank.alive) continue;
                if (bullet.owner === tank) continue;
                
                if (checkAABBCollision(bullet, tank)) {
                    collisions.push({ bullet, tank });
                }
            }
        }
        
        return collisions;
    }
    
    // 检测子弹与地图的碰撞
    checkBulletMapCollisions(bullets, map) {
        const collisions = [];
        
        for (let bullet of bullets) {
            if (!bullet.active) continue;
            
            if (bullet.checkMapCollision(map)) {
                collisions.push(bullet);
            }
        }
        
        return collisions;
    }
    
    // 检测子弹与基地的碰撞
    checkBulletBaseCollisions(bullets, base) {
        if (base.destroyed) return [];
        
        const collisions = [];
        
        for (let bullet of bullets) {
            if (!bullet.active) continue;
            
            if (base.checkBulletCollision(bullet)) {
                collisions.push(bullet);
            }
        }
        
        return collisions;
    }
    
    // 检测坦克之间的碰撞
    checkTankTankCollisions(tanks) {
        const collisions = [];
        
        for (let i = 0; i < tanks.length; i++) {
            if (!tanks[i].alive) continue;
            
            for (let j = i + 1; j < tanks.length; j++) {
                if (!tanks[j].alive) continue;
                
                if (checkAABBCollision(tanks[i], tanks[j])) {
                    collisions.push({ tank1: tanks[i], tank2: tanks[j] });
                }
            }
        }
        
        return collisions;
    }
}
