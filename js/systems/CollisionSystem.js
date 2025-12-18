import { rectIntersect } from '../utils.js';

export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }
    
    update() {
        this.checkBulletCollisions();
        this.checkPowerUpCollisions();
    }
    
    checkBulletCollisions() {
        const { bullets, enemies, player, map } = this.game;
        
        for (const bullet of bullets) {
            if (!bullet.isActive) continue;
            
            if (map.handleBulletCollision(bullet, bullet.canDestroySteel)) {
                bullet.destroy();
                continue;
            }
            
            if (bullet.owner !== player && player && player.isAlive) {
                if (this.checkBulletEntityCollision(bullet, player)) {
                    bullet.destroy();
                    player.takeDamage(bullet.damage);
                    continue;
                }
            }
            
            if (bullet.owner === player || bullet.owner?.type === 'player') {
                for (const enemy of enemies) {
                    if (!enemy.isAlive) continue;
                    
                    if (this.checkBulletEntityCollision(bullet, enemy)) {
                        bullet.destroy();
                        enemy.takeDamage(bullet.damage);
                        break;
                    }
                }
            }
            
            for (const otherBullet of bullets) {
                if (bullet === otherBullet || !otherBullet.isActive) continue;
                
                if (bullet.owner !== otherBullet.owner) {
                    if (rectIntersect(bullet.getBounds(), otherBullet.getBounds())) {
                        bullet.destroy();
                        otherBullet.destroy();
                        break;
                    }
                }
            }
        }
    }
    
    checkBulletEntityCollision(bullet, entity) {
        return rectIntersect(bullet.getBounds(), entity.getBounds());
    }
    
    checkTankMapCollision(tank) {
        const bounds = tank.getBounds();
        return this.game.map.checkCollision(bounds) !== null;
    }
    
    checkTankTankCollision(tank) {
        const bounds = tank.getBounds();
        const { player, enemies } = this.game;
        
        if (tank !== player && player && player.isAlive) {
            if (rectIntersect(bounds, player.getBounds())) {
                return true;
            }
        }
        
        for (const enemy of enemies) {
            if (tank === enemy || !enemy.isAlive) continue;
            
            if (rectIntersect(bounds, enemy.getBounds())) {
                return true;
            }
        }
        
        return false;
    }
    
    checkPowerUpCollisions() {
        const { powerUps, player } = this.game;
        
        if (!player || !player.isAlive) return;
        
        const playerBounds = player.getBounds();
        
        for (const powerUp of powerUps) {
            if (!powerUp.isAlive) continue;
            
            if (rectIntersect(playerBounds, powerUp.getBounds())) {
                powerUp.collect(player);
            }
        }
    }
    
    checkSpawnPointClear(x, y, width, height) {
        const bounds = { x, y, width, height };
        const { player, enemies } = this.game;
        
        if (player && player.isAlive) {
            if (rectIntersect(bounds, player.getBounds())) {
                return false;
            }
        }
        
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            if (rectIntersect(bounds, enemy.getBounds())) {
                return false;
            }
        }
        
        return true;
    }
}
