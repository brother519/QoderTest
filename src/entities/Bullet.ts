import Phaser from 'phaser';
import { Direction, BULLET_SPEED, COLORS } from '@/utils/constants';

export default class Bullet extends Phaser.GameObjects.Rectangle {
  private direction: Direction;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: Direction) {
    super(scene, x, y, 8, 8, COLORS.BULLET);
    
    this.direction = direction;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setVelocityBasedOnDirection();
  }

  private setVelocityBasedOnDirection() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    switch (this.direction) {
      case Direction.UP:
        body.setVelocityY(-BULLET_SPEED);
        break;
      case Direction.DOWN:
        body.setVelocityY(BULLET_SPEED);
        break;
      case Direction.LEFT:
        body.setVelocityX(-BULLET_SPEED);
        break;
      case Direction.RIGHT:
        body.setVelocityX(BULLET_SPEED);
        break;
    }
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (
      this.x < 0 ||
      this.x > this.scene.cameras.main.width ||
      this.y < 0 ||
      this.y > this.scene.cameras.main.height
    ) {
      this.destroy();
    }
  }
}
