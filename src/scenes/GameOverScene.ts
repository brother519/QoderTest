import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; highScore: number }) {
    this.score = data.score;
    this.highScore = data.highScore;
  }

  create() {
    // 游戏结束标题
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Game Over', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示分数
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, `Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 显示最高分
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `High Score: ${this.highScore}`, {
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 如果是新纪录
    if (this.score === this.highScore && this.highScore > 0) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'New Record!', {
        fontSize: '28px',
        fill: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // 重新开始按钮
    const restartButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'Restart Game', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });

    // 返回主菜单按钮
    const menuButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Main Menu', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
  }
}