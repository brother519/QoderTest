export class CollisionSystem {
  constructor() {
    this.collisions = [];
  }

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  checkPlayerBulletEnemyCollisions(playerBullets, enemies) {
    const collisions = [];

    playerBullets.forEach(bullet => {
      if (!bullet.active) return;

      enemies.forEach(enemy => {
        if (!enemy.active) return;

        if (this.checkCollision(bullet, enemy)) {
          collisions.push({ bullet, enemy });
        }
      });
    });

    return collisions;
  }

  checkEnemyBulletPlayerCollisions(enemyBullets, player) {
    if (!player.active) return [];

    const collisions = [];

    enemyBullets.forEach(bullet => {
      if (!bullet.active) return;

      if (this.checkCollision(bullet, player)) {
        collisions.push({ bullet, player });
      }
    });

    return collisions;
  }

  checkPlayerEnemyCollisions(player, enemies) {
    if (!player.active) return [];

    const collisions = [];

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      if (this.checkCollision(player, enemy)) {
        collisions.push({ player, enemy });
      }
    });

    return collisions;
  }

  checkPlayerPowerUpCollisions(player, powerups) {
    if (!player.active) return [];

    const collisions = [];

    powerups.forEach(powerup => {
      if (!powerup.active) return;

      if (this.checkCollision(player, powerup)) {
        collisions.push({ player, powerup });
      }
    });

    return collisions;
  }

  handleCollisions(playerBullets, enemyBullets, enemies, player, powerups = []) {
    const results = {
      score: 0,
      enemiesDestroyed: 0,
      playerHit: false
    };

    const pbCollisions = this.checkPlayerBulletEnemyCollisions(playerBullets, enemies);
    pbCollisions.forEach(({ bullet, enemy }) => {
      const destroyed = enemy.takeDamage(bullet.damage);
      bullet.hit();
      
      if (destroyed) {
        results.score += enemy.score;
        results.enemiesDestroyed++;
      }
    });

    const ebCollisions = this.checkEnemyBulletPlayerCollisions(enemyBullets, player);
    ebCollisions.forEach(({ bullet, player }) => {
      player.takeDamage(1);
      bullet.destroy();
      results.playerHit = true;
    });

    const peCollisions = this.checkPlayerEnemyCollisions(player, enemies);
    peCollisions.forEach(({ player, enemy }) => {
      player.takeDamage(2);
      enemy.destroy();
      results.playerHit = true;
    });

    const ppCollisions = this.checkPlayerPowerUpCollisions(player, powerups);
    ppCollisions.forEach(({ powerup }) => {
      powerup.destroy();
    });

    return results;
  }
}
