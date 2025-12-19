import Phaser from 'phaser';

class Button extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, onClick) {
    super(scene, x, y, text, {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 }
    });
    
    this.setInteractive({ useHandCursor: true });
    
    this.on('pointerdown', onClick);
    
    this.on('pointerover', () => {
      this.setStyle({ fill: '#ff0' });
    });
    
    this.on('pointerout', () => {
      this.setStyle({ fill: '#fff' });
    });
    
    scene.add.existing(this);
  }
}

export default Button;
