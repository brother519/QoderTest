// 游戏常量配置
export const CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 520,
    CANVAS_HEIGHT: 520,
    
    // 地图尺寸
    MAP_COLS: 26,
    MAP_ROWS: 26,
    TILE_SIZE: 20,
    
    // 游戏帧率
    FPS: 60,
    FRAME_DURATION: 1000 / 60,
    
    // 坦克属性
    TANK: {
        SIZE: 26,
        PLAYER_SPEED: 2,
        ENEMY_SPEED: 1.5,
        SHOOT_COOLDOWN: 30, // 30帧
        SPAWN_INVINCIBLE_TIME: 180, // 3秒
        MAX_LIVES: 9
    },
    
    // 子弹属性
    BULLET: {
        SIZE: 6,
        SPEED: 4,
        MAX_COUNT: 2 // 每个坦克最多同时存在的子弹数
    },
    
    // 敌方坦克配置
    ENEMY: {
        MAX_SIMULTANEOUS: 4, // 同时最多存在的敌方坦克数
        TOTAL_PER_LEVEL: 20, // 每关敌方坦克总数
        SPAWN_INTERVAL: 120 // 生成间隔帧数
    },
    
    // 道具配置
    POWERUP: {
        HELMET_DURATION: 600, // 10秒
        CLOCK_DURATION: 480, // 8秒
        SHOVEL_DURATION: 900, // 15秒
        SPAWN_CHANCE: 0.2 // 20%概率掉落
    },
    
    // 方向枚举
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    // 坦克类型
    TANK_TYPE: {
        PLAYER1: 0,
        PLAYER2: 1,
        ENEMY_BASIC: 2,
        ENEMY_FAST: 3,
        ENEMY_POWER: 4,
        ENEMY_ARMOR: 5
    },
    
    // 地图元素类型
    TILE_TYPE: {
        EMPTY: 0,
        BRICK: 1,
        STEEL: 2,
        WATER: 3,
        GRASS: 4,
        ICE: 5,
        BASE: 9
    },
    
    // 道具类型
    POWERUP_TYPE: {
        HELMET: 0,
        CLOCK: 1,
        BOMB: 2,
        SHOVEL: 3,
        TANK: 4,
        STAR: 5
    },
    
    // 游戏状态
    GAME_STATE: {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAMEOVER: 3,
        LEVEL_COMPLETE: 4
    },
    
    // 出生点位置
    SPAWN_POINTS: {
        PLAYER1: { x: 8, y: 24 },
        PLAYER2: { x: 16, y: 24 },
        ENEMY: [
            { x: 0, y: 0 },
            { x: 12, y: 0 },
            { x: 24, y: 0 }
        ]
    },
    
    // 基地位置
    BASE_POSITION: { x: 12, y: 24 },
    
    // 得分
    SCORE: {
        BASIC_TANK: 100,
        FAST_TANK: 200,
        POWER_TANK: 300,
        ARMOR_TANK: 400,
        POWERUP_TANK: 500,
        LEVEL_COMPLETE: 1000
    }
};

// 键位映射
export const KEYS = {
    // 玩家1
    P1_UP: ['w', 'W'],
    P1_DOWN: ['s', 'S'],
    P1_LEFT: ['a', 'A'],
    P1_RIGHT: ['d', 'D'],
    P1_SHOOT: ['j', 'J'],
    
    // 玩家2
    P2_UP: ['ArrowUp'],
    P2_DOWN: ['ArrowDown'],
    P2_LEFT: ['ArrowLeft'],
    P2_RIGHT: ['ArrowRight'],
    P2_SHOOT: ['1'],
    
    // 系统
    PAUSE: ['p', 'P', 'Escape'],
    SPACE: [' ']
};
