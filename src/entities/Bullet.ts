import Phaser from 'phaser';
import { BULLET_SPEED } from '../config/Constants';
import { getDirectionVector } from '../utils/Direction';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  private power: number;
  private owner: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: any,
    power: number,
    owner: Phaser.Physics.Arcade.Sprite
  ) {
    super(scene, x, y, 'bullet');

    this.power = power;
    this.owner = owner;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(8, 8);
    (this.body as Phaser.Physics.Arcade.Body).setSize(8, 8);

    const vector = getDirectionVector(direction);
    this.setVelocity(vector.x * BULLET_SPEED, vector.y * BULLET_SPEED);
  }

  getPower(): number {
    return this.power;
  }

  getOwner(): Phaser.Physics.Arcade.Sprite {
    return this.owner;
  }

  update(): void {
    if (
      this.x < 0 ||
      this.x > this.scene.cameras.main.width ||
      this.y < 0 ||
      this.y > this.scene.cameras.main.height
    ) {
      this.destroyBullet();
    }
  }

  destroyBullet(): void {
    if (this.owner && typeof (this.owner as any).removeBullet === 'function') {
      (this.owner as any).removeBullet(this);
    }
    this.destroy();
  }
}
