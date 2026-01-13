import { Player } from '../entities/Player.js';
import { Tile } from './Tile.js';
import { CONSTANTS } from '../utils/Constants.js';

export class Level {
    constructor(game, data) {
        this.game = game;
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.backgroundColor = data.backgroundColor || '#5C94FC';
        
        this.tiles = [];
        this.blocks = [];
        this.enemies = [];
        this.items = [];
        this.player = null;
        
        this.loadTiles(data.layers.tiles);
        this.spawnPlayer(data.playerStart);
    }

    loadTiles(tileData) {
        for (let y = 0; y < tileData.length; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < tileData[y].length; x++) {
                this.tiles[y][x] = new Tile(x, y, tileData[y][x]);
            }
        }
    }

    spawnPlayer(startPos) {
        this.player = new Player(startPos.x, startPos.y, this.game);
    }

    getTilesAround(bounds) {
        const tiles = [];
        const startX = Math.floor(bounds.left / CONSTANTS.TILE_SIZE);
        const endX = Math.ceil(bounds.right / CONSTANTS.TILE_SIZE);
        const startY = Math.floor(bounds.top / CONSTANTS.TILE_SIZE);
        const endY = Math.ceil(bounds.bottom / CONSTANTS.TILE_SIZE);

        for (let y = Math.max(0, startY); y < Math.min(this.tiles.length, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.tiles[y].length, endX); x++) {
                if (this.tiles[y] && this.tiles[y][x]) {
                    tiles.push(this.tiles[y][x]);
                }
            }
        }

        return tiles;
    }

    getAllEntities() {
        const entities = [this.player];
        entities.push(...this.enemies);
        entities.push(...this.items);
        entities.push(...this.blocks);
        return entities.filter(e => e && e.active);
    }

    checkBlockHit(tile) {
    }

    update(deltaTime) {
        if (this.player) {
            this.player.update(deltaTime);
        }

        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(deltaTime);
            }
        }

        for (const item of this.items) {
            if (item.active) {
                item.update(deltaTime);
            }
        }

        for (const block of this.blocks) {
            if (block.active) {
                block.update(deltaTime);
            }
        }
    }

    render(ctx, camera) {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        const startX = Math.floor(camera.x / CONSTANTS.TILE_SIZE);
        const endX = Math.ceil((camera.x + camera.width) / CONSTANTS.TILE_SIZE);
        const startY = Math.floor(camera.y / CONSTANTS.TILE_SIZE);
        const endY = Math.ceil((camera.y + camera.height) / CONSTANTS.TILE_SIZE);

        for (let y = Math.max(0, startY); y < Math.min(this.tiles.length, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.tiles[y].length, endX); x++) {
                if (this.tiles[y] && this.tiles[y][x]) {
                    this.tiles[y][x].render(ctx);
                }
            }
        }

        for (const block of this.blocks) {
            if (block.active && camera.isVisible(block.getBounds())) {
                block.render(ctx, camera);
            }
        }

        for (const item of this.items) {
            if (item.active && camera.isVisible(item.getBounds())) {
                item.render(ctx, camera);
            }
        }

        for (const enemy of this.enemies) {
            if (enemy.active && camera.isVisible(enemy.getBounds())) {
                enemy.render(ctx, camera);
            }
        }

        if (this.player && this.player.active) {
            this.player.render(ctx, camera);
        }
    }

    reset() {
        if (this.player) {
            this.player.x = 32;
            this.player.y = 0;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.player.state = CONSTANTS.PLAYER.STATES.SMALL;
            this.player.height = CONSTANTS.PLAYER.HEIGHT;
        }
    }
}

export default Level;
