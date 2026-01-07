// 游戏核心控制器

import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATE } from './config.js';
import { Player } from './entities/Player.js';
import { Bullet } from './entities/Bullet.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { PowerUpManager } from './managers/PowerUpManager.js';
import { LevelManager } from './managers/LevelManager.js';
import { checkCollision } from './utils/collision.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.state = GAME_STATE.MENU;
        this.score = 0;
        this.lastTimestamp = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // 输入状态
        this.keys = {};
        this.mouse = { x: 0, y: 0 };

        // 游戏对象
        this.player = null;
        this.bullets = [];
        this.enemyManager = null;
        this.powerUpManager = null;
        this.levelManager = null;

        // 背景滚动
        this.bgOffset = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });

        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }

    start() {
        console.log('游戏开始');
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        
        // 初始化玩家
        this.player = new Player(CANVAS_WIDTH / 2 - 20, CANVAS_HEIGHT - 100);
        this.bullets = [];
        
        // 初始化管理器
        this.enemyManager = new EnemyManager(this);
        this.powerUpManager = new PowerUpManager(this);
        this.levelManager = new LevelManager(this);
        
        this.updateUI();
    }

    reset() {
        this.score = 0;
        this.state = GAME_STATE.MENU;
        this.bullets = [];
        this.player = null;
        if (this.enemyManager) {
            this.enemyManager.clear();
        }
        if (this.powerUpManager) {
            this.powerUpManager.clear();
        }
        if (this.levelManager) {
            this.levelManager.reset();
        }
        this.enemyManager = null;
        this.powerUpManager = null;
        this.levelManager = null;
        this.updateUI();
    }

    gameOver() {
        console.log('游戏结束,分数:', this.score);
        this.state = GAME_STATE.GAME_OVER;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('gameover-screen').classList.remove('hidden');
    }

    update(deltaTime) {
        if (this.state !== GAME_STATE.PLAYING) {
            return;
        }

        // 更新背景滚动
        this.bgOffset += 1;
        if (this.bgOffset >= CANVAS_HEIGHT) {
            this.bgOffset = 0;
        }

        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime, this.keys, this.mouse);
            
            // 自动射击
            const currentTime = Date.now();
            if (this.player.canShoot(currentTime)) {
                const bulletPositions = this.player.shoot(currentTime);
                bulletPositions.forEach(pos => {
                    const bullet = new Bullet(pos.x, pos.y, true);
                    if (pos.angle !== undefined) {
                        const angleRad = (pos.angle * Math.PI) / 180;
                        const speed = 8;
                        bullet.setVelocity(Math.sin(angleRad) * speed, -Math.cos(angleRad) * speed);
                    }
                    this.bullets.push(bullet);
                });
            }
            
            // 检查玩家死亡
            if (this.player.dead) {
                this.gameOver();
            }
        }

        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.active;
        });

        // 更新敌机
        if (this.enemyManager) {
            this.enemyManager.update(deltaTime);
        }

        // 更新关卡
        if (this.levelManager) {
            this.levelManager.update(deltaTime);
        }

        // 碰撞检测
        this.checkCollisions();
        
        this.updateUI();
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 绘制背景(星空效果)
        this.drawBackground();

        if (this.state === GAME_STATE.PLAYING) {
            // 渲染敌机和敌机子弹
            if (this.enemyManager) {
                this.enemyManager.render(this.ctx);
            }
            
            // 渲染Boss
            if (this.levelManager) {
                this.levelManager.render(this.ctx);
            }
            
            // 渲染道具
            if (this.powerUpManager) {
                this.powerUpManager.render(this.ctx);
            }
            
            // 渲染子弹
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            
            // 渲染玩家
            if (this.player) {
                this.player.render(this.ctx);
            }
        }

        // 显示FPS(调试用)
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${this.fps}`, CANVAS_WIDTH - 60, 20);
    }

    drawBackground() {
        // 简单的星空背景
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % CANVAS_WIDTH;
            const y = (i * 217 + this.bgOffset) % CANVAS_HEIGHT;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('health-value').textContent = this.player ? this.player.health : 5;
        document.getElementById('level-value').textContent = this.levelManager ? this.levelManager.currentLevel : 1;
    }

    checkCollisions() {
        if (!this.player || !this.enemyManager) return;

        // 玩家子弹 vs 敌机
        this.bullets.forEach(bullet => {
            if (!bullet.active || !bullet.isPlayerBullet) return;
            
            this.enemyManager.enemies.forEach(enemy => {
                if (!enemy.active) return;
                
                if (checkCollision(bullet, enemy)) {
                    bullet.destroy();
                    if (enemy.takeDamage(1)) {
                        // 敌机被击毁
                        this.score += enemy.score;
                        // 生成道具
                        if (this.powerUpManager) {
                            this.powerUpManager.trySpawnPowerUp(
                                enemy.x + enemy.width / 2 - 12.5,
                                enemy.y + enemy.height / 2 - 12.5
                            );
                        }
                    }
                }
            });
            
            // 玩家子弹 vs Boss
            if (this.levelManager && this.levelManager.boss && this.levelManager.boss.active) {
                const boss = this.levelManager.boss;
                if (checkCollision(bullet, boss)) {
                    bullet.destroy();
                    if (boss.takeDamage(1)) {
                        // Boss被击败
                        this.score += boss.score;
                    }
                }
            }
        });

        // 敌机子弹 vs 玩家
        this.enemyManager.enemyBullets.forEach(bullet => {
            if (!bullet.active) return;
            
            if (checkCollision(bullet, this.player)) {
                bullet.destroy();
                this.player.takeDamage();
            }
        });

        // 敌机 vs 玩家
        this.enemyManager.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (checkCollision(enemy, this.player)) {
                enemy.destroy();
                this.player.takeDamage();
            }
        });

        // Boss vs 玩家
        if (this.levelManager && this.levelManager.boss && this.levelManager.boss.active) {
            if (checkCollision(this.levelManager.boss, this.player)) {
                this.player.takeDamage();
            }
        }

        // 道具 vs 玩家
        if (this.powerUpManager) {
            this.powerUpManager.powerUps.forEach(powerUp => {
                if (!powerUp.active) return;
                
                if (checkCollision(powerUp, this.player)) {
                    powerUp.applyEffect(this.player);
                }
            });
        }
    }

    gameLoop(timestamp) {
        // 计算deltaTime
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // 计算FPS
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        // 更新和渲染
        this.update(deltaTime);
        this.render();

        // 继续循环
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}