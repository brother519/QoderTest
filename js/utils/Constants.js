// 游戏常量配置
export const Constants = {
    // 画布尺寸
    CANVAS_WIDTH: 416,
    CANVAS_HEIGHT: 416,
    
    // 瓦片和坦克尺寸
    TILE_SIZE: 16,
    TANK_SIZE: 32,
    BULLET_SIZE: 8,
    
    // 玩家属性
    PLAYER_SPEED: 100,
    PLAYER_FIRE_RATE: 0.3,
    PLAYER_LIVES: 3,
    PLAYER_INVINCIBLE_TIME: 3,
    
    // 敌人属性
    ENEMY_SPEED: 60,
    ENEMY_FIRE_RATE: 1.5,
    ENEMY_SPAWN_DELAY: 3,
    MAX_ENEMIES_ON_SCREEN: 4,
    
    // 子弹属性
    BULLET_SPEED: 200,
    
    // AI属性
    AI_DECISION_INTERVAL: 0.8,
    
    // 方向枚举
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    // 瓦片类型枚举
    TILE_TYPE: {
        EMPTY: 0,
        BRICK: 1,
        STEEL: 2,
        WATER: 3,
        GRASS: 4,
        BASE: 5
    },
    
    // 游戏状态枚举
    GAME_STATE: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        WIN: 'win'
    },
    
    // 颜色配置
    COLORS: {
        BACKGROUND: '#000000',
        BRICK: '#8B4513',
        BRICK_DARK: '#654321',
        STEEL: '#808080',
        STEEL_LIGHT: '#A9A9A9',
        WATER: '#1E90FF',
        WATER_LIGHT: '#00BFFF',
        GRASS: '#228B22',
        GRASS_LIGHT: '#32CD32',
        PLAYER_TANK: '#FFD700',
        PLAYER_TANK_DARK: '#DAA520',
        ENEMY_TANK: '#DC143C',
        ENEMY_TANK_DARK: '#8B0000',
        BULLET: '#FFFFFF',
        BASE: '#FFD700',
        BASE_DARK: '#B8860B',
        EXPLOSION: '#FF4500'
    }
};

// 方向向量映射
export const DirectionVectors = {
    [Constants.DIRECTION.UP]: { x: 0, y: -1 },
    [Constants.DIRECTION.RIGHT]: { x: 1, y: 0 },
    [Constants.DIRECTION.DOWN]: { x: 0, y: 1 },
    [Constants.DIRECTION.LEFT]: { x: -1, y: 0 }
};
