import {
    CANVAS_WIDTH, CANVAS_HEIGHT, STATE_MENU, STATE_PLAYING,
    STATE_GAMEOVER, STATE_WIN, PLAYER_LIVES, ENEMY_COUNT,
    MAX_ENEMIES_ON_SCREEN, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT
} from './constants.js';
import { InputHandler } from './input.js';
import { GameMap } from './map.js';
import { PlayerTank } from './player.js';
import { EnemyTank } from './enemy.js';
import { CollisionSystem } from './collision.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.input = new InputHandler();
        this.collision = new CollisionSystem();
        this.renderer = new Renderer(this.ctx);

        this.gameState = STATE_MENU;
        this.score = 0;
        this.lives = PLAYER_LIVES;
        this.level = 1;
        this.enemiesRemaining = ENEMY_COUNT;
        this.spawnTimer = 0;
        this.spawnInterval = 3000;

        this.map = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];

        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.map = new GameMap();
        this.map.loadLevel(this.level);
        this.player = new PlayerTank(9 * 26, 18 * 26);
        this.enemies = [];
        this.bullets = [];
        this.enemiesRemaining = ENEMY_COUNT;
        this.spawnTimer = 0;
    }

    start() {
        this.gameState = STATE_PLAYING;
        this.init();
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        if (this.gameState === STATE_MENU) {
            if (this.input.isKeyDown('Enter') || this.input.isKeyDown('Space')) {
                this.start();
            }
            return;
        }

        if (this.gameState === STATE_GAMEOVER || this.gameState === STATE_WIN) {
            if (this.input.isKeyDown('Enter')) {
                this.restart();
            }
            return;
        }

        if (this.gameState !== STATE_PLAYING) return;

        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateBullets(deltaTime);
        this.spawnEnemies(deltaTime);
        this.checkCollisions();
        this.checkGameState();
    }

    updatePlayer(deltaTime) {
        if (!this.player || !this.player.isAlive) return;

        let direction = null;
        if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) {
            direction = DIR_UP;
        } else if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) {
            direction = DIR_DOWN;
        } else if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) {
            direction = DIR_LEFT;
        } else if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) {
            direction = DIR_RIGHT;
        }

        if (direction !== null) {
            const newPos = this.player.move(direction);
            if (!this.collision.checkTankMapCollision(newPos, this.map) &&
                !this.collision.checkTankTankCollision(newPos, this.enemies)) {
                this.player.applyMove(newPos, direction);
            } else {
                this.player.direction = direction;
            }
        }

        if (this.input.isKeyDown('Space') || this.input.isKeyDown('KeyJ')) {
            const bullet = this.player.fire();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }

        this.player.update(deltaTime);
    }

    updateEnemies(deltaTime) {
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            enemy.think(deltaTime);
            const newPos = enemy.move(enemy.targetDirection);

            if (!this.collision.checkTankMapCollision(newPos, this.map) &&
                !this.collision.checkTankTankCollision(newPos, [...this.enemies.filter(e => e !== enemy), this.player])) {
                enemy.applyMove(newPos, enemy.targetDirection);
            } else {
                enemy.chooseNewDirection();
            }

            if (enemy.shouldFire()) {
                const bullet = enemy.fire();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }

            enemy.update(deltaTime);
        }
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();

            if (bullet.isOutOfBounds()) {
                this.bullets.splice(i, 1);
            }
        }
    }

    spawnEnemies(deltaTime) {
        if (this.enemiesRemaining <= 0) return;

        const aliveEnemies = this.enemies.filter(e => e.isAlive).length;
        if (aliveEnemies >= MAX_ENEMIES_ON_SCREEN) return;

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        const spawnPoints = [0, 9, 19];
        const spawnX = spawnPoints[Math.floor(Math.random() * spawnPoints.length)] * 26;
        const enemy = new EnemyTank(spawnX, 0);
        this.enemies.push(enemy);
        this.enemiesRemaining--;
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isActive) continue;

            const tileHit = this.collision.checkBulletMapCollision(bullet, this.map);
            if (tileHit) {
                if (tileHit.type === 'brick') {
                    this.map.destroyTile(tileHit.col, tileHit.row);
                }
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }

            if (this.collision.checkBulletBaseCollision(bullet, this.map.base)) {
                this.map.base.destroy();
                this.gameState = STATE_GAMEOVER;
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }

            if (bullet.owner === 'player') {
                for (const enemy of this.enemies) {
                    if (enemy.isAlive && this.collision.checkBulletTankCollision(bullet, enemy)) {
                        enemy.takeDamage();
                        if (!enemy.isAlive) {
                            this.score += 100;
                        }
                        bullet.destroy();
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
            } else {
                if (this.player && this.player.isAlive && !this.player.shield &&
                    this.collision.checkBulletTankCollision(bullet, this.player)) {
                    this.player.takeDamage();
                    if (!this.player.isAlive) {
                        this.lives--;
                        if (this.lives > 0) {
                            this.player.respawn(9 * 26, 18 * 26);
                        }
                    }
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                }
            }
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                if (this.bullets[i] && this.bullets[j] &&
                    this.collision.checkBulletBulletCollision(this.bullets[i], this.bullets[j])) {
                    this.bullets.splice(i, 1);
                    this.bullets.splice(j, 1);
                    break;
                }
            }
        }
    }

    checkGameState() {
        if (this.map.base.isDestroyed || (this.lives <= 0)) {
            this.gameState = STATE_GAMEOVER;
            return;
        }

        const aliveEnemies = this.enemies.filter(e => e.isAlive).length;
        if (this.enemiesRemaining <= 0 && aliveEnemies === 0) {
            this.level++;
            if (this.level > 3) {
                this.gameState = STATE_WIN;
            } else {
                this.init();
            }
        }
    }

    restart() {
        this.score = 0;
        this.lives = PLAYER_LIVES;
        this.level = 1;
        this.gameState = STATE_MENU;
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.gameState === STATE_MENU) {
            this.renderer.drawMenu();
            return;
        }

        this.map.draw(this.ctx);

        if (this.player && this.player.isAlive) {
            this.player.draw(this.ctx);
        }

        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.draw(this.ctx);
            }
        }

        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        this.map.drawGrass(this.ctx);

        this.renderer.drawUI(this.score, this.lives, this.level, this.enemiesRemaining + this.enemies.filter(e => e.isAlive).length);

        if (this.gameState === STATE_GAMEOVER) {
            this.renderer.drawGameOver();
        } else if (this.gameState === STATE_WIN) {
            this.renderer.drawWin();
        }
    }
}
