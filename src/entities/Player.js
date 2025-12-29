import { Entity } from './Entity.js';
import { CONSTANTS } from '../utils/Constants.js';

export class Player extends Entity {
    constructor(x, y, game) {
        super(x, y, CONSTANTS.PLAYER.WIDTH, CONSTANTS.PLAYER.HEIGHT);
        this.game = game;
        this.state = CONSTANTS.PLAYER.STATES.SMALL;
        
        this.facingRight = true;
        this.jumpTime = 0;
        this.canJump = true;
        this.invincibleTimer = 0;
        this.starTimer = 0;
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= deltaTime;
        }
        
        if (this.starTimer > 0) {
            this.starTimer -= deltaTime;
        }
    }

    handleInput(deltaTime) {
        const input = this.game.inputHandler;
        const axis = input.getAxis('horizontal');
        const isRunning = input.isPressed('RUN');
        
        const maxSpeed = isRunning ? CONSTANTS.PLAYER.RUN_SPEED : CONSTANTS.PLAYER.MOVE_SPEED;
        
        if (axis !== 0) {
            this.facingRight = axis > 0;
            
            if (Math.abs(this.velocityX) < maxSpeed) {
                this.velocityX += axis * CONSTANTS.PLAYER.ACCELERATION * deltaTime;
            }
            
            this.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocityX));
        } else {
            const friction = CONSTANTS.PLAYER.FRICTION * deltaTime;
            if (Math.abs(this.velocityX) < friction) {
                this.velocityX = 0;
            } else {
                this.velocityX -= Math.sign(this.velocityX) * friction;
            }
        }

        if (input.isJustPressed('JUMP') && this.onGround) {
            this.jump();
        }

        if (input.isPressed('JUMP') && this.jumpTime > 0) {
            this.velocityY -= CONSTANTS.PLAYER.JUMP_HOLD_BOOST * deltaTime;
            this.jumpTime -= deltaTime;
        } else {
            this.jumpTime = 0;
        }

        if (this.onGround) {
            this.canJump = true;
        }

        if (this.state === CONSTANTS.PLAYER.STATES.FIRE && input.isJustPressed('RUN')) {
            this.shootFireball();
        }
    }

    jump() {
        if (!this.canJump) return;
        
        this.velocityY = -CONSTANTS.PLAYER.JUMP_FORCE;
        this.jumpTime = CONSTANTS.PLAYER.MAX_JUMP_TIME;
        this.canJump = false;
        this.onGround = false;
    }

    shootFireball() {
    }

    powerUp() {
        if (this.state === CONSTANTS.PLAYER.STATES.SMALL) {
            this.state = CONSTANTS.PLAYER.STATES.BIG;
            this.height = CONSTANTS.PLAYER.BIG_HEIGHT;
            this.y -= (CONSTANTS.PLAYER.BIG_HEIGHT - CONSTANTS.PLAYER.HEIGHT);
            this.game.addScore(CONSTANTS.ITEM.MUSHROOM.SCORE);
        } else if (this.state === CONSTANTS.PLAYER.STATES.BIG) {
            this.state = CONSTANTS.PLAYER.STATES.FIRE;
            this.game.addScore(CONSTANTS.ITEM.FIRE_FLOWER.SCORE);
        }
    }

    takeDamage() {
        if (this.invincibleTimer > 0 || this.starTimer > 0) return;

        if (this.state === CONSTANTS.PLAYER.STATES.FIRE) {
            this.state = CONSTANTS.PLAYER.STATES.BIG;
            this.invincibleTimer = CONSTANTS.PLAYER.INVINCIBLE_TIME;
        } else if (this.state === CONSTANTS.PLAYER.STATES.BIG) {
            this.state = CONSTANTS.PLAYER.STATES.SMALL;
            this.height = CONSTANTS.PLAYER.HEIGHT;
            this.invincibleTimer = CONSTANTS.PLAYER.INVINCIBLE_TIME;
        } else {
            this.die();
        }
    }

    die() {
        this.game.playerDie();
    }

    activateStar() {
        this.starTimer = CONSTANTS.PLAYER.STAR_TIME;
        this.game.addScore(CONSTANTS.ITEM.STAR.SCORE);
    }

    onCollision(other, direction) {
        if (other.type === 'enemy') {
            if (direction === CONSTANTS.COLLISION_DIRS.TOP && this.velocityY > 0) {
                other.stomp();
                this.velocityY = -CONSTANTS.PLAYER.JUMP_FORCE * 0.5;
            } else if (this.starTimer <= 0) {
                this.takeDamage();
            }
        } else if (other.type === 'item') {
            other.collect(this);
        }
    }

    onHitCeiling(tile) {
        if (this.game.currentLevel) {
            this.game.currentLevel.checkBlockHit(tile);
        }
    }

    render(ctx, camera) {
        if (!camera.isVisible(this.getBounds())) return;

        const isInvincible = this.invincibleTimer > 0;
        const hasStar = this.starTimer > 0;
        
        if (isInvincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }

        let color = '#FF0000';
        if (this.state === CONSTANTS.PLAYER.STATES.BIG) {
            color = '#FF6600';
        } else if (this.state === CONSTANTS.PLAYER.STATES.FIRE) {
            color = '#FFFF00';
        }
        
        if (hasStar) {
            const starColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
            color = starColors[Math.floor(this.starTimer * 10) % 4];
        }

        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 4, this.y + 2, 3, 3);
    }
}

export default Player;
