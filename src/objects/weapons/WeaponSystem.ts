import Phaser from 'phaser';
import PlayerBullet from './PlayerBullet';

export default class WeaponSystem {
  private scene: Phaser.Scene;
  private bulletGroup: Phaser.Physics.Arcade.Group;
  private fireRate: number;
  private lastFired: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bulletGroup = scene.physics.add.group({
      classType: PlayerBullet,
      maxSize: 50,
      runChildUpdate: true
    });
    this.fireRate = 200; // 毫秒
    this.lastFired = 0;
  }

  fire(x: number, y: number, level: number = 1) {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastFired < this.fireRate) {
      return;
    }

    switch (level) {
      case 1:
        // 单发子弹
        this.createBullet(x, y);
        break;
      case 2:
        // 双发子弹（左右两侧）
        this.createBullet(x - 10, y);
        this.createBullet(x + 10, y);
        break;
      case 3:
        // 三发扇形子弹
        this.createBullet(x, y); // 中间
        this.createBullet(x - 15, y); // 左
        this.createBullet(x + 15, y); // 右
        break;
      default:
        this.createBullet(x, y);
        break;
    }

    this.lastFired = currentTime;
  }

  private createBullet(x: number, y: number) {
    const bullet = this.bulletGroup.get(x, y, 'bullet_player') as PlayerBullet;
    if (bullet) {
      bullet.fire(x, y);
    }
  }

  getBullets() {
    return this.bulletGroup;
  }
}
