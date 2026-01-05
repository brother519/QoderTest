import Phaser from 'phaser';
import Player from '../objects/Player';
import BasicEnemy from '../objects/enemies/BasicEnemy';
import FastEnemy from '../objects/enemies/FastEnemy';
import EnemySpawner from '../managers/EnemySpawner';
import ScoreManager from '../managers/ScoreManager';
import LevelManager from '../managers/LevelManager';
import HealthPowerUp from '../objects/powerups/HealthPowerUp';
import WeaponPowerUp from '../objects/powerups/WeaponPowerUp';
import HUD from '../ui/HUD';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class GameScene extends Phaser.Scene {
  player!: Player;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  spaceKey!: Phaser.Input.Keyboard.Key;
  background!: Phaser.GameObjects.TileSprite;
  enemySpawner!: EnemySpawner;
  scoreManager!: ScoreManager;
  levelManager!: LevelManager;
  enemies!: Phaser.Physics.Arcade.Group;
  bullets!: Phaser.Physics.Arcade.Group;
  powerUps!: Phaser.Physics.Arcade.Group;
  hud!: HUD;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // 在这里加载游戏场景需要的资源
    this.load.image('background', 'assets/images/backgrounds/background.svg');
    this.load.image('player', 'assets/images/player/player.svg');
    this.load.image('enemy_basic', 'assets/images/enemies/enemy_basic.svg');
    this.load.image('enemy_fast', 'assets/images/enemies/enemy_fast.svg');
    this.load.image('bullet_player', 'assets/images/bullets/bullet_player.svg');
    this.load.image('powerup_health', 'assets/images/powerups/powerup_health.svg');
    this.load.image('powerup_weapon', 'assets/images/powerups/powerup_weapon.svg');
  }

  create() {
    // 创建滚动背景
    this.background = this.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      'background'
    );

    // 初始化管理器
    this.scoreManager = new ScoreManager();
    this.levelManager = new LevelManager();

    // 设置关卡升级回调
    this.levelManager.onLevelUp(() => {
      console.log(`Level up! Now at level ${this.levelManager.getCurrentLevel()}`);
    });

    // 创建玩家
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 'player');

    // 初始化敌机生成器
    this.enemySpawner = new EnemySpawner(this);
    this.enemySpawner.startSpawning();

    // 初始化键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI
    this.hud = new HUD(this);

    // 获取子弹、敌机和道具组
    this.bullets = this.player.weaponSystem.getBullets();
    this.enemies = this.enemySpawner.getEnemies();
    this.powerUps = this.enemySpawner.getPowerUps();

    // 设置碰撞检测
    this.setupCollisions();

    // 设置暂停键 (ESC)
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  setupCollisions() {
    // 玩家子弹与敌机的碰撞
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      undefined,
      this
    );

    // 玩家与敌机的碰撞
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy,
      undefined,
      this
    );

    // 玩家与道具的碰撞
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      this.playerHitPowerUp,
      undefined,
      this
    );
  }

  bulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    // 从显示中移除子弹
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
    bulletSprite.setActive(false);
    bulletSprite.setVisible(false);

    // 对敌机造成伤害
    const enemySprite = enemy as BasicEnemy | FastEnemy;
    enemySprite.takeDamage(1);

    // 如果敌机死亡
    if (enemySprite.health <= 0) {
      // 增加分数
      const scoreToAdd = (enemySprite as any).score || 10;
      this.scoreManager.addScore(scoreToAdd);
      
      // 更新分数管理器以检查关卡升级
      this.levelManager.updateScore(this.scoreManager.getCurrentScore());
      
      // 检查是否掉落道具
      this.enemySpawner.checkPowerUpDrop(enemySprite.x, enemySprite.y);
    }
  }

  playerHitEnemy(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    // 对玩家造成伤害
    const playerSprite = player as Player;
    playerSprite.takeDamage(1);

    // 敌机销毁
    const enemySprite = enemy as BasicEnemy | FastEnemy;
    enemySprite.destroy();

    // 检查游戏是否结束
    if (playerSprite.health <= 0) {
      this.gameOver();
    }
  }

  playerHitPowerUp(player: Phaser.GameObjects.GameObject, powerUp: Phaser.GameObjects.GameObject) {
    const playerSprite = player as Player;
    const powerUpSprite = powerUp as HealthPowerUp | WeaponPowerUp;
    
    // 根据道具类型执行相应操作
    if (powerUpSprite.type === 'health') {
      (powerUpSprite as HealthPowerUp).collect(playerSprite);
    } else if (powerUpSprite.type === 'weapon') {
      (powerUpSprite as WeaponPowerUp).collect(playerSprite);
    }
  }

  gameOver() {
    // 更新分数管理器
    this.scoreManager.saveScore();

    // 停止敌机生成
    this.enemySpawner.stopSpawning();

    // 切换到游戏结束场景
    this.scene.pause();
    this.scene.launch('GameOverScene', { 
      score: this.scoreManager.getCurrentScore(),
      highScore: this.scoreManager.getHighScore()
    });
  }

  update(time: number, delta: number) {
    // 更新背景滚动
    this.background.tilePositionY += 1;

    // 更新玩家
    this.player.update(time, delta);

    // 更新敌机生成器
    this.enemySpawner.update(time, delta);

    // 处理玩家输入
    this.handleInput();

    // 更新UI
    this.hud.updateScore(this.scoreManager.getCurrentScore());
    this.hud.updateHealth(this.player.health);
    this.hud.updateLevel(this.levelManager.getCurrentLevel());
    this.hud.updateWeaponLevel(this.player.weaponLevel);
  }

  handleInput() {
    // 处理移动输入
    const speed = 300;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasdKeys.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
      velocityY = speed;
    }

    // 标准化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707; // 1/sqrt(2)
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 处理射击输入
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.shoot();
    }
  }
}