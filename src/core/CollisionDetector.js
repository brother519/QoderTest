// 碰撞检测系统
class CollisionDetector {
    constructor(map) {
        this.map = map;
    }
    
    /**
     * 检测实体与地图边界碰撞
     */
    checkBoundaryCollision(entity) {
        return entity.x < 0 ||
               entity.y < 0 ||
               entity.x + entity.size > Constants.CANVAS_WIDTH ||
               entity.y + entity.size > Constants.CANVAS_HEIGHT;
    }
    
    /**
     * 检测实体与地图块碰撞
     */
    checkMapCollision(entity) {
        if (!this.map) return false;
        
        const entityRect = {
            x: entity.x,
            y: entity.y,
            width: entity.size,
            height: entity.size
        };
        
        // 计算实体占据的网格范围
        const startCol = Math.floor(entity.x / Constants.TILE_SIZE);
        const endCol = Math.floor((entity.x + entity.size - 1) / Constants.TILE_SIZE);
        const startRow = Math.floor(entity.y / Constants.TILE_SIZE);
        const endRow = Math.floor((entity.y + entity.size - 1) / Constants.TILE_SIZE);
        
        // 检查范围内的所有地图块
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tile = this.map.getTile(col, row);
                
                if (tile && tile.isSolid) {
                    const tileRect = {
                        x: col * Constants.TILE_SIZE,
                        y: row * Constants.TILE_SIZE,
                        width: Constants.TILE_SIZE,
                        height: Constants.TILE_SIZE
                    };
                    
                    if (Helpers.checkRectCollision(entityRect, tileRect)) {
                        return { collision: true, tile, col, row };
                    }
                }
            }
        }
        
        return { collision: false };
    }
    
    /**
     * 检测两个实体之间的碰撞
     */
    checkEntityCollision(entity1, entity2) {
        const rect1 = {
            x: entity1.x,
            y: entity1.y,
            width: entity1.size,
            height: entity1.size
        };
        
        const rect2 = {
            x: entity2.x,
            y: entity2.y,
            width: entity2.size,
            height: entity2.size
        };
        
        return Helpers.checkRectCollision(rect1, rect2);
    }
    
    /**
     * 检测坦克移动是否合法
     */
    canTankMove(tank, newX, newY) {
        // 保存原位置
        const oldX = tank.x;
        const oldY = tank.y;
        
        // 临时设置新位置
        tank.x = newX;
        tank.y = newY;
        
        // 检查边界
        if (this.checkBoundaryCollision(tank)) {
            tank.x = oldX;
            tank.y = oldY;
            return false;
        }
        
        // 检查地图碰撞
        const mapCollision = this.checkMapCollision(tank);
        
        // 恢复原位置
        tank.x = oldX;
        tank.y = oldY;
        
        return !mapCollision.collision;
    }
    
    /**
     * 检测子弹与地图碰撞
     */
    checkBulletMapCollision(bullet) {
        if (!this.map) return null;
        
        const bulletRect = {
            x: bullet.x,
            y: bullet.y,
            width: bullet.size,
            height: bullet.size
        };
        
        // 计算子弹中心点所在的网格
        const centerX = bullet.x + bullet.size / 2;
        const centerY = bullet.y + bullet.size / 2;
        const col = Math.floor(centerX / Constants.TILE_SIZE);
        const row = Math.floor(centerY / Constants.TILE_SIZE);
        
        const tile = this.map.getTile(col, row);
        
        if (tile && tile.type !== Constants.TILE_TYPE.EMPTY && tile.type !== Constants.TILE_TYPE.FOREST) {
            const tileRect = {
                x: col * Constants.TILE_SIZE,
                y: row * Constants.TILE_SIZE,
                width: Constants.TILE_SIZE,
                height: Constants.TILE_SIZE
            };
            
            if (Helpers.checkRectCollision(bulletRect, tileRect)) {
                return { tile, col, row };
            }
        }
        
        return null;
    }
    
    /**
     * 检测坦克之间的碰撞
     */
    checkTankCollisions(tank, otherTanks) {
        for (let other of otherTanks) {
            if (other === tank || !other.active) continue;
            
            if (this.checkEntityCollision(tank, other)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检测子弹与坦克碰撞
     */
    checkBulletTankCollision(bullet, tanks) {
        for (let tank of tanks) {
            if (!tank.active) continue;
            
            // 子弹不能击中发射它的坦克
            if (bullet.owner === tank) continue;
            
            if (this.checkEntityCollision(bullet, tank)) {
                return tank;
            }
        }
        return null;
    }
    
    /**
     * 检测子弹与基地碰撞
     */
    checkBulletBaseCollision(bullet, base) {
        if (!base || !base.active) return false;
        return this.checkEntityCollision(bullet, base);
    }
}
