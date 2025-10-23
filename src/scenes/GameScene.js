import { Scene } from './Scene.js';
import { CONFIG } from '../config.js';
import { Map } from '../game/Map.js';
import { Tank } from '../entities/Tank.js';
import { Base } from '../entities/Base.js';
import { PhysicsEngine } from '../core/PhysicsEngine.js';
import { EnemyManager } from '../game/EnemyManager.js';
import { PowerUpManager } from '../game/PowerUpManager.js';

/**
 * 游戏场景
 */
export class GameScene extends Scene {
    constructor(sceneManager) {
        super(sceneManager);
        
        // UI元素
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.setupUI();
        
        // 游戏数据
        this.playerCount = 1;
        this.level = 1;
        this.score = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        // 游戏对象
        this.map = null;
        this.players = [];
        this.base = null;
        this.bullets = [];
        this.explosions = [];
        
        // 管理器
        this.physicsEngine = new PhysicsEngine();
        this.enemyManager = null;
        this.powerUpManager = null;
        
        // 动画帧计数
        this.frameCount = 0;
    }
    
    /**
     * 设置UI
     */
    setupUI() {
        // 暂停按钮
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('btn-quit').addEventListener('click', () => {
            this.quitGame();
        });
        
        // 游戏结束按钮
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('btn-menu').addEventListener('click', () => {
            this.backToMenu();
        });
        
        // 静音按钮
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = this.engine.audioManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇' : '🔊';
                muteBtn.classList.toggle('muted', isMuted);
            });
        }
    }
    
    /**
     * 进入场景
     */
    enter(data) {
        this.playerCount = data.playerCount || 1;
        this.level = 1;
        this.score = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        // 显示玩家2信息
        const p2Info = document.getElementById('player2-info');
        p2Info.style.display = this.playerCount === 2 ? 'flex' : 'none';
        
        // 初始化关卡
        this.initLevel();
        
        // 隐藏所有屏幕
        this.pauseScreen.style.display = 'none';
        this.gameoverScreen.style.display = 'none';
        
        // 播放游戏开始音效
        this.engine.audioManager.playSound('gamestart');
    }
    
    /**
     * 退出场景
     */
    exit() {
        // 清理资源
        this.players = [];
        this.bullets = [];
        this.explosions = [];
    }
    
    /**
     * 初始化关卡
     */
    initLevel() {
        // 创建地图
        this.map = new Map(this.level);
        
        // 创建基地
        const basePos = CONFIG.SPAWN_POINTS.BASE_POSITION;
        this.base = new Base(
            basePos.x * CONFIG.TILE_SIZE,
            basePos.y * CONFIG.TILE_SIZE
        );
        
        // 创建玩家坦克
        this.players = [];
        const p1Pos = CONFIG.SPAWN_POINTS.PLAYER1;
        this.players.push(new Tank(
            p1Pos.x * CONFIG.TILE_SIZE,
            p1Pos.y * CONFIG.TILE_SIZE,
            CONFIG.TANK_TYPE.PLAYER1,
            true
        ));
        
        if (this.playerCount === 2) {
            const p2Pos = CONFIG.SPAWN_POINTS.PLAYER2;
            this.players.push(new Tank(
                p2Pos.x * CONFIG.TILE_SIZE,
                p2Pos.y * CONFIG.TILE_SIZE,
                CONFIG.TANK_TYPE.PLAYER2,
                true
            ));
        }
        
        // 创建敌人管理器
        this.enemyManager = new EnemyManager(this);
        
        // 创建道具管理器
        this.powerUpManager = new PowerUpManager(this);
        
        // 重置子弹和爆炸
        this.bullets = [];
        this.explosions = [];
        this.frameCount = 0;
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 更新场景
     */
    update(deltaTime) {
        // 检查暂停
        if (this.engine.inputController.isPausePressed()) {
            this.togglePause();
        }
        
        if (this.isPaused || this.isGameOver) {
            return;
        }
        
        this.frameCount++;
        
        // 更新玩家坦克
        this.updatePlayers();
        
        // 更新敌人
        this.enemyManager.update(deltaTime);
        
        // 更新子弹
        this.updateBullets();
        
        // 更新爆炸效果
        this.updateExplosions();
        
        // 更新道具
        this.powerUpManager.update(deltaTime);
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查游戏状态
        this.checkGameState();
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 更新玩家
     */
    updatePlayers() {
        this.players.forEach((player, index) => {
            if (!player.isAlive) return;
            
            // 获取输入
            const input = index === 0 
                ? this.engine.inputController.getPlayer1Input()
                : this.engine.inputController.getPlayer2Input();
            
            // 处理移动
            if (input.up) {
                player.move(CONFIG.DIRECTION.UP, this.map, this.getAllTanks());
            } else if (input.down) {
                player.move(CONFIG.DIRECTION.DOWN, this.map, this.getAllTanks());
            } else if (input.left) {
                player.move(CONFIG.DIRECTION.LEFT, this.map, this.getAllTanks());
            } else if (input.right) {
                player.move(CONFIG.DIRECTION.RIGHT, this.map, this.getAllTanks());
            }
            
            // 处理射击
            if (input.shoot) {
                const bullet = player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                    // 播放射击音效
                    this.engine.audioManager.playSound('shoot', 0.3);
                }
            }
            
            player.update();
        });
    }
    
    /**
     * 更新子弹
     */
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            
            // 检查是否出界
            if (bullet.x < 0 || bullet.x > CONFIG.CANVAS_WIDTH ||
                bullet.y < 0 || bullet.y > CONFIG.CANVAS_HEIGHT) {
                bullet.destroy();
                return false;
            }
            
            if (!bullet.isActive) {
                bullet.destroy();
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * 更新爆炸效果
     */
    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.frame++;
            return explosion.frame < 15; // 15帧后消失
        });
    }
    
    /**
     * 检查碰撞
     */
    checkCollisions() {
        // 子弹与地图碰撞
        this.bullets.forEach(bullet => {
            if (!bullet.isActive) return;
            
            if (this.map.checkBulletCollision(bullet)) {
                bullet.destroy();
                this.createExplosion(bullet.x, bullet.y, CONFIG.BULLET.SIZE);
                // 播放击中音效
                this.engine.audioManager.playSound('hit', 0.2);
            }
        });
        
        // 子弹与坦克碰撞
        this.bullets.forEach(bullet => {
            if (!bullet.isActive) return;
            
            const allTanks = this.getAllTanks();
            allTanks.forEach(tank => {
                if (!tank.isAlive || tank === bullet.owner) return;
                
                if (this.physicsEngine.checkCollision(bullet, tank)) {
                    bullet.destroy();
                    tank.takeDamage();
                    this.createExplosion(tank.x, tank.y, CONFIG.TANK.SIZE);
                    // 播放爆炸音效
                    this.engine.audioManager.playSound('explosion', 0.4);
                    
                    // 如果是玩家击杀敌人，加分
                    if (bullet.owner.isPlayer && !tank.isPlayer) {
                        this.addScore(CONFIG.SCORE.BASIC_TANK);
                        // 有概率掉落道具
                        if (Math.random() < CONFIG.POWERUP.SPAWN_CHANCE) {
                            this.powerUpManager.spawn(tank.x, tank.y);
                        }
                    }
                }
            });
        });
        
        // 子弹与基地碰撞
        this.bullets.forEach(bullet => {
            if (!bullet.isActive) return;
            
            if (this.physicsEngine.checkCollision(bullet, this.base) && !this.base.isDestroyed) {
                bullet.destroy();
                if (!this.base.hasShield) {
                    this.base.destroy();
                    this.createExplosion(this.base.x, this.base.y, CONFIG.TILE_SIZE * 2);
                    // 播放基地摧毁音效
                    this.engine.audioManager.playSound('baseDestroy', 0.8);
                    this.gameOver(false);
                }
            }
        });
        
        // 子弹间碰撞
        for (let i = 0; i < this.bullets.length; i++) {
            for (let j = i + 1; j < this.bullets.length; j++) {
                const b1 = this.bullets[i];
                const b2 = this.bullets[j];
                
                if (!b1.isActive || !b2.isActive) continue;
                
                if (this.physicsEngine.checkCollision(b1, b2)) {
                    b1.destroy();
                    b2.destroy();
                    this.createExplosion(b1.x, b1.y, CONFIG.BULLET.SIZE);
                }
            }
        }
    }
    
    /**
     * 检查游戏状态
     */
    checkGameState() {
        // 检查基地是否被摧毁
        if (this.base.isDestroyed) {
            this.gameOver(false);
            return;
        }
        
        // 检查玩家是否全部阵亡
        const alivePlayers = this.players.filter(p => p.lives > 0);
        if (alivePlayers.length === 0) {
            this.gameOver(false);
            return;
        }
        
        // 检查是否完成关卡
        if (this.enemyManager.isLevelComplete()) {
            this.levelComplete();
        }
    }
    
    /**
     * 获取所有坦克
     */
    getAllTanks() {
        return [...this.players, ...this.enemyManager.enemies];
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, size) {
        this.explosions.push({
            x, y, size,
            frame: 0
        });
    }
    
    /**
     * 添加分数
     */
    addScore(points) {
        this.score += points;
    }
    
    /**
     * 关卡完成
     */
    levelComplete() {
        this.addScore(CONFIG.SCORE.LEVEL_COMPLETE);
        // 播放关卡完成音效
        this.engine.audioManager.playSound('levelComplete', 0.6);
        this.level++;
        setTimeout(() => {
            this.initLevel();
        }, 3000);
    }
    
    /**
     * 游戏结束
     */
    gameOver(isWin) {
        this.isGameOver = true;
        
        // 播放游戏结束音效
        this.engine.audioManager.playSound('gameover', 0.7);
        
        const resultTitle = document.getElementById('result-title');
        resultTitle.textContent = isWin ? '胜利!' : '游戏结束';
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        
        this.gameoverScreen.style.display = 'flex';
    }
    
    /**
     * 切换暂停
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseScreen.style.display = this.isPaused ? 'flex' : 'none';
    }
    
    /**
     * 退出游戏
     */
    quitGame() {
        this.sceneManager.switchTo('menu');
    }
    
    /**
     * 重新开始
     */
    restartGame() {
        this.gameoverScreen.style.display = 'none';
        this.enter({ playerCount: this.playerCount });
    }
    
    /**
     * 返回菜单
     */
    backToMenu() {
        this.gameoverScreen.style.display = 'none';
        this.sceneManager.switchTo('menu');
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        // 更新关卡
        document.getElementById('level-number').textContent = this.level;
        
        // 更新分数
        document.getElementById('score').textContent = this.score;
        
        // 更新玩家生命
        this.updateLives('p1-lives', this.players[0]?.lives || 0);
        if (this.playerCount === 2) {
            this.updateLives('p2-lives', this.players[1]?.lives || 0);
        }
        
        // 更新敌人数量
        const enemyIcons = document.getElementById('enemy-icons');
        enemyIcons.innerHTML = '';
        const remaining = this.enemyManager?.getRemainingCount() || 0;
        for (let i = 0; i < Math.min(remaining, 20); i++) {
            const icon = document.createElement('div');
            icon.className = 'enemy-icon';
            enemyIcons.appendChild(icon);
        }
    }
    
    /**
     * 更新生命显示
     */
    updateLives(elementId, lives) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeIcon = document.createElement('div');
            lifeIcon.className = 'life-icon';
            container.appendChild(lifeIcon);
        }
    }
    
    /**
     * 渲染场景
     */
    render(renderer) {
        // 渲染地图
        this.map.render(renderer, this.frameCount);
        
        // 渲染基地
        this.base.render(renderer);
        
        // 渲染玩家
        this.players.forEach(player => {
            if (player.isAlive) {
                player.render(renderer, this.frameCount);
            }
        });
        
        // 渲染敌人
        this.enemyManager.render(renderer, this.frameCount);
        
        // 渲染子弹
        this.bullets.forEach(bullet => {
            if (bullet.isActive) {
                bullet.render(renderer);
            }
        });
        
        // 渲染道具
        this.powerUpManager.render(renderer);
        
        // 渲染爆炸效果
        this.explosions.forEach(explosion => {
            renderer.drawExplosion(explosion.x, explosion.y, explosion.size, explosion.frame);
        });
    }
}
