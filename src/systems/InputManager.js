import Phaser from 'phaser';

class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }
  
  isLeft() {
    return this.cursors.left.isDown || this.wasd.left.isDown;
  }
  
  isRight() {
    return this.cursors.right.isDown || this.wasd.right.isDown;
  }
  
  isDown() {
    return this.cursors.down.isDown || this.wasd.down.isDown;
  }
  
  isJump() {
    return Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
           Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
           Phaser.Input.Keyboard.JustDown(this.spaceKey);
  }
  
  isShoot() {
    return Phaser.Input.Keyboard.JustDown(this.shiftKey);
  }
}

export default InputManager;
