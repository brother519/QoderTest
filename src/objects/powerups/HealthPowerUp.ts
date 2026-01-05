import Phaser from 'phaser';
import PowerUp from './PowerUp';
import Player from '../Player';
import AudioManager from '../managers/AudioManager';
import ParticleManager from '../objects/effects/ParticleManager';

export default class HealthPowerUp extends PowerUp {
  private audioManager: AudioManager;
  private particleManager: ParticleManager;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health');
    
    this.audioManager = new AudioManager(scene);
    this.particleManager = new ParticleManager(scene);
  }

  collect(player: Player) {
    // 为玩家恢复生命值
    player.addHealth(1);
    
    // 播放收集音效
    this.audioManager.playSFX('powerup');
    
    // 创建收集粒子效果
    this.particleManager.createPowerUpEffect(this.x, this.y, 'health');
    
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