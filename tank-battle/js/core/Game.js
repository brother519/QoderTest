import { GAME_CONFIG, GAME_STATE, KEY_CODES, PLAYER_CONFIG, ENEMY_SPAWN_POINTS, DIRECTION } from '../utils/Constants.js';
import { Renderer } from './Renderer.js';
import { CollisionDetector } from './CollisionDetector.js';
import { Map } from '../map/Map.js';
import { PlayerTank } from '../entities/PlayerTank.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { Base } from '../entities/Base.js';
import { LevelManager } from '../level/LevelManager.js';
import { UI } from '../ui/UI.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.collisionDetector = new CollisionDetector();
        this.levelManager = new LevelManager();
        this.ui = new UI();
        
        this.state = GAME_STATE.MENU;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.powerUps = [];
        this.map = null;
        this.base = null;
        
        this.score = 0;
        this.lives = PLAYER_CONFIG.INITIAL_LIVES;
        this.currentLevel = 1;
        
        this.keys = {};
        this.lastTime = 0;
        this.accumulator = 0;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000;
        this.maxEnemiesOnScreen = 4;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        
        this.levelTransitionTimer = 0;
        this.levelTransitionDuration = 2000;
        
        this.setupInput();
    }

    // 设置输入监听
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // 处理按键
    handleKeyPress(code) {
        if (KEY_CODES.START.includes(code)) {
            if (this.state === GAME_STATE.MENU) {
                this.startGame();
            } else if (this.state === GAME_STATE.GAME_OVER) {
                this.resetGame();
                this.startGame();
            } else if (this.state === GAME_STATE.VICTORY) {
                this.nextLevel();
            }
        }
        
        if (KEY_CODES.PAUSE.includes(code)) {
            if (this.state === GAME_STATE.PLAYING) {
                this.state = GAME_STATE.PAUSED;
            } else if (this.state === GAME_STATE.PAUSED) {
                this.state = GAME_STATE.PLAYING;
            }
        }
    }

    // 开始游戏
    startGame() {
        this.loadLevel(this.currentLevel);
        this.state = GAME_STATE.LEVEL_TRANSITION;
        this.levelTransitionTimer = this.levelTransitionDuration;
    }

    // 加载关卡
    loadLevel(levelNum) {
        const levelData = this.levelManager.getLevel(levelNum);
        
        // 创建地图
        this.map = new Map(levelData.mapData);
        
        // 创建基地
        this.base = new Base(
            levelData.basePosition.x * GAME_CONFIG.TILE_SIZE,
            levelData.basePosition.y * GAME_CONFIG.TILE_SIZE
        );
        
        // 创建玩家
        this.player = new PlayerTank(
            levelData.playerSpawnPosition.x * GAME_CONFIG.TILE_SIZE,
            levelData.playerSpawnPosition.y * GAME_CONFIG.TILE_SIZE
        );
        this.player.shielded = true;
        this.player.shieldTimer = 3000;
        
        // 重置敌人
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.powerUps = [];
        
        this.enemiesRemaining = levelData.totalEnemies;
        this.enemiesSpawned = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = levelData.spawnInterval || 3000;
        this.maxEnemiesOnScreen = levelData.maxOnScreen || 4;
        
        // 更新UI
        this.updateUI();
    }

    // 下一关
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > this.levelManager.totalLevels) {
            // 全部通关
            this.currentLevel = 1;
            this.score += 10000; // 奖励分
        }
        this.startGame();
    }

    // 重置游戏
    resetGame() {
        this.score = 0;
        this.lives = PLAYER_CONFIG.INITIAL_LIVES;
        this.currentLevel = 1;
    }

    // 生成敌人
    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemiesOnScreen) return;
        if (this.enemiesSpawned >= this.enemiesRemaining + this.enemies.length) return;
        
        const levelData = this.levelManager.getLevel(this.currentLevel);
        const spawnPoint = ENEMY_SPAWN_POINTS[this.enemiesSpawned % ENEMY_SPAWN_POINTS.length];
        
        // 检查生成点是否被占用
        const spawnX = spawnPoint.x * GAME_CONFIG.TILE_SIZE;
        const spawnY = spawnPoint.y * GAME_CONFIG.TILE_SIZE;
        
        for (const enemy of this.enemies) {
            if (this.collisionDetector.checkOverlap(
                { x: spawnX, y: spawnY, size: GAME_CONFIG.TILE_SIZE * 2 },
                enemy
            )) {
                return; // 生成点被占用，等待下次
            }
        }
        
        // 确定敌人类型
        const enemyType = levelData.getEnemyType(this.enemiesSpawned);
        
        const enemy = new EnemyTank(spawnX, spawnY, enemyType);
        enemy.shielded = true;
        enemy.shieldTimer = 1000;
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }

    // 更新游戏逻辑
    update(deltaTime) {
        if (this.state === GAME_STATE.LEVEL_TRANSITION) {
            this.levelTransitionTimer -= deltaTime;
            if (this.levelTransitionTimer <= 0) {
                this.state = GAME_STATE.PLAYING;
            }
            return;
        }
        
        if (this.state !== GAME_STATE.PLAYING) return;
        
        // 更新玩家
        if (this.player && !this.player.destroyed) {
            this.player.update(deltaTime, this.keys);
            
            // 玩家射击
            if (this.isKeyPressed(KEY_CODES.SHOOT)) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
            
            // 玩家与地图碰撞
            this.collisionDetector.handleTankMapCollision(this.player, this.map);
            
            // 玩家与敌人碰撞
            for (const enemy of this.enemies) {
                if (!enemy.destroyed) {
                    this.collisionDetector.handleTankTankCollision(this.player, enemy);
                }
            }
        }
        
        // 更新敌人
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        for (const enemy of this.enemies) {
            if (!enemy.destroyed) {
                enemy.update(deltaTime, this.player, this.map);
                
                // 敌人射击
                const bullet = enemy.tryShoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
                
                // 敌人与地图碰撞
                this.collisionDetector.handleTankMapCollision(enemy, this.map);
                
                // 敌人之间碰撞
                for (const otherEnemy of this.enemies) {
                    if (enemy !== otherEnemy && !otherEnemy.destroyed) {
                        this.collisionDetector.handleTankTankCollision(enemy, otherEnemy);
                    }
                }
            }
        }
        
        // 更新子弹
        for (const bullet of this.bullets) {
            if (!bullet.destroyed) {
                bullet.update(deltaTime);
                
                // 子弹边界检测
                if (bullet.x < 0 || bullet.x > GAME_CONFIG.CANVAS_WIDTH ||
                    bullet.y < 0 || bullet.y > GAME_CONFIG.CANVAS_HEIGHT) {
                    bullet.destroyed = true;
                    continue;
                }
                
                // 子弹与地图碰撞
                const hitTile = this.collisionDetector.checkBulletMapCollision(bullet, this.map);
                if (hitTile) {
                    bullet.destroyed = true;
                    this.addExplosion(bullet.x, bullet.y, 15);
                }
                
                // 子弹与坦克碰撞
                if (bullet.isPlayerBullet) {
                    // 玩家子弹打敌人
                    for (const enemy of this.enemies) {
                        if (!enemy.destroyed && !enemy.shielded &&
                            this.collisionDetector.checkOverlap(bullet, enemy)) {
                            bullet.destroyed = true;
                            enemy.takeDamage(bullet.damage);
                            this.addExplosion(bullet.x, bullet.y, 20);
                            
                            if (enemy.destroyed) {
                                this.score += enemy.score;
                                this.enemiesRemaining--;
                                this.addExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, 40);
                            }
                            break;
                        }
                    }
                } else {
                    // 敌人子弹打玩家
                    if (this.player && !this.player.destroyed && !this.player.shielded &&
                        this.collisionDetector.checkOverlap(bullet, this.player)) {
                        bullet.destroyed = true;
                        this.player.takeDamage(bullet.damage);
                        this.addExplosion(bullet.x, bullet.y, 20);
                        
                        if (this.player.destroyed) {
                            this.addExplosion(this.player.x + this.player.size / 2, 
                                            this.player.y + this.player.size / 2, 40);
                            this.lives--;
                            
                            if (this.lives > 0) {
                                this.respawnPlayer();
                            }
                        }
                    }
                    
                    // 敌人子弹打基地
                    if (this.base && !this.base.destroyed &&
                        this.collisionDetector.checkOverlap(bullet, this.base)) {
                        bullet.destroyed = true;
                        this.base.destroyed = true;
                        this.addExplosion(this.base.x + this.base.size / 2,
                                        this.base.y + this.base.size / 2, 50);
                    }
                }
            }
        }
        
        // 更新爆炸效果
        for (const explosion of this.explosions) {
            explosion.update(deltaTime);
        }
        
        // 清理已销毁的对象
        this.bullets = this.bullets.filter(b => !b.destroyed);
        this.enemies = this.enemies.filter(e => !e.destroyed);
        this.explosions = this.explosions.filter(e => !e.finished);
        
        // 检查游戏结束条件
        this.checkGameOver();
        
        // 更新UI
        this.updateUI();
    }

    // 添加爆炸效果
    addExplosion(x, y, size) {
        this.explosions.push({
            x: x,
            y: y,
            size: size,
            progress: 0,
            duration: 300,
            finished: false,
            update: function(dt) {
                this.progress += dt / this.duration;
                if (this.progress >= 1) {
                    this.finished = true;
                }
            }
        });
    }

    // 玩家重生
    respawnPlayer() {
        const levelData = this.levelManager.getLevel(this.currentLevel);
        this.player = new PlayerTank(
            levelData.playerSpawnPosition.x * GAME_CONFIG.TILE_SIZE,
            levelData.playerSpawnPosition.y * GAME_CONFIG.TILE_SIZE
        );
        this.player.shielded = true;
        this.player.shieldTimer = 3000;
    }

    // 检查游戏结束
    checkGameOver() {
        // 基地被摧毁或生命用尽
        if (this.base.destroyed || this.lives <= 0) {
            this.state = GAME_STATE.GAME_OVER;
            return;
        }
        
        // 所有敌人被消灭
        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
            this.state = GAME_STATE.VICTORY;
        }
    }

    // 检查按键是否按下
    isKeyPressed(keyCodes) {
        return keyCodes.some(code => this.keys[code]);
    }

    // 更新UI显示
    updateUI() {
        this.ui.update({
            level: this.currentLevel,
            lives: this.lives,
            score: this.score,
            enemies: this.enemiesRemaining
        });
    }

    // 渲染游戏
    render() {
        this.renderer.clear();
        
        switch (this.state) {
            case GAME_STATE.MENU:
                this.renderer.renderMenu();
                break;
                
            case GAME_STATE.LEVEL_TRANSITION:
                this.renderer.renderLevelTransition(this.currentLevel);
                break;
                
            case GAME_STATE.PLAYING:
            case GAME_STATE.PAUSED:
                // 渲染地图
                if (this.map) {
                    this.renderer.renderMap(this.map);
                }
                
                // 渲染基地
                if (this.base) {
                    this.renderer.renderBase(this.base);
                }
                
                // 渲染坦克
                if (this.player && !this.player.destroyed) {
                    this.renderer.renderTank(this.player);
                }
                
                for (const enemy of this.enemies) {
                    this.renderer.renderTank(enemy);
                }
                
                // 渲染子弹
                for (const bullet of this.bullets) {
                    this.renderer.renderBullet(bullet);
                }
                
                // 渲染草丛(在最上层)
                if (this.map) {
                    this.renderer.renderGrass(this.map);
                }
                
                // 渲染爆炸效果
                for (const explosion of this.explosions) {
                    this.renderer.renderExplosion(explosion);
                }
                
                // 渲染道具
                for (const powerUp of this.powerUps) {
                    this.renderer.renderPowerUp(powerUp);
                }
                
                // 暂停界面
                if (this.state === GAME_STATE.PAUSED) {
                    this.renderer.renderPaused();
                }
                break;
                
            case GAME_STATE.GAME_OVER:
                // 先渲染游戏场景
                if (this.map) this.renderer.renderMap(this.map);
                if (this.base) this.renderer.renderBase(this.base);
                for (const enemy of this.enemies) {
                    this.renderer.renderTank(enemy);
                }
                // 再渲染游戏结束界面
                this.renderer.renderGameOver(this.score);
                break;
                
            case GAME_STATE.VICTORY:
                if (this.map) this.renderer.renderMap(this.map);
                if (this.base) this.renderer.renderBase(this.base);
                if (this.player) this.renderer.renderTank(this.player);
                this.renderer.renderVictory(this.score, this.currentLevel);
                break;
        }
    }

    // 游戏主循环
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 固定时间步长更新
        this.accumulator += deltaTime;
        while (this.accumulator >= GAME_CONFIG.FIXED_TIME_STEP) {
            this.update(GAME_CONFIG.FIXED_TIME_STEP);
            this.accumulator -= GAME_CONFIG.FIXED_TIME_STEP;
        }
        
        // 渲染
        this.render();
        
        // 继续循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // 启动游戏
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
