import Phaser from 'phaser';
import Bullet from '@/entities/Bullet';
import Tank from '@/entities/Tank';
import PlayerTank from '@/entities/PlayerTank';
import EnemyTank from '@/entities/EnemyTank';
import Base from '@/entities/Base';

export default class CollisionManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setupBulletCollisions(
    bullets: Phaser.GameObjects.Group,
    brickWalls: Phaser.Physics.Arcade.StaticGroup,
    steelWalls: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.scene.physics.add.overlap(
      bullets,
      brickWalls,
      (bullet, brick) => {
        bullet.destroy();
        brick.destroy();
      },
      undefined,
      this
    );

    this.scene.physics.add.overlap(
      bullets,
      steelWalls,
      (bullet) => {
        bullet.destroy();
      },
      undefined,
      this
    );
  }

  setupBulletTankCollisions(
    bullets: Phaser.GameObjects.Group,
    playerTanks: Tank[],
    enemyTanks: Tank[],
    onPlayerHit: (tank: Tank) => void,
    onEnemyHit: (tank: Tank) => void
  ) {
    enemyTanks.forEach(enemy => {
      this.scene.physics.add.overlap(
        bullets,
        enemy,
        (bullet, tank) => {
          bullet.destroy();
          onEnemyHit(tank as Tank);
        },
        undefined,
        this
      );
    });

    playerTanks.forEach(player => {
      this.scene.physics.add.overlap(
        bullets,
        player,
        (bullet, tank) => {
          bullet.destroy();
          onPlayerHit(tank as Tank);
        },
        undefined,
        this
      );
    });
  }

  setupBulletBaseCollision(
    bullets: Phaser.GameObjects.Group,
    base: Base,
    onBaseHit: () => void
  ) {
    this.scene.physics.add.overlap(
      bullets,
      base,
      (bullet) => {
        bullet.destroy();
        onBaseHit();
      },
      undefined,
      this
    );
  }
}