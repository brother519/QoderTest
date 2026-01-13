import { CONSTANTS } from './utils/Constants.js';
import { InputHandler } from './InputHandler.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';

export class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.state = CONSTANTS.GAME_STATES.MENU;
        
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.time = 300;
        
        this.currentLevel = null;
        this.player = null;
        this.camera = null;
        this.inputHandler = new InputHandler();
        this.physicsEngine = null;
        
        this.entities = [];
        this.timeCounter = 0;
    }

    setState(newState) {
        this.state = newState;
    }

    loadLevel(level) {
        this.currentLevel = level;
        this.physicsEngine = new PhysicsEngine(level);
        this.entities = level.getAllEntities();
        this.player = level.player;
        
        if (this.camera) {
            this.camera.setTarget(this.player);
        }
    }

    update(deltaTime) {
        if (this.state !== CONSTANTS.GAME_STATES.PLAYING) return;

        if (this.inputHandler.isJustPressed('PAUSE')) {
            this.state = CONSTANTS.GAME_STATES.PAUSED;
            return;
        }

        this.timeCounter += deltaTime;
        if (this.timeCounter >= 1.0) {
            this.time = Math.max(0, this.time - 1);
            this.timeCounter = 0;
            
            if (this.time === 0) {
                this.playerDie();
            }
        }

        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }

        this.entities = this.entities.filter(e => e.active);

        if (this.physicsEngine) {
            this.physicsEngine.update(this.entities, deltaTime);
            this.physicsEngine.checkEntityCollisions(this.entities);
        }

        if (this.camera) {
            this.camera.update();
        }

        if (this.player && this.player.y > this.currentLevel.height + 100) {
            this.playerDie();
        }

        this.inputHandler.reset();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === CONSTANTS.GAME_STATES.MENU) {
            this.renderMenu();
            return;
        }

        if (this.camera && this.currentLevel) {
            this.camera.apply(this.ctx);
            this.currentLevel.render(this.ctx, this.camera);
            this.camera.reset(this.ctx);
        }

        this.renderHUD();

        if (this.state === CONSTANTS.GAME_STATES.PAUSED) {
            this.renderPauseScreen();
        } else if (this.state === CONSTANTS.GAME_STATES.GAME_OVER) {
            this.renderGameOver();
        }
    }

    renderMenu() {
        this.ctx.fillStyle = '#5C94FC';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('超级马里奥', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按空格键开始', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    renderHUD() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`分数: ${this.score}`, 10, 25);
        this.ctx.fillText(`金币: ${this.coins}`, 10, 45);
        this.ctx.fillText(`时间: ${this.time}`, this.canvas.width - 100, 25);
        this.ctx.fillText(`生命: ${this.lives}`, this.canvas.width - 100, 45);
    }

    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);
    }

    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    addScore(points) {
        this.score += points;
    }

    addCoin() {
        this.coins++;
        this.addScore(CONSTANTS.ITEM.COIN.SCORE);
        
        if (this.coins >= 100) {
            this.coins -= 100;
            this.lives++;
        }
    }

    playerDie() {
        this.lives--;
        if (this.lives <= 0) {
            this.state = CONSTANTS.GAME_STATES.GAME_OVER;
        } else {
            this.resetLevel();
        }
    }

    resetLevel() {
        if (this.currentLevel) {
            this.currentLevel.reset();
            this.time = 300;
            this.timeCounter = 0;
        }
    }

    levelComplete() {
        this.state = CONSTANTS.GAME_STATES.LEVEL_COMPLETE;
    }
}

export default Game;
