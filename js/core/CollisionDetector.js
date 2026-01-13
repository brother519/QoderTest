export class CollisionDetector {
    static checkAABB(entity1, entity2) {
        return entity1.x - entity1.width / 2 < entity2.x + entity2.width / 2 &&
               entity1.x + entity1.width / 2 > entity2.x - entity2.width / 2 &&
               entity1.y - entity1.height / 2 < entity2.y + entity2.height / 2 &&
               entity1.y + entity1.height / 2 > entity2.y - entity2.height / 2;
    }
    
    static checkCollisions(playerBullets, enemyBullets, enemies, player, powerUps, particles, scoreSystem) {
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            if (!bullet.active) continue;
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.active) continue;
                
                if (this.checkAABB(bullet, enemy)) {
                    bullet.active = false;
                    enemy.takeDamage(bullet.damage, particles);
                    
                    if (!enemy.active) {
                        if (scoreSystem) {
                            scoreSystem.addKill(enemy.score);
                        }
                    }
                    break;
                }
            }
        }
        
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            if (!bullet.active) continue;
            
            if (this.checkAABB(bullet, player)) {
                bullet.active = false;
                player.takeDamage(bullet.damage, particles);
            }
        }
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy.active) continue;
            
            if (this.checkAABB(enemy, player)) {
                enemy.active = false;
                player.takeDamage(1, particles);
                
                for (let j = 0; j < 10; j++) {
                    particles.push(this._createParticle(enemy.x, enemy.y, enemy.color));
                }
            }
        }
        
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            if (!powerUp.active) continue;
            
            if (this.checkAABB(powerUp, player)) {
                powerUp.active = false;
                player.applyPowerUp(powerUp.type);
            }
        }
    }
    
    static _createParticle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        return {
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color,
            alpha: 1,
            lifetime: 0.8,
            age: 0,
            active: true
        };
    }
}
