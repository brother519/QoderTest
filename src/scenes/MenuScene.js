import Phaser from 'phaser';
import Button from '../ui/Button.js';

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#5C94FC');
    
    this.add.text(400, 200, 'Super Mario', {
      fontSize: '64px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    new Button(this, 400, 350, 'Start Game', () => {
      this.scene.start('GameScene');
    }).setOrigin(0.5);
  }
}

export default MenuScene;
