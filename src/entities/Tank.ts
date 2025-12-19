import Phaser from 'phaser';
import { Direction, TILE_SIZE } from '../config/Constants';
import { getDirectionVector, getRotationAngle } from '../utils/Direction';

export default class Tank extends Phaser.Physics.Arcade.Sprite {
  protected direction: Direction;
  protected speed: number;
  protected health: number;
  protected maxBullets: number;
  protected bulletPower: number;
  protected lastShootTime: number;
  protected shootCooldown: number;
  protected activeBullets: Set<Phaser.Physics.Arcade.Sprite>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    speed: number,
    health: number
  ) {
    super(scene, x, y, texture);

    this.direction = Direction.UP;
    this.speed = speed;
    this.health = health;
    this.maxBullets = 2;
    this.bulletPower = 1;
    this.lastShootTime = 0;
    this.shootCooldown = 300;
    this.activeBullets = new Set();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.body!.setSize(TILE_SIZE, TILE_SIZE);
    (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  setDirection(direction: Direction): void {
    this.direction = direction;
    this.setRotation(getRotationAngle(direction));
  }

  getDirection(): Direction {
    return this.direction;
  }

  move(): void {
    const vector = getDirectionVector(this.direction);
    this.setVelocity(vector.x * this.speed, vector.y * this.speed);
  }

  stop(): void {
    this.setVelocity(0, 0);
  }

  canShoot(): boolean {
    const currentTime = this.scene.time.now;
    return (
      this.activeBullets.size < this.maxBullets &&
      currentTime - this.lastShootTime >= this.shootCooldown
    );
  }

  shoot(): Phaser.Physics.Arcade.Sprite | null {
    if (!this.canShoot()) {
      return null;
    }

    this.lastShootTime = this.scene.time.now;

    const vector = getDirectionVector(this.direction);
    const bulletX = this.x + vector.x * TILE_SIZE;
    const bulletY = this.y + vector.y * TILE_SIZE;

    const bullet = this.scene.physics.add.sprite(bulletX, bulletY, 'bullet');
    bullet.setDisplaySize(8, 8);
    bullet.setRotation(getRotationAngle(this.direction));
    bullet.setData('direction', this.direction);
    bullet.setData('power', this.bulletPower);
    bullet.setData('owner', this);

    this.activeBullets.add(bullet);

    return bullet;
  }

  removeBullet(bullet: Phaser.Physics.Arcade.Sprite): void {
    this.activeBullets.delete(bullet);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  getHealth(): number {
    return this.health;
  }

  isAlive(): boolean {
    return this.health > 0;
  }
}
