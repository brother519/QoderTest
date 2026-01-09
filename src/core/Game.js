// 游戏主控制器
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.inputManager = new InputManager();
        this.stateManager = new GameStateManager();
        this.scoreManager = new ScoreManager();
        this.spawnManager = new SpawnManager();
        this.hud = new HUD();
        this.menuScreen = new MenuScreen();
        
        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.base = null;
        this.map = null;
        this.collisionDetector = null;
        
        // 时间管理
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDeltaTime = 1000 / 60; // 60 FPS
        
        // 爆炸效果
        this.explosions = [];
        
        this.init();
    }
    
    /**
     * 初始化游戏
     */
    init() {
        // 显示菜单
        this.stateManager.setState(Constants.GAME_STATE.MENU);
    }
    
    /**
     * 开始新游戏
     */
    startNewGame() {
        // 重置管理器
        this.scoreManager.reset();
        this.spawnManager.reset();
        this.stateManager.startGame();
        
        // 加载关卡
        this.loadLevel(this.stateManager.currentLevel);
    }
    
    /**
     * 加载关卡
     */
    loadLevel(level) {
        // 加载地图
        const mapData = MapData.getLevel(level);
        const mapWithBase = MapData.addBaseProtection(mapData);
        this.map = new Map(mapWithBase);
        this.collisionDetector = new CollisionDetector(this.map);
        
        // 创建玩家
        this.player = new PlayerTank(Constants.PLAYER_SPAWN.x, Constants.PLAYER_SPAWN.y);
        
        // 创建基地
        this.base = new Base(Constants.BASE_POSITION.x, Constants.BASE_POSITION.y);
        
        // 清空对象
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        
        // 重置生成管理器
        this.spawnManager.reset();
    }
    
    /**
     * 游戏主循环
     */
    gameLoop(currentTime) {
        requestAnimationFrame((time) => this.gameLoop(time));
        
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 固定时间步长更新
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.fixedDeltaTime) {
            this.update(this.fixedDeltaTime);
            this.accumulator -= this.fixedDeltaTime;
        }
        
        this.render();
    }
    
    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        // 更新菜单界面闪烁
        this.menuScreen.update(deltaTime);
        
        // 处理暂停
        if (this.inputManager.isPausePressed()) {
            if (this.stateManager.getState() === Constants.GAME_STATE.MENU) {
                this.startNewGame();
            } else if (this.stateManager.getState() === Constants.GAME_STATE.PLAYING) {
                this.stateManager.togglePause();
            } else if (this.stateManager.getState() === Constants.GAME_STATE.PAUSED) {
                this.stateManager.togglePause();
            } else if (this.stateManager.getState() === Constants.GAME_STATE.GAME_OVER) {
                this.startNewGame();
            } else if (this.stateManager.getState() === Constants.GAME_STATE.VICTORY) {
                this.stateManager.nextLevel();
                this.loadLevel(this.stateManager.currentLevel);
            }
        }
        
        // 只在游戏进行时更新
        if (this.stateManager.getState() !== Constants.GAME_STATE.PLAYING) {
            return;
        }
        
        // 尝试生成敌人
        const newEnemy = this.spawnManager.trySpawn();
        if (newEnemy) {
            this.enemies.push(newEnemy);
        }
        
        // 更新玩家
        if (this.player.active) {
            const allTanks = [this.player, ...this.enemies];
            const playerBullet = this.player.update(deltaTime, this.inputManager, this.collisionDetector, allTanks);
            if (playerBullet) {
                this.bullets.push(playerBullet);
            }
        }
        
        // 更新敌人
        for (let enemy of this.enemies) {
            if (enemy.active) {
                const allTanks = [this.player, ...this.enemies];
                const enemyBullet = enemy.update(deltaTime, this.collisionDetector, allTanks);
                if (enemyBullet) {
                    this.bullets.push(enemyBullet);
                }
            }
        }
        
        // 更新子弹
        for (let bullet of this.bullets) {
            bullet.update(deltaTime);
        }
        
        // 碰撞检测
        this.handleCollisions();
        
        // 清理死亡对象
        this.cleanup();
        
        // 检查胜利条件
        if (this.spawnManager.isAllEnemiesDefeated()) {
            this.stateManager.victory();
        }
        
        // 检查失败条件
        if (!this.base.active || (this.player.lives <= 0 && !this.player.active)) {
            this.stateManager.gameOver();
        }
    }
    
    /**
     * 处理碰撞
     */
    handleCollisions() {
        // 子弹碰撞检测
        for (let bullet of this.bullets) {
            if (!bullet.active) continue;
            
            // 检查子弹与地图碰撞
            const mapHit = this.collisionDetector.checkBulletMapCollision(bullet);
            if (mapHit) {
                bullet.destroy();
                if (mapHit.tile.isDestructible()) {
                    this.map.destroyTile(mapHit.col, mapHit.row);
                    this.createExplosion(mapHit.col * Constants.TILE_SIZE + 8, mapHit.row * Constants.TILE_SIZE + 8);
                }
                continue;
            }
            
            // 检查子弹与基地碰撞
            if (this.collisionDetector.checkBulletBaseCollision(bullet, this.base)) {
                bullet.destroy();
                this.base.hit();
                this.createExplosion(this.base.x + this.base.size / 2, this.base.y + this.base.size / 2);
                continue;
            }
            
            // 检查子弹与坦克碰撞
            const allTanks = [this.player, ...this.enemies];
            const hitTank = this.collisionDetector.checkBulletTankCollision(bullet, allTanks);
            if (hitTank) {
                bullet.destroy();
                const died = hitTank.takeDamage();
                
                if (died) {
                    this.createExplosion(hitTank.x + hitTank.size / 2, hitTank.y + hitTank.size / 2);
                    
                    // 如果是敌人被击毁
                    if (hitTank !== this.player) {
                        this.scoreManager.enemyKilled(hitTank.type);
                        this.spawnManager.removeDeadEnemy(hitTank);
                    } else {
                        // 玩家被击毁
                        const hasLives = this.player.die();
                        if (hasLives) {
                            // 延迟重生
                            setTimeout(() => {
                                if (this.stateManager.isPlaying()) {
                                    this.player.respawn();
                                }
                            }, 2000);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            size: 20,
            life: 300,
            startTime: Date.now()
        });
    }
    
    /**
     * 清理失效对象
     */
    cleanup() {
        // 清理子弹
        this.bullets = this.bullets.filter(b => b.active);
        
        // 清理敌人
        this.enemies = this.enemies.filter(e => e.active);
        
        // 清理爆炸效果
        const now = Date.now();
        this.explosions = this.explosions.filter(e => now - e.startTime < e.life);
    }
    
    /**
     * 渲染游戏
     */
    render() {
        this.renderer.clear();
        
        const state = this.stateManager.getState();
        
        // 菜单界面
        if (state === Constants.GAME_STATE.MENU) {
            this.menuScreen.renderMenu(this.renderer);
            return;
        }
        
        // 渲染游戏场景
        if (this.map) {
            this.map.render(this.renderer);
        }
        
        // 渲染基地
        if (this.base) {
            this.base.render(this.renderer);
        }
        
        // 渲染玩家
        if (this.player && this.player.active) {
            this.player.render(this.renderer);
        }
        
        // 渲染敌人
        for (let enemy of this.enemies) {
            if (enemy.active) {
                enemy.render(this.renderer);
            }
        }
        
        // 渲染子弹
        for (let bullet of this.bullets) {
            if (bullet.active) {
                bullet.render(this.renderer);
            }
        }
        
        // 渲染草地层（在坦克上方）
        if (this.map) {
            this.map.renderForest(this.renderer);
        }
        
        // 渲染爆炸效果
        for (let explosion of this.explosions) {
            this.renderer.drawExplosion(explosion.x, explosion.y, explosion.size);
        }
        
        // 渲染HUD
        if (this.player) {
            this.hud.render(this.renderer, this.player, this.spawnManager, this.scoreManager, this.stateManager.currentLevel);
        }
        
        // 渲染暂停界面
        if (state === Constants.GAME_STATE.PAUSED) {
            this.menuScreen.renderPause(this.renderer);
        }
        
        // 渲染游戏结束界面
        if (state === Constants.GAME_STATE.GAME_OVER) {
            this.menuScreen.renderGameOver(this.renderer, this.scoreManager.getScore(), this.scoreManager.getHighScore());
        }
        
        // 渲染胜利界面
        if (state === Constants.GAME_STATE.VICTORY) {
            this.menuScreen.renderVictory(this.renderer, this.scoreManager.getScore(), this.stateManager.currentLevel);
        }
    }
    
    /**
     * 启动游戏
     */
    start() {
        this.gameLoop(0);
    }
}
