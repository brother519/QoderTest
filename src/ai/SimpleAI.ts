import Phaser from 'phaser';
import EnemyTank from '@/entities/EnemyTank';
import { Direction } from '@/utils/constants';

export default class SimpleAI {
  private tank: EnemyTank;
  private scene: Phaser.Scene;
  private changeDirectionTimer: number = 0;
  private shootTimer: number = 0;
  private currentDirection: Direction;

  constructor(scene: Phaser.Scene, tank: EnemyTank) {
    this.scene = scene;
    this.tank = tank;
    this.currentDirection = Direction.DOWN;
    this.changeDirectionTimer = this.scene.time.now + Phaser.Math.Between(1000, 3000);
    this.shootTimer = this.scene.time.now + Phaser.Math.Between(500, 2000);
  }

  update() {
    const currentTime = this.scene.time.now;

    if (currentTime > this.changeDirectionTimer) {
      this.changeDirection();
      this.changeDirectionTimer = currentTime + Phaser.Math.Between(1000, 3000);
    }

    this.tank.move(this.currentDirection);

    if (currentTime > this.shootTimer) {
      this.tank.shoot();
      this.shootTimer = currentTime + Phaser.Math.Between(1000, 3000);
    }
  }

  private changeDirection() {
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    this.currentDirection = Phaser.Math.RND.pick(directions);
  }

  onCollision() {
    this.changeDirection();
  }
}
