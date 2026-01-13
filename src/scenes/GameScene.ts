import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../config/Constants';
import PlayerTank from '../entities/PlayerTank';
import Bullet from '../entities/Bullet';

export default class GameScene extends Phaser.Scene {
  private player?: PlayerTank;
  private bullets?: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#333333');

    this.createPlaceholderGraphics();

    const playerStartX = 9 * TILE_SIZE + TILE_SIZE / 2;
    const playerStartY = 24 * TILE_SIZE + TILE_SIZE / 2;
    this.player = new PlayerTank(this, playerStartX, playerStartY);

    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    });

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const instructionText = this.add.text(10, 10, '方向键/WASD: 移动 | 空格/J: 射击', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  private createPlaceholderGraphics(): void {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x00ff00, 0.3);
    graphics.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    graphics.lineStyle(1, 0x00ff00, 0.5);
    for (let i = 0; i <= 26; i++) {
      graphics.lineBetween(i * TILE_SIZE, 0, i * TILE_SIZE, MAP_HEIGHT);
      graphics.lineBetween(0, i * TILE_SIZE, MAP_WIDTH, i * TILE_SIZE);
    }

    const baseX = 12 * TILE_SIZE;
    const baseY = 24 * TILE_SIZE;
    graphics.fillStyle(0xff0000, 0.5);
    graphics.fillRect(baseX, baseY, TILE_SIZE * 2, TILE_SIZE * 2);
  }

  update(time: number, delta: number) {
    if (this.player) {
      this.player.update();
    }
  }
}