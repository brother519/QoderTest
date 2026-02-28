import { TILE_TYPE, GAME_CONFIG } from '../utils/Constants.js';

export class CollisionDetector {
    // 检查两个对象是否重叠 (AABB碰撞检测)
    checkOverlap(obj1, obj2) {
        return obj1.x < obj2.x + obj2.size &&
               obj1.x + obj1.size > obj2.x &&
               obj1.y < obj2.y + obj2.size &&
               obj1.y + obj1.size > obj2.y;
    }

    // 检查点是否在对象内
    checkPointInObject(x, y, obj) {
        return x >= obj.x && x < obj.x + obj.size &&
               y >= obj.y && y < obj.y + obj.size;
    }

    // 处理坦克与地图碰撞
    handleTankMapCollision(tank, map) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        // 获取坦克四个角的格子坐标
        const leftTile = Math.floor(tank.x / tileSize);
        const rightTile = Math.floor((tank.x + tank.size - 1) / tileSize);
        const topTile = Math.floor(tank.y / tileSize);
        const bottomTile = Math.floor((tank.y + tank.size - 1) / tileSize);
        
        // 检查每个相关格子
        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                const tile = map.getTile(x, y);
                
                // 检查是否为阻挡物
                if (this.isTileBlocking(tile, tank)) {
                    // 计算重叠量并推开
                    this.resolveTileCollision(tank, x, y, tileSize);
                }
            }
        }
        
        // 边界检测
        this.keepInBounds(tank);
    }

    // 判断地形是否阻挡坦克
    isTileBlocking(tile, tank) {
        switch (tile) {
            case TILE_TYPE.BRICK:
            case TILE_TYPE.STEEL:
            case TILE_TYPE.RIVER:
            case TILE_TYPE.BASE:
                return true;
            default:
                return false;
        }
    }

    // 解决地形碰撞
    resolveTileCollision(tank, tileX, tileY, tileSize) {
        const tileLeft = tileX * tileSize;
        const tileRight = tileLeft + tileSize;
        const tileTop = tileY * tileSize;
        const tileBottom = tileTop + tileSize;
        
        const tankRight = tank.x + tank.size;
        const tankBottom = tank.y + tank.size;
        
        // 计算四个方向的重叠量
        const overlapLeft = tankRight - tileLeft;
        const overlapRight = tileRight - tank.x;
        const overlapTop = tankBottom - tileTop;
        const overlapBottom = tileBottom - tank.y;
        
        // 找到最小重叠量
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // 根据最小重叠量推开
        if (minOverlap === overlapLeft && tank.lastDirection === 1) {
            tank.x = tileLeft - tank.size;
        } else if (minOverlap === overlapRight && tank.lastDirection === 3) {
            tank.x = tileRight;
        } else if (minOverlap === overlapTop && tank.lastDirection === 2) {
            tank.y = tileTop - tank.size;
        } else if (minOverlap === overlapBottom && tank.lastDirection === 0) {
            tank.y = tileBottom;
        } else {
            // 默认推开
            if (minOverlap === overlapLeft) tank.x = tileLeft - tank.size;
            else if (minOverlap === overlapRight) tank.x = tileRight;
            else if (minOverlap === overlapTop) tank.y = tileTop - tank.size;
            else tank.y = tileBottom;
        }
    }

    // 保持在边界内
    keepInBounds(tank) {
        if (tank.x < 0) tank.x = 0;
        if (tank.y < 0) tank.y = 0;
        if (tank.x + tank.size > GAME_CONFIG.CANVAS_WIDTH) {
            tank.x = GAME_CONFIG.CANVAS_WIDTH - tank.size;
        }
        if (tank.y + tank.size > GAME_CONFIG.CANVAS_HEIGHT) {
            tank.y = GAME_CONFIG.CANVAS_HEIGHT - tank.size;
        }
    }

    // 检查子弹与地图碰撞
    checkBulletMapCollision(bullet, map) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        // 获取子弹中心点的格子坐标
        const centerX = bullet.x + bullet.size / 2;
        const centerY = bullet.y + bullet.size / 2;
        const tileX = Math.floor(centerX / tileSize);
        const tileY = Math.floor(centerY / tileSize);
        
        const tile = map.getTile(tileX, tileY);
        
        if (tile === TILE_TYPE.BRICK) {
            // 破坏砖墙
            map.destroyTile(tileX, tileY);
            return true;
        } else if (tile === TILE_TYPE.STEEL) {
            // 钢墙不可破坏(除非增强子弹)
            if (bullet.enhanced) {
                map.destroyTile(tileX, tileY);
            }
            return true;
        }
        
        return false;
    }

    // 处理坦克与坦克碰撞
    handleTankTankCollision(tank1, tank2) {
        if (!this.checkOverlap(tank1, tank2)) return;
        
        // 计算重叠中心
        const center1X = tank1.x + tank1.size / 2;
        const center1Y = tank1.y + tank1.size / 2;
        const center2X = tank2.x + tank2.size / 2;
        const center2Y = tank2.y + tank2.size / 2;
        
        const dx = center1X - center2X;
        const dy = center1Y - center2Y;
        
        // 计算重叠量
        const overlapX = (tank1.size + tank2.size) / 2 - Math.abs(dx);
        const overlapY = (tank1.size + tank2.size) / 2 - Math.abs(dy);
        
        // 根据重叠量推开
        if (overlapX < overlapY) {
            if (dx > 0) {
                tank1.x += overlapX / 2;
                tank2.x -= overlapX / 2;
            } else {
                tank1.x -= overlapX / 2;
                tank2.x += overlapX / 2;
            }
        } else {
            if (dy > 0) {
                tank1.y += overlapY / 2;
                tank2.y -= overlapY / 2;
            } else {
                tank1.y -= overlapY / 2;
                tank2.y += overlapY / 2;
            }
        }
    }

    // 检查坦克在某方向上是否会碰撞
    willCollide(tank, direction, map) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        const speed = tank.speed;
        
        // 模拟移动后的位置
        let newX = tank.x;
        let newY = tank.y;
        
        switch (direction) {
            case 0: newY -= speed; break; // UP
            case 1: newX += speed; break; // RIGHT
            case 2: newY += speed; break; // DOWN
            case 3: newX -= speed; break; // LEFT
        }
        
        // 边界检测
        if (newX < 0 || newY < 0 ||
            newX + tank.size > GAME_CONFIG.CANVAS_WIDTH ||
            newY + tank.size > GAME_CONFIG.CANVAS_HEIGHT) {
            return true;
        }
        
        // 地形检测
        const leftTile = Math.floor(newX / tileSize);
        const rightTile = Math.floor((newX + tank.size - 1) / tileSize);
        const topTile = Math.floor(newY / tileSize);
        const bottomTile = Math.floor((newY + tank.size - 1) / tileSize);
        
        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                const tile = map.getTile(x, y);
                if (this.isTileBlocking(tile, tank)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
