import { Constants } from '../utils/Constants.js';
import { PlayerTank } from '../entities/PlayerTank.js';

// 碰撞检测器
export class CollisionDetector {
    // AABB碰撞检测
    static AABBIntersects(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // 检测子弹碰撞
    static checkBulletCollisions(bullets, playerTank, enemyTanks, map, base) {
        const results = {
            destroyedBullets: [],
            destroyedEnemies: [],
            playerHit: false,
            baseHit: false,
            explosions: []
        };
        
        for (const bullet of bullets) {
            if (!bullet.isActive) continue;
            
            const bulletBounds = bullet.getBounds();
            
            // 检测子弹与地图碰撞
            const tiles = map.getTilesInArea(
                bullet.x, bullet.y, 
                bullet.size, bullet.size
            );
            
            for (const tile of tiles) {
                if (this.AABBIntersects(bulletBounds, tile.getBounds())) {
                    bullet.onHit();
                    results.destroyedBullets.push(bullet);
                    
                    // 尝试销毁可破坏的瓦片
                    if (tile.isDestructible) {
                        map.destroyTile(tile.gridX, tile.gridY);
                    }
                    
                    // 添加爆炸效果
                    results.explosions.push({
                        x: bullet.x + bullet.size / 2,
                        y: bullet.y + bullet.size / 2,
                        time: Date.now()
                    });
                    break;
                }
            }
            
            if (!bullet.isActive) continue;
            
            // 玩家子弹检测敌人
            if (bullet.owner instanceof PlayerTank) {
                for (const enemy of enemyTanks) {
                    if (!enemy.isAlive) continue;
                    
                    if (this.AABBIntersects(bulletBounds, enemy.getBounds())) {
                        bullet.onHit();
                        results.destroyedBullets.push(bullet);
                        enemy.takeDamage(bullet.damage);
                        
                        if (!enemy.isAlive) {
                            results.destroyedEnemies.push(enemy);
                        }
                        
                        results.explosions.push({
                            x: enemy.x + enemy.size / 2,
                            y: enemy.y + enemy.size / 2,
                            time: Date.now()
                        });
                        break;
                    }
                }
            } else {
                // 敌人子弹检测玩家
                if (playerTank && playerTank.isAlive) {
                    if (this.AABBIntersects(bulletBounds, playerTank.getBounds())) {
                        bullet.onHit();
                        results.destroyedBullets.push(bullet);
                        playerTank.takeDamage(bullet.damage);
                        results.playerHit = true;
                        
                        results.explosions.push({
                            x: playerTank.x + playerTank.size / 2,
                            y: playerTank.y + playerTank.size / 2,
                            time: Date.now()
                        });
                    }
                }
                
                // 敌人子弹检测基地
                if (base && !base.isDestroyed) {
                    if (this.AABBIntersects(bulletBounds, base.getBounds())) {
                        bullet.onHit();
                        results.destroyedBullets.push(bullet);
                        base.takeDamage();
                        results.baseHit = true;
                        
                        results.explosions.push({
                            x: base.x + base.size / 2,
                            y: base.y + base.size / 2,
                            time: Date.now()
                        });
                    }
                }
            }
            
            // 子弹对撞
            for (const otherBullet of bullets) {
                if (otherBullet === bullet || !otherBullet.isActive) continue;
                if (bullet.owner === otherBullet.owner) continue;
                
                if (this.AABBIntersects(bulletBounds, otherBullet.getBounds())) {
                    bullet.onHit();
                    otherBullet.onHit();
                    results.destroyedBullets.push(bullet);
                    results.destroyedBullets.push(otherBullet);
                    break;
                }
            }
        }
        
        return results;
    }
    
    // 检测坦克与坦克碰撞
    static checkTankCollisions(tank, otherTanks) {
        const tankBounds = tank.getBounds();
        
        for (const other of otherTanks) {
            if (other === tank || !other.isAlive) continue;
            
            if (this.AABBIntersects(tankBounds, other.getBounds())) {
                return true;
            }
        }
        return false;
    }
    
    // 检测坦克移动是否会碰撞
    static canTankMoveTo(tank, newX, newY, map, otherTanks, base) {
        const testBounds = {
            x: newX,
            y: newY,
            width: tank.size,
            height: tank.size
        };
        
        // 检查地图边界
        if (newX < 0 || newX + tank.size > Constants.CANVAS_WIDTH ||
            newY < 0 || newY + tank.size > Constants.CANVAS_HEIGHT) {
            return false;
        }
        
        // 检查地图碰撞
        if (!map.isAreaPassable(newX, newY, tank.size, tank.size)) {
            return false;
        }
        
        // 检查与其他坦克碰撞
        for (const other of otherTanks) {
            if (other === tank || !other.isAlive) continue;
            
            if (this.AABBIntersects(testBounds, other.getBounds())) {
                return false;
            }
        }
        
        // 检查与基地碰撞
        if (base && !base.isDestroyed) {
            if (this.AABBIntersects(testBounds, base.getBounds())) {
                return false;
            }
        }
        
        return true;
    }
}
