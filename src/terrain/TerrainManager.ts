import Phaser from 'phaser';
import { LevelData } from '@/types/level.types';
import { TerrainType } from '@/utils/constants';
import BrickWall from './BrickWall';
import SteelWall from './SteelWall';

export default class TerrainManager {
  private scene: Phaser.Scene;
  private brickWalls: Phaser.Physics.Arcade.StaticGroup;
  private steelWalls: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.brickWalls = this.scene.physics.add.staticGroup();
    this.steelWalls = this.scene.physics.add.staticGroup();
  }

  loadLevel(levelData: LevelData) {
    this.clearTerrain();

    for (let y = 0; y < levelData.terrain.length; y++) {
      for (let x = 0; x < levelData.terrain[y].length; x++) {
        const terrainType = levelData.terrain[y][x];
        
        if (terrainType === TerrainType.BRICK) {
          const brick = new BrickWall(this.scene, x, y);
          this.brickWalls.add(brick);
        } else if (terrainType === TerrainType.STEEL) {
          const steel = new SteelWall(this.scene, x, y);
          this.steelWalls.add(steel);
        }
      }
    }
  }

  clearTerrain() {
    this.brickWalls.clear(true, true);
    this.steelWalls.clear(true, true);
  }

  getBrickWalls(): Phaser.Physics.Arcade.StaticGroup {
    return this.brickWalls;
  }

  getSteelWalls(): Phaser.Physics.Arcade.StaticGroup {
    return this.steelWalls;
  }
}
