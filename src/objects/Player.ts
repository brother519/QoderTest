import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_HEALTH, PLAYER_INVINCIBLE_DURATION, FIRE_RATE } from '../utils/Constants';
import WeaponSystem from '../objects/weapons/WeaponSystem';
import AudioManager from '../managers/AudioManager';
import ParticleManager from '../objects/effects/ParticleManager';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  health: number;
  maxHealth: number;
  isInvincible: boolean;
  lastHitTime: number;
  score: number;
  weaponSystem: WeaponSystem;
  weaponLevel: number;
  lastShootTime: number;
  private audioManager: AudioManager;
  private particleManager: ParticleManager;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    // 物理设置
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);
    
    // 初始化属性
    this.health = PLAYER_HEALTH;
    this.maxHealth = PLAYER_HEALTH;
    this.isInvincible = false;
    this.lastHitTime = 0;
    this.score = 0;
    this.weaponLevel = 1;
    this.lastShootTime = 0;
    
    // 设置初始外观
    this.setOrigin(0.5, 0.5);
    
    // 添加到场景
    scene.add.existing(this);
    
    // 初始化武器系统
    this.weaponSystem = new WeaponSystem(scene);
    
    // 初始化音效和粒子管理器
    this.audioManager = new AudioManager(scene);
    this.particleManager = new ParticleManager(scene);
  }

  update(time: number, delta: number) {
    // 更新无敌状态
    if (this.isInvincible && time - this.lastHitTime > PLAYER_INVINCIBLE_DURATION) {
      this.isInvincible = false;
      this.clearTint(); // 移除着色效果
    }
  }

  takeDamage(amount: number = 1) {
    if (this.isInvincible || this.health <= 0) {
      return;
    }

    this.health -= amount;
    
    // 播放受伤音效
    this.audioManager.playSFX('hurt');
    
    if (this.health <= 0) {
      this.health = 0;
      this.onPlayerDeath();
    } else {
      // 设置无敌状态
      this.isInvincible = true;
      this.lastHitTime = this.scene.time.now;
      
      // 视觉反馈 - 闪烁效果
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.setAlpha(1);
          this.clearTint();
        }
      });
      
      // 添加受伤粒子效果
      this.particleManager.createExplosion(this.x, this.y);
    }
  }

  onPlayerDeath() {
    console.log('Player died!');
    // 播放死亡音效
    this.audioManager.playSFX('explosion');
    // 创建死亡粒子效果
    this.particleManager.createExplosion(this.x, this.y);
    // 在实际游戏中，这里会触发游戏结束逻辑
  }

  shoot() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime < FIRE_RATE) {
      return;
    }
    
    this.weaponSystem.fire(this.x, this.y - 20, this.weaponLevel);
    this.lastShootTime = currentTime;
    
    // 播放射击音效
    this.audioManager.playSFX('shoot');
  }

  upgradeWeapon() {
    if (this.weaponLevel < 3) {
      this.weaponLevel++;
    }
  }

  addHealth(amount: number = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
}