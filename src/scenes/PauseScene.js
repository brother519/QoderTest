import Phaser from 'phaser';
import Button from '../ui/Button.js';

class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }
  
  create() {
    const bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    
    this.add.text(400, 200, 'Paused', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);
    
    new Button(this, 400, 300, 'Continue', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    }).setOrigin(0.5);
    
    new Button(this, 400, 380, 'Restart', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
      this.scene.stop();
    }).setOrigin(0.5);
    
    new Button(this, 400, 460, 'Main Menu', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
      this.scene.stop();
    }).setOrigin(0.5);
  }
}

export default PauseScene;
