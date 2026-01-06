// 游戏配置常量
const CONFIG = {
    // Canvas尺寸
    CANVAS_WIDTH: 624,
    CANVAS_HEIGHT: 624,
    
    // 网格系统
    TILE_SIZE: 24,
    GRID_WIDTH: 26,
    GRID_HEIGHT: 26,
    
    // 坦克属性
    TANK_SIZE: 24,
    TANK_SPEED: 2,
    PLAYER_HEALTH: 3,
    ENEMY_HEALTH: 1,
    
    // 子弹属性
    BULLET_SIZE: 6,
    BULLET_SPEED: 4,
    SHOOT_COOLDOWN: 500, // 毫秒
    MAX_BULLETS: 20,
    
    // 敌方设置
    INITIAL_ENEMY_COUNT: 5,
    ENEMY_SPAWN_POSITIONS: [
        { x: 0, y: 0 },
        { x: 12, y: 0 },
        { x: 25, y: 0 }
    ],
    
    // 方向枚举
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    // 地图元素类型
    TILE_TYPE: {
        EMPTY: 0,
        BRICK_WALL: 1,
        STEEL_WALL: 2,
        WATER: 3,
        BASE: 4,
        GRASS: 5
    },
    
    // 游戏状态
    GAME_STATE: {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAME_OVER: 3,
        VICTORY: 4
    },
    
    // 颜色配置
    COLORS: {
        PLAYER_TANK: '#00ff00',
        ENEMY_TANK: '#ff0000',
        BRICK_WALL: '#8B4513',
        STEEL_WALL: '#808080',
        WATER: '#0066cc',
        BASE: '#ffcc00',
        GRASS: '#228B22',
        BULLET: '#ffff00',
        BACKGROUND: '#000000'
    }
};

// 方向向量映射
const DIRECTION_VECTORS = {
    [CONFIG.DIRECTION.UP]: { x: 0, y: -1 },
    [CONFIG.DIRECTION.RIGHT]: { x: 1, y: 0 },
    [CONFIG.DIRECTION.DOWN]: { x: 0, y: 1 },
    [CONFIG.DIRECTION.LEFT]: { x: -1, y: 0 }
};
