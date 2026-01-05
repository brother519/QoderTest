import Phaser from 'phaser';
import { BULLET_SPEED } from '../../utils/Constants';

export default class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet_player');
    this.speed = BULLET_SPEED;
  }

  fire(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(-this.speed); // 向上移动
  }

  update() {
    // 如果子弹超出屏幕顶部，则禁用它
    if (this.y < 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
