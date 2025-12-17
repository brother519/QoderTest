import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 3, '坦克大战', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const singlePlayerBtn = this.add.text(width / 2, height / 2, '单人模式', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    const doublePlayerBtn = this.add.text(width / 2, height / 2 + 60, '双人模式', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    singlePlayerBtn.on('pointerover', () => {
      singlePlayerBtn.setBackgroundColor('#555555');
    });

    singlePlayerBtn.on('pointerout', () => {
      singlePlayerBtn.setBackgroundColor('#333333');
    });

    singlePlayerBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'single' });
    });

    doublePlayerBtn.on('pointerover', () => {
      doublePlayerBtn.setBackgroundColor('#555555');
    });

    doublePlayerBtn.on('pointerout', () => {
      doublePlayerBtn.setBackgroundColor('#333333');
    });

    doublePlayerBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'double' });
    });
  }
}
