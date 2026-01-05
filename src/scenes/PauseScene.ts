import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // 半透明背景
    const background = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    
    // 暂停标题
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'PAUSED', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 继续游戏按钮
    const continueButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Continue', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();

    continueButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    // 退出游戏按钮
    const exitButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'Exit to Menu', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#cc0000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();

    exitButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    // ESC键也可以继续游戏
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }
}