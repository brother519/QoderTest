import Phaser from 'phaser';
import { LevelData } from '@/types/level.types';
import TerrainManager from '@/terrain/TerrainManager';
import Base from '@/entities/Base';
import PlayerTank from '@/entities/PlayerTank';
import InputManager from '@/managers/InputManager';
import CollisionManager from '@/managers/CollisionManager';
import Bullet from '@/entities/Bullet';
import { COLORS, TILE_SIZE } from '@/utils/constants';

export default class GameScene extends Phaser.Scene {
  private gameMode: 'single' | 'double' = 'single';
  private terrainManager!: TerrainManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private base!: Base;
  private player1Tank?: PlayerTank;
  private player2Tank?: PlayerTank;
  private bullets!: Phaser.GameObjects.Group;
  private currentLevel: LevelData | null = null;

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
    if (this.player1Tank) {
      const input1 = this.inputManager.handlePlayer1Input(this.player1Tank);
      if (input1.shoot) {
        this.player1Tank.shoot();
      }
    }

    if (this.player2Tank && this.gameMode === 'double') {
      const input2 = this.inputManager.handlePlayer2Input(this.player2Tank);
      if (input2.shoot) {
        this.player2Tank.shoot();
      }
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
  }
}