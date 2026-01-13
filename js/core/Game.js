import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATES, PLAYER_LIVES, MAX_ACTIVE_ENEMIES } from '../constants.js';
import { InputManager } from './InputManager.js';
import { EventBus } from './EventBus.js';
import { Map } from '../map/Map.js';
import { PlayerTank } from '../entities/PlayerTank.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { PowerUp } from '../entities/PowerUp.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { StorageManager } from '../data/StorageManager.js';
import { levels } from '../map/levels.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.eventBus = new EventBus();
        this.input = new InputManager(canvas);
        this.audio = new AudioManager();
        this.storage = new StorageManager();
        this.ui = new UIManager(this);
        this.collision = new CollisionSystem(this);
        
        this.gameState = GAME_STATES.MENU;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = PLAYER_LIVES;
        
        this.map = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        this.enemiesRemaining = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 3000;
        
        this.lastTime = 0;
        this.isPaused = false;
        
        this.freezeTimer = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.eventBus.on('enemyDestroyed', (data) => {
            this.score += data.points || 100;
            this.enemiesRemaining--;
            if (Math.random() < 0.2) {
                this.spawnPowerUp(data.x, data.y);
            }
        });
        
        this.eventBus.on('playerDestroyed', () => {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver(false);
            } else {
                this.respawnPlayer();
            }
        });
        
        this.eventBus.on('baseDestroyed', () => {
            this.gameOver(false);
        });
        
        this.eventBus.on('powerUpCollected', (data) => {
            this.audio.play('powerup');
        });
    }
    
    init() {
        this.ui.showMenu();
    }
    
    startGame(loadSave = false) {
        if (loadSave && this.storage.hasSaveData()) {
            const save = this.storage.loadGame();
            this.currentLevel = save.currentLevel;
            this.score = save.score;
            this.lives = save.lives;
        } else {
            this.currentLevel = 1;
            this.score = 0;
            this.lives = PLAYER_LIVES;
        }
        
        this.loadLevel(this.currentLevel);
        this.gameState = GAME_STATES.PLAYING;
        this.ui.hideMenu();
        this.audio.playMusic();
        this.start();
    }
    
    loadLevel(levelNum) {
        const levelData = levels[levelNum - 1];
        if (!levelData) {
            this.gameOver(true);
            return;
        }
        
        this.map = new Map(this);
        this.map.loadFromData(levelData);
        
        const spawn = levelData.playerSpawn;
        this.player = new PlayerTank(
            this,
            spawn.x * 26,
            spawn.y * 26
        );
        
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        this.enemiesRemaining = levelData.enemies.reduce((sum, e) => sum + e.count, 0);
        this.enemyQueue = [];
        levelData.enemies.forEach(e => {
            for (let i = 0; i < e.count; i++) {
                this.enemyQueue.push(e.type);
            }
        });
        this.enemyQueue = this.shuffleArray(this.enemyQueue);
        
        this.enemySpawnTimer = 0;
        this.freezeTimer = 0;
        
        this.ui.showLevelIndicator(levelNum);
    }
    
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.handleInput();
        
        if (this.gameState === GAME_STATES.PLAYING && !this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    handleInput() {
        if (this.input.isPausePressed()) {
            if (this.gameState === GAME_STATES.PLAYING) {
                this.pause();
            } else if (this.gameState === GAME_STATES.PAUSED) {
                this.resume();
            }
        }
        
        this.input.update();
    }
    
    update(deltaTime) {
        if (this.freezeTimer > 0) {
            this.freezeTimer -= deltaTime;
        }
        
        if (this.player && this.player.isAlive) {
            this.player.update(deltaTime);
        }
        
        if (this.freezeTimer <= 0) {
            this.enemies.forEach(enemy => {
                if (enemy.isAlive) {
                    enemy.update(deltaTime);
                }
            });
        }
        
        this.bullets.forEach(bullet => {
            if (bullet.isActive) {
                bullet.update(deltaTime);
            }
        });
        
        this.powerUps.forEach(powerUp => {
            powerUp.update(deltaTime);
        });
        
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });
        
        this.collision.update();
        
        this.cleanup();
        
        this.updateEnemySpawn(deltaTime);
        
        this.checkWinCondition();
    }
    
    updateEnemySpawn(deltaTime) {
        if (this.enemyQueue.length === 0) return;
        if (this.enemies.filter(e => e.isAlive).length >= MAX_ACTIVE_ENEMIES) return;
        
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnDelay) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        if (this.enemyQueue.length === 0) return;
        
        const type = this.enemyQueue.shift();
        const spawnPoints = this.map.getEnemySpawnPoints();
        const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        const enemy = new EnemyTank(this, spawn.x * 26, spawn.y * 26, type);
        this.enemies.push(enemy);
    }
    
    spawnPowerUp(x, y) {
        const powerUp = new PowerUp(this, x, y);
        this.powerUps.push(powerUp);
    }
    
    cleanup() {
        this.bullets = this.bullets.filter(b => b.isActive);
        this.enemies = this.enemies.filter(e => e.isAlive);
        this.powerUps = this.powerUps.filter(p => p.isAlive);
        this.explosions = this.explosions.filter(e => e.isAlive);
    }
    
    checkWinCondition() {
        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.currentLevel++;
        this.storage.saveGame({
            currentLevel: this.currentLevel,
            score: this.score,
            lives: this.lives
        });
        
        if (this.currentLevel > levels.length) {
            this.gameOver(true);
        } else {
            this.gameState = GAME_STATES.LEVEL_WIN;
            setTimeout(() => {
                this.loadLevel(this.currentLevel);
                this.gameState = GAME_STATES.PLAYING;
            }, 2000);
        }
    }
    
    respawnPlayer() {
        const levelData = levels[this.currentLevel - 1];
        const spawn = levelData.playerSpawn;
        this.player.respawn(spawn.x * 26, spawn.y * 26);
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        if (this.gameState === GAME_STATES.MENU) {
            this.ui.renderMenu(this.ctx);
            return;
        }
        
        if (this.map) {
            this.map.renderBottom(this.ctx);
        }
        
        if (this.player && this.player.isAlive) {
            this.player.render(this.ctx);
        }
        
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.render(this.ctx);
            }
        });
        
        this.bullets.forEach(bullet => {
            if (bullet.isActive) {
                bullet.render(this.ctx);
            }
        });
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.isAlive) {
                powerUp.render(this.ctx);
            }
        });
        
        this.explosions.forEach(explosion => {
            if (explosion.isAlive) {
                explosion.render(this.ctx);
            }
        });
        
        if (this.map) {
            this.map.renderTop(this.ctx);
        }
        
        this.ui.renderHUD(this.ctx);
        
        if (this.gameState === GAME_STATES.PAUSED) {
            this.ui.renderPauseOverlay(this.ctx);
        }
        
        if (this.gameState === GAME_STATES.GAMEOVER || this.gameState === GAME_STATES.WIN) {
            this.ui.renderGameOver(this.ctx, this.gameState === GAME_STATES.WIN);
        }
    }
    
    pause() {
        this.gameState = GAME_STATES.PAUSED;
        this.isPaused = true;
        this.audio.pauseMusic();
    }
    
    resume() {
        this.gameState = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.audio.resumeMusic();
    }
    
    gameOver(win) {
        this.gameState = win ? GAME_STATES.WIN : GAME_STATES.GAMEOVER;
        this.audio.stopMusic();
        this.audio.play(win ? 'win' : 'gameover');
        
        this.storage.saveHighScore('Player', this.score);
        this.storage.deleteSave();
    }
    
    restart() {
        this.startGame(false);
    }
    
    returnToMenu() {
        this.gameState = GAME_STATES.MENU;
        this.audio.stopMusic();
        this.ui.showMenu();
    }
    
    addBullet(bullet) {
        this.bullets.push(bullet);
    }
    
    addExplosion(explosion) {
        this.explosions.push(explosion);
    }
    
    freezeEnemies(duration) {
        this.freezeTimer = duration;
    }
    
    destroyAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.destroy();
            this.score += 100;
        });
        this.enemies = [];
    }
}