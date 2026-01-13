import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_TYPES, TILE_SIZE, GRID_COLS, GRID_ROWS } from '../constants.js';
import { Tile } from '../map/Tile.js';

export class LevelEditor {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        
        this.tiles = [];
        this.selectedTool = TILE_TYPES.BRICK;
        this.playerSpawn = { x: 4, y: 22 };
        this.enemySpawns = [
            { x: 0, y: 0 },
            { x: 11, y: 0 },
            { x: 22, y: 0 }
        ];
        
        this.tools = [
            { type: TILE_TYPES.EMPTY, name: '空地', color: '#000' },
            { type: TILE_TYPES.BRICK, name: '砖墙', color: '#8b4513' },
            { type: TILE_TYPES.STEEL, name: '钢墙', color: '#808080' },
            { type: TILE_TYPES.WATER, name: '水', color: '#3498db' },
            { type: TILE_TYPES.GRASS, name: '草丛', color: '#27ae60' },
            { type: TILE_TYPES.BASE, name: '基地', color: '#f1c40f' },
            { type: 'player', name: '玩家', color: '#f1c40f' },
            { type: 'enemy', name: '敌人', color: '#e74c3c' }
        ];
        
        this.isDragging = false;
        this.levelName = '自定义关卡';
        
        this.initEmptyMap();
    }
    
    initEmptyMap() {
        this.tiles = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.tiles[row][col] = TILE_TYPES.EMPTY;
            }
        }
        
        this.tiles[22][11] = TILE_TYPES.BASE;
        this.tiles[22][12] = TILE_TYPES.BASE;
        this.tiles[23][11] = TILE_TYPES.BASE;
        this.tiles[23][12] = TILE_TYPES.BASE;
    }
    
    show() {
        this.isActive = true;
        this.initEmptyMap();
    }
    
    hide() {
        this.isActive = false;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const input = this.game.input;
        
        if (input.isKeyPressed('PAUSE')) {
            this.hide();
            this.game.ui.showMenu();
            return;
        }
        
        if (input.isMouseDown('left')) {
            const pos = input.getMousePosition();
            this.handleClick(pos.x, pos.y);
        }
        
        for (let i = 0; i < this.tools.length; i++) {
            if (input.keysDown.has(`Digit${i + 1}`)) {
                this.selectedTool = this.tools[i].type;
            }
        }
    }
    
    handleClick(x, y) {
        if (y < 50) return;
        
        const col = Math.floor(x / TILE_SIZE);
        const row = Math.floor((y - 50) / TILE_SIZE);
        
        if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
        
        if (this.selectedTool === 'player') {
            this.playerSpawn = { x: col, y: row };
        } else if (this.selectedTool === 'enemy') {
        } else {
            this.tiles[row][col] = this.selectedTool;
        }
    }
    
    exportLevel() {
        return {
            name: this.levelName,
            tiles: this.tiles.map(row => [...row]),
            playerSpawn: { ...this.playerSpawn },
            enemySpawns: this.enemySpawns.map(s => ({ ...s })),
            enemies: [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 5 }
            ],
            maxActiveEnemies: 4
        };
    }
    
    importLevel(levelData) {
        this.tiles = levelData.tiles.map(row => [...row]);
        this.playerSpawn = { ...levelData.playerSpawn };
        this.enemySpawns = levelData.enemySpawns.map(s => ({ ...s }));
        this.levelName = levelData.name || '导入的关卡';
    }
    
    saveLevel() {
        const levelData = this.exportLevel();
        return this.game.storage.saveCustomLevel(levelData);
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.renderToolbar(ctx);
        
        ctx.save();
        ctx.translate(0, 50);
        
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tileType = this.tiles[row][col];
                const tile = new Tile(tileType, col, row);
                tile.render(ctx);
            }
        }
        
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(
            this.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2,
            this.playerSpawn.y * TILE_SIZE + TILE_SIZE / 2,
            8, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P',
            this.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2,
            this.playerSpawn.y * TILE_SIZE + TILE_SIZE / 2 + 3
        );
        
        this.enemySpawns.forEach((spawn, index) => {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(
                spawn.x * TILE_SIZE + TILE_SIZE / 2,
                spawn.y * TILE_SIZE + TILE_SIZE / 2,
                8, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(`E${index + 1}`,
                spawn.x * TILE_SIZE + TILE_SIZE / 2,
                spawn.y * TILE_SIZE + TILE_SIZE / 2 + 3
            );
        });
        
        ctx.restore();
    }
    
    renderToolbar(ctx) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, CANVAS_WIDTH, 50);
        
        const toolWidth = 60;
        this.tools.forEach((tool, index) => {
            const x = 10 + index * toolWidth;
            
            if (this.selectedTool === tool.type) {
                ctx.fillStyle = '#555';
                ctx.fillRect(x - 2, 5, toolWidth - 5, 40);
            }
            
            ctx.fillStyle = tool.color;
            ctx.fillRect(x + 5, 10, 20, 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tool.name, x + 25, 42);
            
            ctx.fillStyle = '#888';
            ctx.font = '8px Arial';
            ctx.fillText(`${index + 1}`, x + 5, 10);
        });
        
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('ESC 退出 | 点击放置', CANVAS_WIDTH - 10, 30);
    }
}
