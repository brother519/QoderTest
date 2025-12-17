import Phaser from 'phaser';
import { LevelData } from '@/types/level.types';
import TerrainManager from '@/terrain/TerrainManager';
import Base from '@/entities/Base';
import PlayerTank from '@/entities/PlayerTank';
import EnemyTank from '@/entities/EnemyTank';
import InputManager from '@/managers/InputManager';
import CollisionManager from '@/managers/CollisionManager';
import GameStateManager from '@/managers/GameStateManager';
import SimpleAI from '@/ai/SimpleAI';
import Bullet from '@/entities/Bullet';
import HUD from '@/ui/HUD';
import { COLORS, TILE_SIZE, ENEMY_SPAWN_DELAY } from '@/utils/constants';

export default class GameScene extends Phaser.Scene {
  private gameMode: 'single' | 'double' = 'single';
  private terrainManager!: TerrainManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private gameStateManager!: GameStateManager;
  private hud!: HUD;
  private base!: Base;
  private player1Tank?: PlayerTank;
  private player2Tank?: PlayerTank;
  private enemyTanks: EnemyTank[] = [];
  private bullets!: Phaser.GameObjects.Group;
  private currentLevel: LevelData | null = null;
  private enemySpawnQueue: Array<{ type: string; spawnPoint: number }> = [];
  private nextEnemySpawnTime: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode: 'single' | 'double' }) {
    this.gameMode = data.mode || 'single';
  }

  async create() {
    this.terrainManager = new TerrainManager(this);
    this.inputManager = new InputManager(this);
    this.collisionManager = new CollisionManager(this);
    this.gameStateManager = new GameStateManager(this, this.gameMode);
    this.hud = new HUD(this, this.gameMode);
    
    this.bullets = this.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    await this.loadLevel(1);

    this.setupCollisions();

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update() {
    if (this.player1Tank && this.player1Tank.active) {
      const input1 = this.inputManager.handlePlayer1Input(this.player1Tank);
      if (input1.shoot) {
        this.player1Tank.shoot();
      }
    }

    if (this.player2Tank && this.player2Tank.active && this.gameMode === 'double') {
      const input2 = this.inputManager.handlePlayer2Input(this.player2Tank);
      if (input2.shoot) {
        this.player2Tank.shoot();
      }
    }

    this.enemyTanks.forEach(enemy => {
      if (enemy.active) {
        enemy.updateAI();
      }
    });

    this.spawnEnemyFromQueue();

    this.hud.updatePlayer1(this.gameStateManager.getPlayer1State());
    if (this.gameMode === 'double') {
      this.hud.updatePlayer2(this.gameStateManager.getPlayer2State());
    }
    this.hud.updateEnemies(this.gameStateManager.getState().enemiesRemaining);

    if (this.gameStateManager.isGameOver()) {
      this.endGame(false);
    } else if (this.gameStateManager.isLevelComplete()) {
      this.endGame(true);
    }
  }

  private async loadLevel(levelId: number) {
    try {
      const response = await fetch(`/assets/maps/levels/level${levelId}.json`);
      const levelData: LevelData = await response.json();
      
      this.currentLevel = levelData;
      
      this.terrainManager.loadLevel(levelData);
      
      this.base = new Base(this, levelData.basePosition.x, levelData.basePosition.y);
      
      this.spawnPlayers(levelData);
      
      this.prepareEnemySpawnQueue(levelData);
      
      this.hud.updateLevel(levelId);
      
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  }

  private spawnPlayers(levelData: LevelData) {
    const player1Spawn = levelData.playerSpawns.find(s => s.player === 1);
    if (player1Spawn) {
      this.player1Tank = new PlayerTank(
        this,
        player1Spawn.x * TILE_SIZE + TILE_SIZE / 2,
        player1Spawn.y * TILE_SIZE + TILE_SIZE / 2,
        COLORS.PLAYER1,
        1
      );
      this.player1Tank.setBulletsGroup(this.bullets);
    }

    if (this.gameMode === 'double') {
      const player2Spawn = levelData.playerSpawns.find(s => s.player === 2);
      if (player2Spawn) {
        this.player2Tank = new PlayerTank(
          this,
          player2Spawn.x * TILE_SIZE + TILE_SIZE / 2,
          player2Spawn.y * TILE_SIZE + TILE_SIZE / 2,
          COLORS.PLAYER2,
          2
        );
        this.player2Tank.setBulletsGroup(this.bullets);
      }
    }
  }

  private prepareEnemySpawnQueue(levelData: LevelData) {
    this.enemySpawnQueue = [];
    
    let totalEnemies = 0;
    levelData.enemies.forEach(enemyConfig => {
      totalEnemies += enemyConfig.count;
      for (let i = 0; i < enemyConfig.count; i++) {
        const spawnPointIndex = i % levelData.enemySpawnPoints.length;
        this.enemySpawnQueue.push({
          type: enemyConfig.type,
          spawnPoint: spawnPointIndex
        });
      }
    });

    this.gameStateManager.setEnemiesRemaining(totalEnemies);
    this.nextEnemySpawnTime = this.time.now + 1000;
  }

  private spawnEnemyFromQueue() {
    if (this.enemySpawnQueue.length === 0) return;
    if (this.time.now < this.nextEnemySpawnTime) return;

    const enemyConfig = this.enemySpawnQueue.shift();
    if (!enemyConfig || !this.currentLevel) return;

    const spawnPoint = this.currentLevel.enemySpawnPoints[enemyConfig.spawnPoint];
    
    const enemy = new EnemyTank(
      this,
      spawnPoint.x * TILE_SIZE + TILE_SIZE / 2,
      spawnPoint.y * TILE_SIZE + TILE_SIZE / 2,
      COLORS.ENEMY
    );
    
    enemy.setBulletsGroup(this.bullets);
    
    const ai = new SimpleAI(this, enemy);
    enemy.setAIController(ai);
    
    this.enemyTanks.push(enemy);
    
    this.physics.add.collider(enemy, this.terrainManager.getBrickWalls());
    this.physics.add.collider(enemy, this.terrainManager.getSteelWalls());
    this.physics.add.collider(enemy, this.base);
    
    if (this.player1Tank) {
      this.physics.add.collider(enemy, this.player1Tank);
    }
    if (this.player2Tank) {
      this.physics.add.collider(enemy, this.player2Tank);
    }

    this.enemyTanks.forEach(otherEnemy => {
      if (otherEnemy !== enemy) {
        this.physics.add.collider(enemy, otherEnemy);
      }
    });

    this.nextEnemySpawnTime = this.time.now + ENEMY_SPAWN_DELAY;
  }

  private setupCollisions() {
    if (this.player1Tank) {
      this.physics.add.collider(this.player1Tank, this.terrainManager.getBrickWalls());
      this.physics.add.collider(this.player1Tank, this.terrainManager.getSteelWalls());
      this.physics.add.collider(this.player1Tank, this.base);
    }

    if (this.player2Tank) {
      this.physics.add.collider(this.player2Tank, this.terrainManager.getBrickWalls());
      this.physics.add.collider(this.player2Tank, this.terrainManager.getSteelWalls());
      this.physics.add.collider(this.player2Tank, this.base);
    }

    if (this.player1Tank && this.player2Tank) {
      this.physics.add.collider(this.player1Tank, this.player2Tank);
    }

    this.collisionManager.setupBulletCollisions(
      this.bullets,
      this.terrainManager.getBrickWalls(),
      this.terrainManager.getSteelWalls()
    );

    const playerTanks = [];
    if (this.player1Tank) playerTanks.push(this.player1Tank);
    if (this.player2Tank) playerTanks.push(this.player2Tank);

    this.collisionManager.setupBulletTankCollisions(
      this.bullets,
      playerTanks,
      this.enemyTanks,
      (tank) => this.onPlayerHit(tank as PlayerTank),
      (tank) => this.onEnemyHit(tank as EnemyTank)
    );

    this.collisionManager.setupBulletBaseCollision(
      this.bullets,
      this.base,
      () => this.onBaseHit()
    );
  }

  private onPlayerHit(tank: PlayerTank) {
    tank.destroy();
    
    if (tank.getPlayerNumber() === 1) {
      const lives = this.gameStateManager.player1Hit();
      if (lives > 0 && this.currentLevel) {
        this.respawnPlayer(1);
      }
    } else {
      const lives = this.gameStateManager.player2Hit();
      if (lives > 0 && this.currentLevel) {
        this.respawnPlayer(2);
      }
    }
  }

  private onEnemyHit(tank: EnemyTank) {
    tank.destroy();
    this.enemyTanks = this.enemyTanks.filter(e => e !== tank);
    this.gameStateManager.enemyDestroyed(100);
  }

  private onBaseHit() {
    this.base.destroy();
    this.gameStateManager.baseDestroyed();
  }

  private respawnPlayer(playerNumber: number) {
    if (!this.currentLevel) return;

    const spawn = this.currentLevel.playerSpawns.find(s => s.player === playerNumber);
    if (!spawn) return;

    if (playerNumber === 1) {
      this.player1Tank = new PlayerTank(
        this,
        spawn.x * TILE_SIZE + TILE_SIZE / 2,
        spawn.y * TILE_SIZE + TILE_SIZE / 2,
        COLORS.PLAYER1,
        1
      );
      this.player1Tank.setBulletsGroup(this.bullets);
    } else {
      this.player2Tank = new PlayerTank(
        this,
        spawn.x * TILE_SIZE + TILE_SIZE / 2,
        spawn.y * TILE_SIZE + TILE_SIZE / 2,
        COLORS.PLAYER2,
        2
      );
      this.player2Tank.setBulletsGroup(this.bullets);
    }
  }

  private endGame(victory: boolean) {
    const score = this.gameStateManager.getPlayer1State().score;
    this.scene.start('GameOverScene', { victory, score });
  }
}