import Phaser from 'phaser';
import { POWERUP_SPEED } from '../utils/Constants';
import { PowerUpType } from '../utils/Types';

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  type: PowerUpType;
  speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    // 根据道具类型选择纹理
    const texture = type === 'health' ? 'powerup_health' : 'powerup_weapon';
    super(scene, x, y, texture);
    
    // 物理设置
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(false);
    
    // 初始化属性
    this.type = type;
    this.speed = POWERUP_SPEED;
    
    // 设置初始外观
    this.setOrigin(0.5, 0.5);
    
    // 添加到场景
    scene.add.existing(this);
  }

  update() {
    // 向下移动
    this.setVelocityY(this.speed);
    
    // 如果道具超出屏幕底部，则销毁
    if (this.y > this.scene.game.config.height as number + 50) {
      this.destroy();
    }
  }

  collect() {
    // 在子类中实现具体的收集逻辑
    this.destroy();
  }
}