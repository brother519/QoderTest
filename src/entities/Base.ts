import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '@/utils/constants';

export default class Base extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + TILE_SIZE, TILE_SIZE * 2, TILE_SIZE * 2, COLORS.BASE);
    
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }

  destroy() {
    super.destroy();
  }
}
