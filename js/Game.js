// 游戏管理器
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.inputHandler = new InputHandler(canvas);
        this.collisionDetector = new CollisionDetector();
        this.aiController = new AIController();
        
        this.map = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.base = null;
        
        this.state = CONFIG.GAME_STATE.MENU;
        this.lastTime = 0;
        this.escPressed = false;
        
        this.init();
    }
    
    // 初始化游戏
    init() {
        this.map = new Map();
        this.base = new Base();
        this.spawnPlayer();
        this.spawnEnemies();
        this.bullets = [];
    }
    
    // 生成玩家坦克
    spawnPlayer() {
        const startX = gridToPixel(12);
        const startY = gridToPixel(24);
        this.player = new PlayerTank(startX, startY);
    }
    
    // 生成敌方坦克
    spawnEnemies() {
        this.enemies = [];
        for (let i = 0; i < CONFIG.INITIAL_ENEMY_COUNT; i++) {
            const spawnPos = CONFIG.ENEMY_SPAWN_POSITIONS[i % CONFIG.ENEMY_SPAWN_POSITIONS.length];
            const x = gridToPixel(spawnPos.x);
            const y = gridToPixel(spawnPos.y);
            this.enemies.push(new EnemyTank(x, y));
        }
    }
    
    // 开始游戏
    start() {
        this.state = CONFIG.GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    // 暂停/继续
    togglePause() {
        if (this.state === CONFIG.GAME_STATE.PLAYING) {
            this.state = CONFIG.GAME_STATE.PAUSED;
        } else if (this.state === CONFIG.GAME_STATE.PAUSED) {
            this.state = CONFIG.GAME_STATE.PLAYING;
        }
    }
    
    // 重启游戏
    restart() {
        this.init();
        this.state = CONFIG.GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.updateUI();
    }
    
    // 游戏主循环
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 检查ESC键切换暂停
        if (this.inputHandler.isEscPressed()) {
            if (!this.escPressed) {
                this.escPressed = true;
                if (this.state === CONFIG.GAME_STATE.PLAYING || 
                    this.state === CONFIG.GAME_STATE.PAUSED) {
                    this.togglePause();
                }
            }
        } else {
            this.escPressed = false;
        }
        
        // 更新和渲染
        if (this.state === CONFIG.GAME_STATE.PLAYING) {
            this.update(deltaTime);
        }
        this.render();
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        // 更新玩家
        if (this.player.alive) {
            this.player.update(deltaTime, this.inputHandler, this.map);
            
            // 玩家射击
            if (this.inputHandler.isShootRequested()) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
        }
        
        // 更新敌方坦克AI
        this.aiController.update(this.enemies, this.map, this.bullets);
        
        // 更新子弹
        for (let bullet of this.bullets) {
            bullet.update();
        }
        
        // 碰撞检测
        this.handleCollisions();
        
        // 清理无效对象
        this.cleanup();
        
        // 检查游戏结束条件
        this.checkGameOver();
        
        // 更新UI
        this.updateUI();
    }
    
    // 处理碰撞
    handleCollisions() {
        // 子弹与坦克碰撞
        const allTanks = [this.player, ...this.enemies];
        const bulletTankCollisions = this.collisionDetector.checkBulletTankCollisions(this.bullets, allTanks);
        
        for (let collision of bulletTankCollisions) {
            collision.bullet.destroy();
            collision.tank.takeDamage(1);
        }
        
        // 子弹与地图碰撞
        this.collisionDetector.checkBulletMapCollisions(this.bullets, this.map);
        
        // 子弹与基地碰撞
        const bulletBaseCollisions = this.collisionDetector.checkBulletBaseCollisions(this.bullets, this.base);
        
        for (let bullet of bulletBaseCollisions) {
            // 只有敌方子弹能摧毁基地
            if (bullet.owner instanceof EnemyTank) {
                bullet.destroy();
                this.base.destroy();
            }
        }
    }
    
    // 清理无效对象
    cleanup() {
        // 清理子弹
        this.bullets = this.bullets.filter(bullet => bullet.active);
        
        // 限制子弹数量
        if (this.bullets.length > CONFIG.MAX_BULLETS) {
            this.bullets = this.bullets.slice(-CONFIG.MAX_BULLETS);
        }
        
        // 清理敌方坦克
        this.enemies = this.enemies.filter(enemy => enemy.alive);
    }
    
    // 检查游戏结束
    checkGameOver() {
        // 基地被摧毁
        if (this.base.destroyed) {
            this.state = CONFIG.GAME_STATE.GAME_OVER;
            this.showRestartButton();
            return;
        }
        
        // 玩家坦克被摧毁
        if (!this.player.alive) {
            this.state = CONFIG.GAME_STATE.GAME_OVER;
            this.showRestartButton();
            return;
        }
        
        // 所有敌方坦克被消灭
        if (this.enemies.length === 0) {
            this.state = CONFIG.GAME_STATE.VICTORY;
            this.showRestartButton();
            return;
        }
    }
    
    // 渲染
    render() {
        this.renderer.clear();
        this.renderer.renderMap(this.map);
        this.renderer.renderBase(this.base);
        
        // 渲染子弹
        for (let bullet of this.bullets) {
            if (bullet.active) {
                this.renderer.renderBullet(bullet);
            }
        }
        
        // 渲染坦克
        if (this.player.alive) {
            this.renderer.renderTank(this.player);
        }
        
        for (let enemy of this.enemies) {
            if (enemy.alive) {
                this.renderer.renderTank(enemy);
            }
        }
        
        // 渲染游戏状态
        if (this.state === CONFIG.GAME_STATE.PAUSED) {
            this.renderer.renderPaused();
        } else if (this.state === CONFIG.GAME_STATE.GAME_OVER) {
            this.renderer.renderGameOver('游戏失败！');
        } else if (this.state === CONFIG.GAME_STATE.VICTORY) {
            this.renderer.renderGameOver('恭喜胜利！');
        }
    }
    
    // 更新UI
    updateUI() {
        const healthEl = document.getElementById('playerHealth');
        const enemyCountEl = document.getElementById('enemyCount');
        
        if (healthEl) {
            healthEl.textContent = this.player.health;
        }
        
        if (enemyCountEl) {
            enemyCountEl.textContent = this.enemies.length;
        }
    }
    
    // 显示重新开始按钮
    showRestartButton() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (startBtn) startBtn.style.display = 'none';
        if (restartBtn) restartBtn.style.display = 'inline-block';
    }
}
