import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import PauseScene from '../scenes/PauseScene.js';
import GameOverScene from '../scenes/GameOverScene.js';
import Constants from './Constants.js';

const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: Constants.GAME.WIDTH,
  height: Constants.GAME.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: Constants.PHYSICS.GRAVITY_Y },
      debug: true
    }
  },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene],
  pixelArt: true,
  backgroundColor: '#5C94FC'
};

export default GameConfig;
