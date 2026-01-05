import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class HUD {
  scene: Phaser.Scene;
  scoreText: Phaser.GameObjects.Text;
  healthText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  weaponText: Phaser.GameObjects.Text;
  pauseButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 创建UI元素
    this.scoreText = scene.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#00000088',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });

    this.healthText = scene.add.text(16, 50, 'Health: 3', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#00000088',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });

    this.levelText = scene.add.text(16, 84, 'Level: 1', {
      fontSize: '24px',
      fill: '#ffff00',
      backgroundColor: '#00000088',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });

    this.weaponText = scene.add.text(16, 118, 'Weapon: 1', {
      fontSize: '24px',
      fill: '#00ffff',
      backgroundColor: '#00000088',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    });

    // 暂停按钮
    this.pauseButton = scene.add.text(GAME_WIDTH - 20, 20, 'II', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(1, 0).setInteractive();

    // 添加暂停按钮事件
    this.pauseButton.on('pointerdown', () => {
      scene.scene.pause();
      scene.scene.launch('PauseScene');
    });
  }

  updateScore(score: number) {
    this.scoreText.setText(`Score: ${score}`);
  }

  updateHealth(health: number) {
    this.healthText.setText(`Health: ${health}`);
  }

  updateLevel(level: number) {
    this.levelText.setText(`Level: ${level}`);
  }

  updateWeaponLevel(level: number) {
    this.weaponText.setText(`Weapon: ${level}`);
  }

  setVisible(visible: boolean) {
    this.scoreText.setVisible(visible);
    this.healthText.setVisible(visible);
    this.levelText.setVisible(visible);
    this.weaponText.setVisible(visible);
    this.pauseButton.setVisible(visible);
  }
}