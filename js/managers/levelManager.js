import { CONFIG } from '../config.js';
import { Obstacle } from '../entities/obstacle.js';
import { Base } from '../entities/base.js';
import { EnemyTank } from '../entities/enemyTank.js';
import { gridToPixel } from '../utils/grid.js';

export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = null;
    }

    async loadLevels() {
        try {
            const response = await fetch('data/levels.json');
            const data = await response.json();
            this.levels = data.levels;
        } catch (error) {
            console.error('Failed to load levels:', error);
            this.createDefaultLevel();
        }
    }

    createDefaultLevel() {
        this.levels = [{
            id: 1,
            name: '关卡1',
            map: this.generateDefaultMap(),
            enemies: [
                { type: 'normal', count: 10 }
            ],
            spawnInterval: 3000,
            maxActiveEnemies: 4
        }];
    }

    generateDefaultMap() {
        const map = Array(CONFIG.GRID_ROWS).fill(null).map(() => 
            Array(CONFIG.GRID_COLS).fill(CONFIG.MAP.EMPTY)
        );
        
        map[24][12] = CONFIG.MAP.BASE;
        map[24][13] = CONFIG.MAP.BASE;
        map[25][12] = CONFIG.MAP.PLAYER_SPAWN;
        
        for (let i = 23; i <= 25; i++) {
            for (let j = 11; j <= 14; j++) {
                if (map[i][j] === CONFIG.MAP.EMPTY) {
                    map[i][j] = CONFIG.MAP.BRICK;
                }
            }
        }
        
        map[0][0] = CONFIG.MAP.ENEMY_SPAWN_1;
        map[0][12] = CONFIG.MAP.ENEMY_SPAWN_2;
        map[0][25] = CONFIG.MAP.ENEMY_SPAWN_3;
        
        for (let i = 5; i < 20; i++) {
            for (let j = 5; j < 21; j++) {
                if (Math.random() < 0.15) {
                    const rand = Math.random();
                    if (rand < 0.7) {
                        map[i][j] = CONFIG.MAP.BRICK;
                    } else if (rand < 0.9) {
                        map[i][j] = CONFIG.MAP.STEEL;
                    } else {
                        map[i][j] = CONFIG.MAP.WATER;
                    }
                }
            }
        }
        
        return map;
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel - 1];
    }

    parseMap(map) {
        const obstacles = [];
        let base = null;
        let playerSpawn = null;
        const enemySpawns = [];
        
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                const cell = map[row][col];
                const pos = gridToPixel(col, row);
                
                switch (cell) {
                    case CONFIG.MAP.BRICK:
                    case CONFIG.MAP.STEEL:
                    case CONFIG.MAP.WATER:
                        obstacles.push(new Obstacle(pos.x, pos.y, cell));
                        break;
                    case CONFIG.MAP.BASE:
                        if (!base) {
                            base = new Base(pos.x, pos.y);
                        }
                        break;
                    case CONFIG.MAP.PLAYER_SPAWN:
                        playerSpawn = pos;
                        break;
                    case CONFIG.MAP.ENEMY_SPAWN_1:
                    case CONFIG.MAP.ENEMY_SPAWN_2:
                    case CONFIG.MAP.ENEMY_SPAWN_3:
                        enemySpawns.push(pos);
                        break;
                }
            }
        }
        
        return { obstacles, base, playerSpawn, enemySpawns };
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    reset() {
        this.currentLevel = 1;
    }
}
