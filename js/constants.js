export const CANVAS_WIDTH = 624;
export const CANVAS_HEIGHT = 624;

export const TILE_SIZE = 26;
export const HALF_TILE = TILE_SIZE / 2;
export const GRID_COLS = 24;
export const GRID_ROWS = 24;

export const GAME_STATES = {
    MENU: 'menu',
    LOADING: 'loading',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_WIN: 'level_win',
    GAMEOVER: 'gameover',
    WIN: 'win'
};

export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

export const DIRECTION_VECTORS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

export const TILE_TYPES = {
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    WATER: 3,
    GRASS: 4,
    BASE: 5,
    BASE_DESTROYED: 6
};

export const TANK_TYPES = {
    PLAYER: 'player',
    BASIC: 'basic',
    FAST: 'fast',
    POWER: 'power',
    ARMOR: 'armor'
};

export const POWERUP_TYPES = {
    SHIELD: 'shield',
    SPEED: 'speed',
    POWER: 'power',
    LIFE: 'life',
    BOMB: 'bomb',
    TIMER: 'timer'
};

export const TANK_SPEED = 100;
export const BULLET_SPEED = 300;
export const TANK_SIZE = 24;
export const BULLET_SIZE = 6;

export const FIRE_COOLDOWN = 500;
export const MAX_PLAYER_BULLETS = 2;
export const MAX_ENEMY_BULLETS = 1;

export const PLAYER_LIVES = 3;
export const MAX_ACTIVE_ENEMIES = 4;

export const POWERUP_DURATION = 10000;
export const POWERUP_SPAWN_CHANCE = 0.2;

export const COLORS = {
    PLAYER_TANK: '#f1c40f',
    ENEMY_BASIC: '#95a5a6',
    ENEMY_FAST: '#3498db',
    ENEMY_POWER: '#e74c3c',
    ENEMY_ARMOR: '#27ae60',
    BULLET: '#fff',
    BRICK: '#8b4513',
    STEEL: '#808080',
    WATER: '#3498db',
    GRASS: '#27ae60',
    BASE: '#f1c40f',
    BASE_DESTROYED: '#666'
};

export const KEYS = {
    UP: ['ArrowUp', 'KeyW'],
    DOWN: ['ArrowDown', 'KeyS'],
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    FIRE: ['Space', 'KeyJ'],
    PAUSE: ['Escape'],
    CONFIRM: ['Enter']
};
