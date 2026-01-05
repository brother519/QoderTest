import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // 创建加载进度条
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 30, 320, 50);

    // 加载文本
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // 百分比文本
    const percentText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    // 更新进度条
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 20, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 加载游戏资源
    this.load.image('background', 'assets/images/backgrounds/background.svg');
    this.load.image('player', 'assets/images/player/player.svg');
    this.load.image('enemy_basic', 'assets/images/enemies/enemy_basic.svg');
    this.load.image('enemy_fast', 'assets/images/enemies/enemy_fast.svg');
    this.load.image('enemy_boss', 'assets/images/enemies/enemy_boss.svg');
    this.load.image('bullet_player', 'assets/images/bullets/bullet_player.svg');
    this.load.image('powerup_health', 'assets/images/powerups/powerup_health.svg');
    this.load.image('powerup_weapon', 'assets/images/powerups/powerup_weapon.svg');
  }

  create() {
    // 跳转到菜单场景
    this.scene.start('MenuScene');
  }
}