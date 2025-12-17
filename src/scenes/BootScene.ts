import Phaser from 'phaser';
import PreloadScene from './PreloadScene';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.setBaseURL('');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
