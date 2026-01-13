import { TILE_SIZE, TILE_EMPTY, TILE_BRICK, TILE_STEEL, TILE_WATER, TILE_GRASS, COLORS } from './constants.js';

export class Tile {
    constructor(col, row, type) {
        this.col = col;
        this.row = row;
        this.x = col * TILE_SIZE;
        this.y = row * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.type = type;
        this.isDestructible = type === TILE_BRICK;
        this.isPassable = type === TILE_EMPTY || type === TILE_GRASS;
        this.blockseBullets = type === TILE_BRICK || type === TILE_STEEL;
    }

    draw(ctx) {
        switch (this.type) {
            case TILE_BRICK:
                ctx.fillStyle = COLORS.BRICK;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + i * 9);
                    ctx.lineTo(this.x + this.width, this.y + i * 9);
                    ctx.stroke();
                }
                break;
            case TILE_STEEL:
                ctx.fillStyle = COLORS.STEEL;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
                break;
            case TILE_WATER:
                ctx.fillStyle = COLORS.WATER;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = '#5B9BD5';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(this.x + 2, this.y + 4 + i * 8, this.width - 4, 2);
                }
                break;
            case TILE_GRASS:
                break;
        }
    }

    drawGrass(ctx) {
        if (this.type === TILE_GRASS) {
            ctx.fillStyle = COLORS.GRASS;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
