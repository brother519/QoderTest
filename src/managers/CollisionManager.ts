import Phaser from 'phaser';
import Bullet from '@/entities/Bullet';
import Tank from '@/entities/Tank';
import BrickWall from '@/terrain/BrickWall';
import SteelWall from '@/terrain/SteelWall';

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
}
