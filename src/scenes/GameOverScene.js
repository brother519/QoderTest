import Phaser from 'phaser';
import Button from '../ui/Button.js';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }
  
  init(data) {
    this.finalScore = data.score || 0;
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#000000');
    
    this.add.text(400, 200, 'Game Over', {
      fontSize: '64px',
      fill: '#ff0000'
    }).setOrigin(0.5);
    
    this.add.text(400, 280, `Score: ${this.finalScore}`, {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);
    
    const highScore = localStorage.getItem('highScore') || 0;
    if (this.finalScore > highScore) {
      localStorage.setItem('highScore', this.finalScore);
      this.add.text(400, 330, 'New High Score!', {
        fontSize: '24px',
        fill: '#ffff00'
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 330, `High Score: ${highScore}`, {
        fontSize: '24px',
        fill: '#fff'
      }).setOrigin(0.5);
    }
    
    new Button(this, 400, 420, 'Retry', () => {
      this.scene.start('GameScene');
    }).setOrigin(0.5);
    
    new Button(this, 400, 500, 'Main Menu', () => {
      this.scene.start('MenuScene');
    }).setOrigin(0.5);
  }
}

export default GameOverScene;
