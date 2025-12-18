import { TILE_TYPES, TILE_SIZE, COLORS } from '../constants.js';

export class Tile {
    constructor(type, col, row) {
        this.type = type;
        this.col = col;
        this.row = row;
        this.x = col * TILE_SIZE;
        this.y = row * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        
        this.health = this.getInitialHealth();
        this.isDestructible = this.checkDestructible();
        this.isPassable = this.checkPassable();
        this.blocksBuillets = this.checkBlocksBullets();
    }
    
    getInitialHealth() {
        switch (this.type) {
            case TILE_TYPES.BRICK: return 2;
            case TILE_TYPES.STEEL: return 4;
            case TILE_TYPES.BASE: return 1;
            default: return 0;
        }
    }
    
    checkDestructible() {
        return this.type === TILE_TYPES.BRICK || 
               this.type === TILE_TYPES.BASE;
    }
    
    checkPassable() {
        return this.type === TILE_TYPES.EMPTY ||
               this.type === TILE_TYPES.GRASS;
    }
    
    checkBlocksBullets() {
        return this.type === TILE_TYPES.BRICK ||
               this.type === TILE_TYPES.STEEL ||
               this.type === TILE_TYPES.BASE ||
               this.type === TILE_TYPES.BASE_DESTROYED;
    }
    
    takeDamage(amount = 1, canDestroySteel = false) {
        if (this.type === TILE_TYPES.STEEL && !canDestroySteel) {
            return false;
        }
        
        if (!this.isDestructible && this.type !== TILE_TYPES.STEEL) {
            return false;
        }
        
        if (this.type === TILE_TYPES.STEEL && canDestroySteel) {
            this.health -= amount;
        } else {
            this.health -= amount;
        }
        
        if (this.health <= 0) {
            if (this.type === TILE_TYPES.BASE) {
                this.type = TILE_TYPES.BASE_DESTROYED;
                return 'base_destroyed';
            }
            this.type = TILE_TYPES.EMPTY;
            this.isPassable = true;
            this.blocksBuillets = false;
            this.isDestructible = false;
            return true;
        }
        
        return false;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    render(ctx) {
        switch (this.type) {
            case TILE_TYPES.BRICK:
                this.renderBrick(ctx);
                break;
            case TILE_TYPES.STEEL:
                this.renderSteel(ctx);
                break;
            case TILE_TYPES.WATER:
                this.renderWater(ctx);
                break;
            case TILE_TYPES.GRASS:
                this.renderGrass(ctx);
                break;
            case TILE_TYPES.BASE:
                this.renderBase(ctx, false);
                break;
            case TILE_TYPES.BASE_DESTROYED:
                this.renderBase(ctx, true);
                break;
        }
    }
    
    renderBrick(ctx) {
        ctx.fillStyle = COLORS.BRICK;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#5d3a1a';
        ctx.lineWidth = 1;
        
        const brickHeight = this.height / 3;
        for (let i = 0; i < 3; i++) {
            const y = this.y + i * brickHeight;
            ctx.strokeRect(this.x, y, this.width / 2, brickHeight);
            ctx.strokeRect(this.x + this.width / 2, y, this.width / 2, brickHeight);
        }
    }
    
    renderSteel(ctx) {
        ctx.fillStyle = COLORS.STEEL;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(this.x + 2, this.y + 2, this.width / 2 - 3, this.height / 2 - 3);
        ctx.fillRect(this.x + this.width / 2 + 1, this.y + this.height / 2 + 1, this.width / 2 - 3, this.height / 2 - 3);
        
        ctx.fillStyle = '#606060';
        ctx.fillRect(this.x + this.width / 2 + 1, this.y + 2, this.width / 2 - 3, this.height / 2 - 3);
        ctx.fillRect(this.x + 2, this.y + this.height / 2 + 1, this.width / 2 - 3, this.height / 2 - 3);
    }
    
    renderWater(ctx) {
        ctx.fillStyle = COLORS.WATER;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = this.y + 5 + i * 8;
            ctx.beginPath();
            ctx.moveTo(this.x, y);
            ctx.bezierCurveTo(
                this.x + this.width / 4, y - 3,
                this.x + this.width / 2, y + 3,
                this.x + this.width, y
            );
            ctx.stroke();
        }
    }
    
    renderGrass(ctx) {
        ctx.fillStyle = COLORS.GRASS;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#1e8449';
        for (let i = 0; i < 8; i++) {
            const gx = this.x + Math.random() * this.width;
            const gy = this.y + Math.random() * this.height;
            ctx.beginPath();
            ctx.arc(gx, gy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderBase(ctx, destroyed) {
        ctx.fillStyle = destroyed ? COLORS.BASE_DESTROYED : COLORS.BASE;
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        if (!destroyed) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.6, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
