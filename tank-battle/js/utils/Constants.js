// 游戏配置常量
export const GAME_CONFIG = {
    CANVAS_WIDTH: 624,      // 26格 * 24像素
    CANVAS_HEIGHT: 624,
    TILE_SIZE: 24,          // 每个格子24像素
    GRID_SIZE: 26,          // 26x26格子
    FPS: 60,
    FIXED_TIME_STEP: 1000 / 60
};

// 坦克配置
export const TANK_CONFIG = {
    PLAYER_SPEED: 2,
    ENEMY_SPEED_NORMAL: 1.5,
    ENEMY_SPEED_FAST: 2.5,
    ENEMY_SPEED_ARMORED: 1,
    BULLET_SPEED: 4,
    SHOOT_COOLDOWN: 300,
    SPAWN_PROTECTION_TIME: 3000  // 出生保护时间(毫秒)
};

// 方向枚举
export const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 方向向量
export const DIRECTION_VECTORS = {
    [DIRECTION.UP]: { x: 0, y: -1 },
    [DIRECTION.RIGHT]: { x: 1, y: 0 },
    [DIRECTION.DOWN]: { x: 0, y: 1 },
    [DIRECTION.LEFT]: { x: -1, y: 0 }
};

// 地形类型
export const TILE_TYPE = {
    EMPTY: 0,       // 空地
    BRICK: 1,       // 砖墙
    STEEL: 2,       // 钢墙
    RIVER: 3,       // 河流
    GRASS: 4,       // 草丛
    ICE: 5,         // 冰面
    BASE: 9         // 基地
};

// 地形颜色
export const TILE_COLORS = {
    [TILE_TYPE.EMPTY]: '#000000',
    [TILE_TYPE.BRICK]: '#8B4513',
    [TILE_TYPE.STEEL]: '#808080',
    [TILE_TYPE.RIVER]: '#4169E1',
    [TILE_TYPE.GRASS]: '#228B22',
    [TILE_TYPE.ICE]: '#ADD8E6',
    [TILE_TYPE.BASE]: '#FFD700'
};

// 敌人类型
export const ENEMY_TYPE = {
    NORMAL: 'normal',
    FAST: 'fast',
    ARMORED: 'armored'
};

// 敌人配置
export const ENEMY_CONFIG = {
    [ENEMY_TYPE.NORMAL]: {
        speed: 1.5,
        health: 1,
        color: '#C0C0C0',
        score: 100
    },
    [ENEMY_TYPE.FAST]: {
        speed: 2.5,
        health: 1,
        color: '#FFD700',
        score: 200
    },
    [ENEMY_TYPE.ARMORED]: {
        speed: 1,
        health: 3,
        color: '#006400',
        score: 300
    }
};

// 游戏状态
export const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
    LEVEL_TRANSITION: 'level_transition'
};

// 道具类型
export const POWERUP_TYPE = {
    SHIELD: 'shield',       // 护盾
    STAR: 'star',           // 升级
    GRENADE: 'grenade',     // 全屏炸弹
    TIMER: 'timer',         // 冻结敌人
    LIFE: 'life'            // 额外生命
};

// 道具颜色
export const POWERUP_COLORS = {
    [POWERUP_TYPE.SHIELD]: '#00BFFF',
    [POWERUP_TYPE.STAR]: '#FFD700',
    [POWERUP_TYPE.GRENADE]: '#FF4500',
    [POWERUP_TYPE.TIMER]: '#9370DB',
    [POWERUP_TYPE.LIFE]: '#FF69B4'
};

// 玩家初始配置
export const PLAYER_CONFIG = {
    INITIAL_LIVES: 3,
    RESPAWN_DELAY: 1000,
    SPAWN_X: 9,             // 玩家出生点X(格子坐标)
    SPAWN_Y: 24             // 玩家出生点Y(格子坐标)
};

// 敌人刷新点
export const ENEMY_SPAWN_POINTS = [
    { x: 0, y: 0 },
    { x: 12, y: 0 },
    { x: 24, y: 0 }
];

// 按键映射
export const KEY_CODES = {
    UP: ['ArrowUp', 'KeyW'],
    DOWN: ['ArrowDown', 'KeyS'],
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    SHOOT: ['Space'],
    PAUSE: ['KeyP'],
    START: ['Enter']
};
