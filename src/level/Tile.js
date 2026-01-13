import { AABB } from '../physics/AABB.js';
import { CONSTANTS } from '../utils/Constants.js';

export class Tile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.solid = type !== CONSTANTS.TILE_TYPES.AIR;
        this.bounds = new AABB(
            x * CONSTANTS.TILE_SIZE,
            y * CONSTANTS.TILE_SIZE,
            CONSTANTS.TILE_SIZE,
            CONSTANTS.TILE_SIZE
        );
    }

    render(ctx) {
        if (this.type === CONSTANTS.TILE_TYPES.AIR) return;

        const colors = {
            [CONSTANTS.TILE_TYPES.GROUND]: '#8B4513',
            [CONSTANTS.TILE_TYPES.BRICK]: '#CD853F',
            [CONSTANTS.TILE_TYPES.STONE]: '#808080',
            [CONSTANTS.TILE_TYPES.PIPE_TOP_LEFT]: '#00AA00',
            [CONSTANTS.TILE_TYPES.PIPE_TOP_RIGHT]: '#00AA00',
            [CONSTANTS.TILE_TYPES.PIPE_BODY_LEFT]: '#008800',
            [CONSTANTS.TILE_TYPES.PIPE_BODY_RIGHT]: '#008800'
        };

        ctx.fillStyle = colors[this.type] || '#CCCCCC';
        ctx.fillRect(
            this.bounds.x,
            this.bounds.y,
            CONSTANTS.TILE_SIZE,
            CONSTANTS.TILE_SIZE
        );

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.strokeRect(
            this.bounds.x,
            this.bounds.y,
            CONSTANTS.TILE_SIZE,
            CONSTANTS.TILE_SIZE
        );
    }
}

export default Tile;
