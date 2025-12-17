import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  private isVictory: boolean = false;
  private finalScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { victory: boolean; score: number }) {
    this.isVictory = data.victory || false;
    this.finalScore = data.score || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const titleText = this.isVictory ? '胜利!' : '游戏结束';
    const titleColor = this.isVictory ? '#00ff00' : '#ff0000';

    this.add.text(width / 2, height / 3, titleText, {
      fontSize: '64px',
      color: titleColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `最终分数: ${this.finalScore}`, {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const restartBtn = this.add.text(width / 2, height / 2 + 80, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    const menuBtn = this.add.text(width / 2, height / 2 + 140, '返回菜单', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    restartBtn.on('pointerover', () => {
      restartBtn.setBackgroundColor('#555555');
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setBackgroundColor('#333333');
    });

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'single' });
    });

    menuBtn.on('pointerover', () => {
      menuBtn.setBackgroundColor('#555555');
    });

    menuBtn.on('pointerout', () => {
      menuBtn.setBackgroundColor('#333333');
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
