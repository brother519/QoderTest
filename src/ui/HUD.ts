import Phaser from 'phaser';
import { PlayerState } from '@/types/game.types';

export default class HUD {
  private scene: Phaser.Scene;
  private player1LivesText!: Phaser.GameObjects.Text;
  private player1ScoreText!: Phaser.GameObjects.Text;
  private player2LivesText?: Phaser.GameObjects.Text;
  private player2ScoreText?: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, gameMode: 'single' | 'double') {
    this.scene = scene;
    this.createHUD(gameMode);
  }

  private createHUD(gameMode: 'single' | 'double') {
    const padding = 10;

    this.levelText = this.scene.add.text(padding, padding, 'Level: 1', {
      fontSize: '20px',
      color: '#ffffff',
    });

    this.player1LivesText = this.scene.add.text(
      padding,
      padding + 30,
      'P1 Lives: 3',
      {
        fontSize: '18px',
        color: '#0066ff',
      }
    );

    this.player1ScoreText = this.scene.add.text(
      padding,
      padding + 55,
      'P1 Score: 0',
      {
        fontSize: '18px',
        color: '#0066ff',
      }
    );

    if (gameMode === 'double') {
      this.player2LivesText = this.scene.add.text(
        padding,
        padding + 85,
        'P2 Lives: 3',
        {
          fontSize: '18px',
          color: '#00ff66',
        }
      );

      this.player2ScoreText = this.scene.add.text(
        padding,
        padding + 110,
        'P2 Score: 0',
        {
          fontSize: '18px',
          color: '#00ff66',
        }
      );
    }

    const width = this.scene.cameras.main.width;
    this.enemiesText = this.scene.add.text(
      width - padding,
      padding,
      'Enemies: 0',
      {
        fontSize: '18px',
        color: '#ff0000',
      }
    ).setOrigin(1, 0);
  }

  updatePlayer1(state: PlayerState) {
    this.player1LivesText.setText(`P1 Lives: ${state.lives}`);
    this.player1ScoreText.setText(`P1 Score: ${state.score}`);
  }

  updatePlayer2(state: PlayerState) {
    if (this.player2LivesText && this.player2ScoreText) {
      this.player2LivesText.setText(`P2 Lives: ${state.lives}`);
      this.player2ScoreText.setText(`P2 Score: ${state.score}`);
    }
  }

  updateEnemies(count: number) {
    this.enemiesText.setText(`Enemies: ${count}`);
  }

  updateLevel(level: number) {
    this.levelText.setText(`Level: ${level}`);
  }
}
