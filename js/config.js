export const CONFIG = {
    CANVAS_WIDTH: 832,
    CANVAS_HEIGHT: 832,
    GRID_SIZE: 32,
    GRID_COLS: 26,
    GRID_ROWS: 26,
    
    FPS: 60,
    FIXED_TIME_STEP: 1000 / 60,
    
    PLAYER: {
        SPEED: 2,
        LIVES: 3,
        SHOOT_COOLDOWN: 500,
        COLOR: '#FFD700',
        SIZE: 28
    },
    
    ENEMY: {
        NORMAL: {
            SPEED: 1,
            SHOOT_COOLDOWN: 1500,
            COLOR: '#FF4444',
            HEALTH: 1
        },
        FAST: {
            SPEED: 2,
            SHOOT_COOLDOWN: 1200,
            COLOR: '#FF8844',
            HEALTH: 1
        },
        HEAVY: {
            SPEED: 0.8,
            SHOOT_COOLDOWN: 2000,
            COLOR: '#884444',
            HEALTH: 3
        }
    },
    
    BULLET: {
        SPEED: 4,
        DAMAGE: 1,
        SIZE: 6,
        COLOR: '#FFFFFF'
    },
    
    BASE: {
        SIZE: 32,
        COLOR: '#00FF00',
        HEALTH: 1
    },
    
    OBSTACLE: {
        BRICK: {
            TYPE: 1,
            COLOR: '#CD853F',
            DESTRUCTIBLE: true,
            BLOCKS_TANK: true,
            BLOCKS_BULLET: true
        },
        STEEL: {
            TYPE: 2,
            COLOR: '#808080',
            DESTRUCTIBLE: false,
            BLOCKS_TANK: true,
            BLOCKS_BULLET: true
        },
        WATER: {
            TYPE: 3,
            COLOR: '#4169E1',
            DESTRUCTIBLE: false,
            BLOCKS_TANK: true,
            BLOCKS_BULLET: false
        }
    },
    
    MAP: {
        EMPTY: 0,
        BRICK: 1,
        STEEL: 2,
        WATER: 3,
        BASE: 5,
        PLAYER_SPAWN: 6,
        ENEMY_SPAWN_1: 7,
        ENEMY_SPAWN_2: 8,
        ENEMY_SPAWN_3: 9
    },
    
    KEYS: {
        UP: 'KeyW',
        DOWN: 'KeyS',
        LEFT: 'KeyA',
        RIGHT: 'KeyD',
        SHOOT: 'Space',
        PAUSE: 'Escape'
    },
    
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    GAME_STATE: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        WIN: 'win',
        LOSE: 'lose'
    },
    
    SPAWN: {
        INTERVAL: 3000,
        MAX_ACTIVE_ENEMIES: 4
    }
};
