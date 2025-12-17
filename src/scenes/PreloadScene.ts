import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.createLoadingScreen();
    this.loadAssets();
  }

  private createLoadingScreen() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 + 30, 320, 30);

    this.progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      this.percentText.setText(`${Math.floor(value * 100)}%`);
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(width / 2 - 150, height / 2 + 40, 300 * value, 10);
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
    });
  }

  private loadAssets() {
  }

  create() {
    this.scene.start('MenuScene');
  }
}
