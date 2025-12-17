import Phaser from 'phaser';
import { Direction, TILE_SIZE, SHOOT_COOLDOWN } from '@/utils/constants';
import Bullet from './Bullet';

export default class Tank extends Phaser.GameObjects.Rectangle {
  protected speed: number;
  protected currentDirection: Direction;
  protected lastShootTime: number = 0;
  protected bulletsGroup?: Phaser.GameObjects.Group;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    speed: number
  ) {
    super(scene, x, y, TILE_SIZE, TILE_SIZE, color);
    
    this.speed = speed;
    this.currentDirection = Direction.UP;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  setBulletsGroup(group: Phaser.GameObjects.Group) {
    this.bulletsGroup = group;
  }

  move(direction: Direction) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.currentDirection = direction;
    
    body.setVelocity(0, 0);
    
    switch (direction) {
      case Direction.UP:
        body.setVelocityY(-this.speed);
        this.setRotation(0);
        break;
      case Direction.DOWN:
        body.setVelocityY(this.speed);
        this.setRotation(Math.PI);
        break;
      case Direction.LEFT:
        body.setVelocityX(-this.speed);
        this.setRotation(-Math.PI / 2);
        break;
      case Direction.RIGHT:
        body.setVelocityX(this.speed);
        this.setRotation(Math.PI / 2);
        break;
    }
  }

  stop() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  shoot(): Bullet | null {
    const currentTime = this.scene.time.now;
    
    if (currentTime - this.lastShootTime < SHOOT_COOLDOWN) {
      return null;
    }

    this.lastShootTime = currentTime;

    let bulletX = this.x;
    let bulletY = this.y;

    switch (this.currentDirection) {
      case Direction.UP:
        bulletY -= TILE_SIZE / 2 + 4;
        break;
      case Direction.DOWN:
        bulletY += TILE_SIZE / 2 + 4;
        break;
      case Direction.LEFT:
        bulletX -= TILE_SIZE / 2 + 4;
        break;
      case Direction.RIGHT:
        bulletX += TILE_SIZE / 2 + 4;
        break;
    }

    const bullet = new Bullet(this.scene, bulletX, bulletY, this.currentDirection);
    
    if (this.bulletsGroup) {
      this.bulletsGroup.add(bullet);
    }

    return bullet;
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  getLastShootTime(): number {
    return this.lastShootTime;
  }

  setLastShootTime(time: number) {
    this.lastShootTime = time;
  }
}