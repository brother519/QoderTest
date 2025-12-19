import Phaser from 'phaser';
import Constants from '../config/Constants.js';

class Fireball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, direction) {
    super(scene, x, y, 'fireball');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setVelocity(
      direction * Constants.ITEM.FIREBALL_SPEED, 
      Constants.ITEM.FIREBALL_JUMP
    );
    
    this.setBounce(0.5, 0.5);
    
    scene.time.delayedCall(Constants.ITEM.FIREBALL_LIFETIME, () => {
      if (this.scene) {
        this.destroy();
      }
    });
  }
}

export default Fireball;
