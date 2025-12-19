import Phaser from 'phaser';
import Tank from './Tank';
import { Direction, PLAYER_SPEED, PLAYER_LIVES } from '../config/Constants';
import { alignToGrid, isAligned } from '../utils/GridHelper';

export default class PlayerTank extends Tank {
  private lives: number;
  private upgradeLevel: number;
  private hasShield: boolean;
  private shieldEndTime: number;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private jKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-tank', PLAYER_SPEED, 1);

    this.lives = PLAYER_LIVES;
    this.upgradeLevel = 0;
    this.hasShield = true;
    this.shieldEndTime = scene.time.now + 3000;

    this.setupInput();
  }

  private setupInput(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
      };
      this.spaceKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.jKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.J
      );
    }
  }

  update(): void {
    this.updateShield();
    this.handleInput();
  }

  private updateShield(): void {
    if (this.hasShield && this.scene.time.now > this.shieldEndTime) {
      this.hasShield = false;
    }
  }

  private handleInput(): void {
    if (!this.cursors || !this.wasdKeys) return;

    let moving = false;
    let newDirection: Direction | null = null;

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      newDirection = Direction.UP;
      moving = true;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      newDirection = Direction.DOWN;
      moving = true;
    } else if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      newDirection = Direction.LEFT;
      moving = true;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      newDirection = Direction.RIGHT;
      moving = true;
    }

    if (moving && newDirection) {
      if (newDirection !== this.direction) {
        this.stop();
        this.x = alignToGrid(this.x);
        this.y = alignToGrid(this.y);
        this.setDirection(newDirection);
      }
      this.move();
    } else {
      this.stop();
    }

    if (
      (this.spaceKey?.isDown || this.jKey?.isDown) &&
      this.canShoot()
    ) {
      this.shoot();
    }
  }

  takeDamage(amount: number): void {
    if (this.hasShield) {
      return;
    }

    super.takeDamage(amount);
    if (!this.isAlive() && this.lives > 0) {
      this.respawn();
    }
  }

  private respawn(): void {
    this.lives--;
    if (this.lives > 0) {
      this.health = 1;
      this.hasShield = true;
      this.shieldEndTime = this.scene.time.now + 3000;
    }
  }

  addLife(): void {
    this.lives++;
  }

  upgrade(): void {
    this.upgradeLevel = Math.min(this.upgradeLevel + 1, 4);
    this.applyUpgrade();
  }

  private applyUpgrade(): void {
    switch (this.upgradeLevel) {
      case 1:
        this.shootCooldown = 240;
        break;
      case 2:
        this.bulletPower = 2;
        break;
      case 3:
        this.maxBullets = 3;
        break;
      case 4:
        this.shootCooldown = 200;
        this.bulletPower = 2;
        this.maxBullets = 3;
        break;
    }
  }

  activateShield(duration: number): void {
    this.hasShield = true;
    this.shieldEndTime = this.scene.time.now + duration;
  }

  getLives(): number {
    return this.lives;
  }

  getUpgradeLevel(): number {
    return this.upgradeLevel;
  }

  getHasShield(): boolean {
    return this.hasShield;
  }
}
