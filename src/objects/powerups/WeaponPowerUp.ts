import Phaser from 'phaser';
import PowerUp from './PowerUp';
import Player from '../Player';
import AudioManager from '../managers/AudioManager';
import ParticleManager from '../objects/effects/ParticleManager';

export default class WeaponPowerUp extends PowerUp {
  private audioManager: AudioManager;
  private particleManager: ParticleManager;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'weapon');
    
    this.audioManager = new AudioManager(scene);
    this.particleManager = new ParticleManager(scene);
  }

  collect(player: Player) {
    // 升级玩家武器
    player.upgradeWeapon();
    
    // 播放收集音效
    this.audioManager.playSFX('powerup');
    
    // 创建收集粒子效果
    this.particleManager.createPowerUpEffect(this.x, this.y, 'weapon');
    
    // 播放收集动画效果
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}