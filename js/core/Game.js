import { Constants } from '../utils/Constants.js';
import { InputHandler } from './InputHandler.js';
import { Renderer } from './Renderer.js';
import { CollisionDetector } from './CollisionDetector.js';
import { GameMap } from '../map/Map.js';
import { PlayerTank } from '../entities/PlayerTank.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { Bullet } from '../entities/Bullet.js';
import { Base } from '../entities/Base.js';
import { LevelManager } from '../levels/LevelManager.js';
import { AIController } from '../ai/AIController.js';

// 游戏主控制器
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.inputHandler = new InputHandler();
        this.levelManager = new LevelManager();
        this.aiController = new AIController();
        
        this.map = new GameMap();
        this.playerTank = null;
        this.enemyTanks = [];
        this.bullets = [];
        this.base = null;
        this.explosions = [];
        
        this.gameState = Constants.GAME_STATE.MENU;
        this.score = 0;
        this.enemiesKilled = 0;
        this.lastFrameTime = 0;
        this.pauseKeyReleased = true;
        
        this.setupUI();
    }
    
    setupUI() {
        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 继续按钮
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resume();
        });
        
        // 重新开始按钮（暂停菜单）
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 重试按钮（游戏结束）
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    startGame() {
        this.gameState = Constants.GAME_STATE.PLAYING;
        this.score = 0;
        this.enemiesKilled = 0;
        this.enemyTanks = [];
        this.bullets = [];
        this.explosions = [];
        
        // 加载第一关
        this.levelManager.loadLevel(0);
        this.loadCurrentLevel();
        
        this.hideAllMenus();
        this.updateHUD();
        
        // 开始游戏循环
        this.lastFrameTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    loadCurrentLevel() {
        const level = this.levelManager.getCurrentLevel();
        if (!level) return;
        
        // 加载地图
        this.map.loadLevel(level);
        
        // 创建玩家坦克
        const playerSpawn = this.levelManager.getPlayerSpawnPoint();
        this.playerTank = new PlayerTank(playerSpawn.x, playerSpawn.y);
        
        // 创建基地
        const basePos = this.levelManager.getBasePosition();
        this.base = new Base(basePos.x, basePos.y);
        
        // 清空敌人和子弹
        this.enemyTanks = [];
        this.bullets = [];
        this.explosions = [];
        this.enemiesKilled = 0;
    }
    
    gameLoop(timestamp) {
        if (this.gameState !== Constants.GAME_STATE.PLAYING) {
            // 暂停时继续渲染但不更新
            if (this.gameState === Constants.GAME_STATE.PAUSED) {
                this.renderer.render(this);
                requestAnimationFrame((ts) => this.gameLoop(ts));
            }
            return;
        }
        
        const deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;
        
        this.update(deltaTime);
        this.renderer.render(this);
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    update(deltaTime) {
        const currentTime = performance.now();
        
        // 检查暂停键
        this.checkPause();
        
        // 更新玩家
        if (this.playerTank && this.playerTank.isAlive) {
            const bulletData = this.playerTank.update(
                deltaTime, 
                this.inputHandler, 
                this.map, 
                currentTime
            );
            if (bulletData) {
                this.bullets.push(new Bullet(
                    bulletData.x, 
                    bulletData.y, 
                    bulletData.direction, 
                    bulletData.speed, 
                    bulletData.owner
                ));
            }
        }
        
        // 生成敌人
        this.spawnEnemies(deltaTime);
        
        // 更新敌人
        for (const enemy of this.enemyTanks) {
            if (enemy.isAlive) {
                const bulletData = enemy.update(
                    deltaTime, 
                    this.aiController, 
                    this.map, 
                    this.playerTank, 
                    this.base, 
                    currentTime
                );
                if (bulletData) {
                    this.bullets.push(new Bullet(
                        bulletData.x, 
                        bulletData.y, 
                        bulletData.direction, 
                        bulletData.speed, 
                        bulletData.owner
                    ));
                }
            }
        }
        
        // 更新子弹
        for (const bullet of this.bullets) {
            bullet.update(deltaTime);
        }
        
        // 碰撞检测
        const collisionResults = CollisionDetector.checkBulletCollisions(
            this.bullets,
            this.playerTank,
            this.enemyTanks,
            this.map,
            this.base
        );
        
        // 处理碰撞结果
        this.handleCollisionResults(collisionResults);
        
        // 清理死亡对象
        this.cleanup();
        
        // 清理过期爆炸
        this.cleanupExplosions();
        
        // 更新HUD
        this.updateHUD();
        
        // 检查游戏状态
        this.checkGameState();
    }
    
    spawnEnemies(deltaTime) {
        const aliveEnemies = this.enemyTanks.filter(e => e.isAlive).length;
        
        if (this.levelManager.shouldSpawnEnemy(aliveEnemies, deltaTime)) {
            const spawnPoint = this.levelManager.getNextSpawnPoint();
            const enemyType = this.levelManager.getNextEnemyType();
            
            // 检查出生点是否被占用
            const canSpawn = !this.enemyTanks.some(e => 
                e.isAlive && 
                Math.abs(e.x - spawnPoint.x) < Constants.TANK_SIZE &&
                Math.abs(e.y - spawnPoint.y) < Constants.TANK_SIZE
            );
            
            if (canSpawn) {
                const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, enemyType);
                this.enemyTanks.push(enemy);
                this.levelManager.onEnemySpawned();
            }
        }
    }
    
    handleCollisionResults(results) {
        // 添加爆炸效果
        this.explosions.push(...results.explosions);
        
        // 处理被消灭的敌人
        for (const enemy of results.destroyedEnemies) {
            this.aiController.cleanup(enemy);
            this.enemiesKilled++;
            this.score += 100;
        }
        
        // 检查基地被摧毁
        if (results.baseHit && this.base.isDestroyed) {
            this.gameOver(false);
        }
        
        // 检查玩家死亡
        if (results.playerHit && !this.playerTank.isAlive) {
            this.gameOver(false);
        }
    }
    
    cleanup() {
        // 清理死亡的子弹
        this.bullets = this.bullets.filter(b => b.isActive);
        
        // 清理死亡的敌人（保留用于计数）
        // this.enemyTanks = this.enemyTanks.filter(e => e.isAlive);
    }
    
    cleanupExplosions() {
        const now = Date.now();
        this.explosions = this.explosions.filter(e => now - e.time < 300);
    }
    
    checkPause() {
        if (this.inputHandler.isPausePressed()) {
            if (this.pauseKeyReleased) {
                this.pauseKeyReleased = false;
                this.pause();
            }
        } else {
            this.pauseKeyReleased = true;
        }
    }
    
    checkGameState() {
        // 检查玩家是否死亡
        if (!this.playerTank || (!this.playerTank.isAlive && this.playerTank.lives <= 0)) {
            this.gameOver(false);
            return;
        }
        
        // 检查基地是否被摧毁
        if (this.base && this.base.isDestroyed) {
            this.gameOver(false);
            return;
        }
        
        // 检查是否过关
        if (this.levelManager.isLevelComplete(this.enemiesKilled)) {
            if (this.levelManager.hasNextLevel()) {
                this.nextLevel();
            } else {
                this.gameOver(true);
            }
        }
    }
    
    nextLevel() {
        this.levelManager.nextLevel();
        
        // 保留玩家状态
        const lives = this.playerTank.lives;
        
        this.loadCurrentLevel();
        
        // 恢复玩家生命
        this.playerTank.lives = lives;
        
        this.updateHUD();
    }
    
    pause() {
        if (this.gameState === Constants.GAME_STATE.PLAYING) {
            this.gameState = Constants.GAME_STATE.PAUSED;
            document.getElementById('pause-menu').classList.remove('hidden');
        }
    }
    
    resume() {
        if (this.gameState === Constants.GAME_STATE.PAUSED) {
            this.gameState = Constants.GAME_STATE.PLAYING;
            document.getElementById('pause-menu').classList.add('hidden');
            this.lastFrameTime = performance.now();
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }
    
    gameOver(isWin) {
        this.gameState = Constants.GAME_STATE.GAME_OVER;
        
        const gameOverDiv = document.getElementById('game-over');
        const titleEl = document.getElementById('game-over-title');
        
        titleEl.textContent = isWin ? '恭喜通关!' : '游戏结束';
        document.getElementById('final-score').textContent = this.score;
        
        gameOverDiv.classList.remove('hidden');
    }
    
    hideAllMenus() {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
    }
    
    updateHUD() {
        const level = this.levelManager.currentLevelIndex + 1;
        const lives = this.playerTank ? this.playerTank.lives : 0;
        const enemiesRemaining = this.levelManager.getTotalEnemies() - this.enemiesKilled;
        
        document.getElementById('level-display').textContent = level;
        document.getElementById('lives-display').textContent = lives;
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('enemies-display').textContent = Math.max(0, enemiesRemaining);
    }
}
