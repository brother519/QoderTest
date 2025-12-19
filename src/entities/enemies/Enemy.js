import Phaser from 'phaser';
import Constants from '../config/Constants.js';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setVelocityX(Constants.ENEMY.GOOMBA_SPEED);
    this.isDying = false;
    this.score = 100;
  }
  
  update() {
    if (this.isDying) return;
    
    if (this.body.blocked.left || this.body.blocked.right) {
      this.body.velocity.x *= -1;
    }
    
    this.flipX = this.body.velocity.x < 0;
  }
  
  die() {
    if (this.isDying) return;
    
    this.isDying = true;
    this.setVelocityX(0);
    this.body.setEnable(false);
    this.scaleY = 0.5;
    
    this.scene.time.delayedCall(Constants.ENEMY.DIE_DURATION, () => {
      this.destroy();
    });
  }
  
  getScore() {
    return this.score;
  }
}

export default Enemy;
