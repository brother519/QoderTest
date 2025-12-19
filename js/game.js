import { CONFIG } from './config.js';
import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { EntityManager } from './managers/entityManager.js';
import { LevelManager } from './managers/levelManager.js';
import { CollisionSystem } from './systems/collision.js';
import { AISystem } from './systems/ai.js';
import { PlayerTank } from './entities/playerTank.js';
import { EnemyTank } from './entities/enemyTank.js';
import { Bullet } from './entities/bullet.js';
import { HUD } from './ui/hud.js';
import { Menu } from './ui/menu.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.inputManager = new InputManager();
        this.entityManager = new EntityManager();
        this.levelManager = new LevelManager();
        this.collisionSystem = new CollisionSystem();
        this.aiSystem = null;
        this.hud = new HUD();
        this.menu = new Menu();
        
        this.state = CONFIG.GAME_STATE.MENU;
        this.lastTime = 0;
        this.accumulator = 0;
        this.running = false;
        
        this.player = null;
        this.base = null;
        this.obstacles = [];
        this.enemies = [];
        this.enemySpawns = [];
        
        this.remainingEnemies = [];
        this.lastSpawnTime = 0;
        this.pausePressed = false;
    }

    async init() {
        await this.levelManager.loadLevels();
    }

    start() {
        this.running = true;
        this.state = CONFIG.GAME_STATE.PLAYING;
        this.loadLevel();
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    loadLevel() {
        this.entityManager.clear();
        this.enemies = [];
        
        const level = this.levelManager.getCurrentLevel();
        const { obstacles, base, playerSpawn, enemySpawns } = this.levelManager.parseMap(level.map);
        
        this.obstacles = obstacles;
        this.base = base;
        this.enemySpawns = enemySpawns;
        
        obstacles.forEach(obs => this.entityManager.addEntity(obs));
        if (this.base) {
            this.entityManager.addEntity(this.base);
        }
        
        if (playerSpawn) {
            this.player = new PlayerTank(playerSpawn.x, playerSpawn.y);
            this.entityManager.addEntity(this.player);
        }
        
        this.aiSystem = new AISystem(this.collisionSystem, this.obstacles, this.base, this.player);
        
        this.remainingEnemies = [];
        level.enemies.forEach(enemyConfig => {
            for (let i = 0; i < enemyConfig.count; i++) {
                this.remainingEnemies.push(enemyConfig.type);
            }
        });
        
        this.lastSpawnTime = Date.now();
    }

    gameLoop() {
        if (!this.running) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.accumulator += deltaTime;

        while (this.accumulator >= CONFIG.FIXED_TIME_STEP) {
            this.update(CONFIG.FIXED_TIME_STEP);
            this.accumulator -= CONFIG.FIXED_TIME_STEP;
        }

        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(dt) {
        if (this.state !== CONFIG.GAME_STATE.PLAYING) return;
        
        if (this.inputManager.isPausePressed()) {
            if (!this.pausePressed) {
                this.pausePressed = true;
                this.state = CONFIG.GAME_STATE.PAUSED;
            }
        } else {
            this.pausePressed = false;
        }
        
        if (this.player && this.player.alive) {
            const oldX = this.player.x;
            const oldY = this.player.y;
            
            this.player.handleInput(this.inputManager);
            
            for (const obstacle of this.obstacles) {
                this.collisionSystem.checkTankVsObstacle(this.player, oldX, oldY, obstacle);
            }
            
            if (this.inputManager.isShootPressed()) {
                const bulletData = this.player.shoot();
                if (bulletData) {
                    const bullet = new Bullet(
                        bulletData.x,
                        bulletData.y,
                        bulletData.dx,
                        bulletData.dy,
                        bulletData.owner
                    );
                    this.entityManager.addBullet(bullet);
                }
            }
        }
        
        const level = this.levelManager.getCurrentLevel();
        const activeEnemies = this.enemies.filter(e => e.alive);
        
        if (this.remainingEnemies.length > 0 && 
            activeEnemies.length < level.maxActiveEnemies &&
            Date.now() - this.lastSpawnTime >= level.spawnInterval) {
            
            this.spawnEnemy();
            this.lastSpawnTime = Date.now();
        }
        
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            const oldX = enemy.x;
            const oldY = enemy.y;
            
            enemy.update(dt);
            
            for (const obstacle of this.obstacles) {
                this.collisionSystem.checkTankVsObstacle(enemy, oldX, oldY, obstacle);
            }
            
            if (this.player && this.player.alive) {
                if (this.collisionSystem.checkTankVsTank(enemy, this.player)) {
                    enemy.x = oldX;
                    enemy.y = oldY;
                }
            }
            
            const bulletData = this.aiSystem.updateEnemy(enemy);
            if (bulletData) {
                const bullet = new Bullet(
                    bulletData.x,
                    bulletData.y,
                    bulletData.dx,
                    bulletData.dy,
                    bulletData.owner
                );
                this.entityManager.addBullet(bullet);
            }
        }
        
        for (const bullet of this.entityManager.bullets) {
            if (!bullet.alive) continue;
            
            for (const obstacle of this.obstacles) {
                if (this.collisionSystem.checkBulletVsObstacle(bullet, obstacle)) {
                    break;
                }
            }
            
            if (this.player && this.player.alive) {
                this.collisionSystem.checkBulletVsTank(bullet, this.player);
            }
            
            for (const enemy of this.enemies) {
                if (enemy.alive && this.collisionSystem.checkBulletVsTank(bullet, enemy)) {
                    if (!enemy.alive && this.player && this.player.alive) {
                        this.player.addScore(100);
                    }
                    break;
                }
            }
            
            if (this.base && this.base.alive) {
                this.collisionSystem.checkBulletVsBase(bullet, this.base);
            }
        }
        
        this.entityManager.update(dt);
        
        if (!this.base || !this.base.alive) {
            this.state = CONFIG.GAME_STATE.LOSE;
        } else if (!this.player || !this.player.alive) {
            this.state = CONFIG.GAME_STATE.LOSE;
        } else if (this.remainingEnemies.length === 0 && activeEnemies.length === 0) {
            this.state = CONFIG.GAME_STATE.WIN;
        }
    }
    
    spawnEnemy() {
        if (this.remainingEnemies.length === 0 || this.enemySpawns.length === 0) return;
        
        const type = this.remainingEnemies.shift();
        const spawnIndex = Math.floor(Math.random() * this.enemySpawns.length);
        const spawn = this.enemySpawns[spawnIndex];
        
        const enemy = new EnemyTank(spawn.x, spawn.y, type);
        this.enemies.push(enemy);
        this.entityManager.addEntity(enemy);
    }

    render() {
        this.renderer.clear();
        
        if (this.state === CONFIG.GAME_STATE.MENU) {
            this.menu.renderMenu(this.renderer);
        } else if (this.state === CONFIG.GAME_STATE.PLAYING) {
            this.entityManager.render(this.renderer);
            
            const activeEnemies = this.enemies.filter(e => e.alive);
            const totalRemaining = this.remainingEnemies.length + activeEnemies.length;
            this.hud.render(
                this.renderer,
                this.player,
                this.levelManager.currentLevel,
                totalRemaining
            );
        } else if (this.state === CONFIG.GAME_STATE.PAUSED) {
            this.entityManager.render(this.renderer);
            this.menu.renderPause(this.renderer);
        } else if (this.state === CONFIG.GAME_STATE.WIN || this.state === CONFIG.GAME_STATE.LOSE) {
            this.entityManager.render(this.renderer);
            const win = this.state === CONFIG.GAME_STATE.WIN;
            const score = this.player ? this.player.score : 0;
            this.menu.renderGameOver(this.renderer, win, score);
        }
    }

    setState(newState) {
        this.state = newState;
    }

    stop() {
        this.running = false;
    }
}