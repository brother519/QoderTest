import { Constants } from '../utils/Constants.js';

// 地图块基类
export class Tile {
    constructor(gridX, gridY, type) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.x = gridX * Constants.TILE_SIZE;
        this.y = gridY * Constants.TILE_SIZE;
        this.size = Constants.TILE_SIZE;
        this.isPassable = this.checkPassable();
        this.isDestructible = this.checkDestructible();
    }
    
    checkPassable() {
        switch (this.type) {
            case Constants.TILE_TYPE.EMPTY:
            case Constants.TILE_TYPE.GRASS:
                return true;
            default:
                return false;
        }
    }
    
    checkDestructible() {
        return this.type === Constants.TILE_TYPE.BRICK;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
    
    render(ctx) {
        const colors = Constants.COLORS;
        
        switch (this.type) {
            case Constants.TILE_TYPE.BRICK:
                this.renderBrick(ctx, colors);
                break;
            case Constants.TILE_TYPE.STEEL:
                this.renderSteel(ctx, colors);
                break;
            case Constants.TILE_TYPE.WATER:
                this.renderWater(ctx, colors);
                break;
            case Constants.TILE_TYPE.GRASS:
                this.renderGrass(ctx, colors);
                break;
        }
    }
    
    renderBrick(ctx, colors) {
        ctx.fillStyle = colors.BRICK;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // 砖块纹理
        ctx.fillStyle = colors.BRICK_DARK;
        ctx.fillRect(this.x, this.y, this.size / 2, this.size / 2);
        ctx.fillRect(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, this.size / 2);
        
        // 砖缝
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
    
    renderSteel(ctx, colors) {
        ctx.fillStyle = colors.STEEL;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // 金属光泽
        ctx.fillStyle = colors.STEEL_LIGHT;
        ctx.fillRect(this.x + 2, this.y + 2, this.size - 6, this.size - 6);
        
        ctx.fillStyle = colors.STEEL;
        ctx.fillRect(this.x + 4, this.y + 4, this.size - 8, this.size - 8);
    }
    
    renderWater(ctx, colors) {
        ctx.fillStyle = colors.WATER;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // 水波纹
        ctx.fillStyle = colors.WATER_LIGHT;
        const time = Date.now() / 500;
        const offset = Math.sin(time + this.gridX + this.gridY) * 2;
        ctx.fillRect(this.x + 2 + offset, this.y + 4, this.size - 6, 2);
        ctx.fillRect(this.x + 4 - offset, this.y + 10, this.size - 8, 2);
    }
    
    renderGrass(ctx, colors) {
        ctx.fillStyle = colors.GRASS;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // 草地纹理
        ctx.fillStyle = colors.GRASS_LIGHT;
        for (let i = 0; i < 3; i++) {
            const gx = this.x + 2 + i * 5;
            const gy = this.y + 4;
            ctx.fillRect(gx, gy, 2, 8);
        }
    }
}
