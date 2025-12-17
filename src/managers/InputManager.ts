import Phaser from 'phaser';
import { Direction } from '@/utils/constants';
import PlayerTank from '@/entities/PlayerTank';

export default class InputManager {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    J: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      
      this.wasdKeys = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        J: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      };
    }
  }

  handlePlayer1Input(tank: PlayerTank): { move: boolean; shoot: boolean } {
    if (!this.cursors) return { move: false, shoot: false };

    let moved = false;

    if (this.cursors.up.isDown) {
      tank.move(Direction.UP);
      moved = true;
    } else if (this.cursors.down.isDown) {
      tank.move(Direction.DOWN);
      moved = true;
    } else if (this.cursors.left.isDown) {
      tank.move(Direction.LEFT);
      moved = true;
    } else if (this.cursors.right.isDown) {
      tank.move(Direction.RIGHT);
      moved = true;
    } else {
      tank.stop();
    }

    const shoot = this.spaceKey?.isDown || false;

    return { move: moved, shoot };
  }

  handlePlayer2Input(tank: PlayerTank): { move: boolean; shoot: boolean } {
    if (!this.wasdKeys) return { move: false, shoot: false };

    let moved = false;

    if (this.wasdKeys.W.isDown) {
      tank.move(Direction.UP);
      moved = true;
    } else if (this.wasdKeys.S.isDown) {
      tank.move(Direction.DOWN);
      moved = true;
    } else if (this.wasdKeys.A.isDown) {
      tank.move(Direction.LEFT);
      moved = true;
    } else if (this.wasdKeys.D.isDown) {
      tank.move(Direction.RIGHT);
      moved = true;
    } else {
      tank.stop();
    }

    const shoot = this.wasdKeys.J.isDown || false;

    return { move: moved, shoot };
  }
}
