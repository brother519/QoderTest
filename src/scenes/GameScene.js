import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Goomba from '../entities/enemies/Goomba.js';
import Koopa from '../entities/enemies/Koopa.js';
import Coin from '../entities/items/Coin.js';
import Mushroom from '../entities/items/Mushroom.js';
import FireFlower from '../entities/items/FireFlower.js';
import Fireball from '../entities/projectiles/Fireball.js';
import InputManager from '../systems/InputManager.js';
import LevelManager from '../systems/LevelManager.js';
import ScoreManager from '../systems/ScoreManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import TileMapBuilder from '../utils/TileMapBuilder.js';
import HUD from '../ui/HUD.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#5C94FC');
    
    this.scoreManager = new ScoreManager();
    this.levelManager = new LevelManager(this);
    this.inputManager = new InputManager(this);
    
    const levelData = this.levelManager.getCurrentLevel();
    
    this.cameras.main.setBounds(0, 0, levelData.width, levelData.height);
    this.physics.world.setBounds(0, 0, levelData.width, levelData.height);
    
    this.groundGroup = TileMapBuilder.buildGround(this, levelData.tiles.ground);
    this.platformGroup = TileMapBuilder.buildPlatforms(this, levelData.tiles.platforms);
    this.questionGroup = TileMapBuilder.buildQuestionBlocks(this, levelData.tiles.questionBlocks);
    
    this.enemyGroup = this.physics.add.group();
    this.itemGroup = this.physics.add.group();
    this.fireballGroup = this.physics.add.group();
    
    this.itemClasses = { Coin, Mushroom, FireFlower };
    this.fireballClass = Fireball;
    
    levelData.entities.enemies.forEach(e => {
      let enemy;
      if (e.type === 'Goomba') {
        enemy = new Goomba(this, e.x, e.y);
      } else if (e.type === 'Koopa') {
        enemy = new Koopa(this, e.x, e.y);
      }
      if (enemy) {
        this.enemyGroup.add(enemy);
      }
    });
    
    levelData.entities.items.forEach(i => {
      let item;
      if (i.type === 'Coin') {
        item = new Coin(this, i.x, i.y);
      }
      if (item) {
        this.itemGroup.add(item);
      }
    });
    
    this.player = new Player(this, levelData.spawn.x, levelData.spawn.y);
    
    if (this.groundGroup) {
      this.physics.add.collider(this.player, this.groundGroup);
      this.physics.add.collider(this.enemyGroup, this.groundGroup);
      this.physics.add.collider(this.fireballGroup, this.groundGroup);
    }
    
    if (this.platformGroup) {
      this.physics.add.collider(this.player, this.platformGroup);
      this.physics.add.collider(this.enemyGroup, this.platformGroup);
      this.physics.add.collider(this.fireballGroup, this.platformGroup);
    }
    
    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.enemyGroup,
      this.itemGroup,
      this.questionGroup,
      this.scoreManager
    );
    
    this.collisionManager.addFireballCollisions(this.fireballGroup);
    
    this.hud = new HUD(this);
    
    this.cameras.main.startFollow(this.player);
    
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }
  
  update() {
    this.player.update(this.inputManager);
    
    this.enemyGroup.children.entries.forEach(enemy => {
      if (enemy.update) {
        enemy.update();
      }
    });
    
    this.itemGroup.children.entries.forEach(item => {
      if (item.update) {
        item.update();
      }
    });
    
    this.hud.update(this.scoreManager);
  }
}

export default GameScene;