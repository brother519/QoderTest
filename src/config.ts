import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default config;