import Phaser from 'phaser';
import { ENEMY_BASIC_SPEED } from '../../utils/Constants';
import AudioManager from '../../managers/AudioManager';
import ParticleManager from '../effects/ParticleManager';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  speed: number;
  score: number;
  movementPattern: string;
  private audioManager: AudioManager;
  private particleManager: ParticleManager;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    // 物理设置
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(false);
    
    // 初始化属性（子类会覆盖这些值）
    this.health = 1;
    this.speed = ENEMY_BASIC_SPEED;
    this.score = 10;
    this.movementPattern = 'straight';
    
    // 初始化音效和粒子管理器
    this.audioManager = new AudioManager(scene);
    this.particleManager = new ParticleManager(scene);
    
    // 设置初始外观
    this.setOrigin(0.5, 0.5);
    
    // 添加到场景
    scene.add.existing(this);
  }

  takeDamage(amount: number = 1) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    // 播放爆炸音效
    this.audioManager.playSFX('explosion');
    
    // 创建爆炸粒子效果
    this.particleManager.createExplosion(this.x, this.y);
    
    // 销毁敌机
    this.destroy();
  }

  move() {
    // 根据移动模式执行不同的移动逻辑
    switch (this.movementPattern) {
      case 'straight':
        this.setVelocityY(this.speed);
        break;
      case 'zigzag':
        this.setVelocityY(this.speed);
        // 添加左右摆动
        this.setVelocityX(Math.sin(this.scene.time.now / 300) * 50);
        break;
      case 'horizontal':
        // 水平移动
        this.setVelocityX(this.speed);
        break;
      default:
        this.setVelocityY(this.speed);
        break;
    }
  }

  update(time: number, delta: number) {
    this.move();
    
    // 如果敌机超出屏幕底部，则销毁
    if (this.y > this.scene.game.config.height as number + 50) {
      this.destroy();
    }
  }
}