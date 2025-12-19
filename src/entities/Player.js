import Phaser from 'phaser';
import Constants from '../config/Constants.js';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_small');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.currentState = 'SMALL';
    this.canShootFire = false;
    this.isInvincible = false;
    this.isDead = false;
    
    this.lastShootTime = 0;
    this.shootCooldown = 300;
  }
  
  update(inputManager) {
    if (this.isDead) return;
    
    if (inputManager.isLeft()) {
      this.setVelocityX(-Constants.PLAYER.SPEED);
      this.setFlipX(true);
    } else if (inputManager.isRight()) {
      this.setVelocityX(Constants.PLAYER.SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
    
    if (inputManager.isJump() && this.body.touching.down) {
      this.setVelocityY(Constants.PLAYER.JUMP_VELOCITY);
    }
    
    if (this.canShootFire && inputManager.isShoot()) {
      const now = this.scene.time.now;
      if (now - this.lastShootTime > this.shootCooldown) {
        this.shootFireball();
        this.lastShootTime = now;
      }
    }
  }
  
  shootFireball() {
    const Fireball = this.scene.fireballClass;
    if (!Fireball) return;
    
    const direction = this.flipX ? -1 : 1;
    const offsetX = this.flipX ? -10 : 10;
    const fireball = new Fireball(this.scene, this.x + offsetX, this.y, direction);
    this.scene.fireballGroup.add(fireball);
  }
  
  hurt() {
    if (this.isInvincible || this.isDead) return;
    
    if (this.currentState === 'SMALL') {
      this.die();
    } else {
      this.currentState = this.currentState === 'FIRE' ? 'BIG' : 'SMALL';
      this.updateState();
      this.becomeInvincible();
    }
  }
  
  becomeInvincible() {
    this.isInvincible = true;
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 20,
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      }
    });
  }
  
  die() {
    if (this.isDead) return;
    
    this.isDead = true;
    this.setVelocity(0, -400);
    this.body.setEnable(false);
    
    this.scene.time.delayedCall(2000, () => {
      if (this.scene.scoreManager) {
        this.scene.scoreManager.lives -= 1;
        
        if (this.scene.scoreManager.lives > 0) {
          this.scene.scene.restart();
        } else {
          this.scene.scene.start('GameOverScene', { 
            score: this.scene.scoreManager.score 
          });
        }
      }
    });
  }
  
  updateState() {
    switch(this.currentState) {
      case 'SMALL':
        this.setTexture('player_small');
        this.setSize(Constants.PLAYER.SIZE_SMALL.width, Constants.PLAYER.SIZE_SMALL.height);
        this.canShootFire = false;
        break;
      case 'BIG':
        this.setTexture('player_big');
        this.setSize(Constants.PLAYER.SIZE_BIG.width, Constants.PLAYER.SIZE_BIG.height);
        this.canShootFire = false;
        break;
      case 'FIRE':
        this.setTexture('player_fire');
        this.setSize(Constants.PLAYER.SIZE_BIG.width, Constants.PLAYER.SIZE_BIG.height);
        this.canShootFire = true;
        break;
    }
    this.body.setOffset(0, 0);
  }
  
  powerUp(type) {
    if (type === 'mushroom') {
      if (this.currentState === 'SMALL') {
        this.currentState = 'BIG';
        this.updateState();
      }
    } else if (type === 'fireflower') {
      if (this.currentState === 'BIG' || this.currentState === 'FIRE') {
        this.currentState = 'FIRE';
        this.updateState();
      }
    }
  }
}

export default Player;
