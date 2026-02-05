// 游戏常量配置
const Constants = {
    // Canvas尺寸
    CANVAS_WIDTH: 416,
    CANVAS_HEIGHT: 416,
    
    // 网格和尺寸
    TILE_SIZE: 16,
    GRID_COLS: 26,
    GRID_ROWS: 26,
    
    // 坦克尺寸和速度
    TANK_SIZE: 26,
    TANK_SPEED: 2,
    TANK_GRID_ALIGN: 8, // 转向时对齐到8像素网格
    
    // 子弹
    BULLET_SIZE: 4,
    BULLET_SPEED: 4,
    FIRE_COOLDOWN: 500, // 毫秒
    
    // 方向常量
    DIRECTION: {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    },
    
    // 方向向量
    DIRECTION_VECTORS: [
        { x: 0, y: -1 },  // UP
        { x: 1, y: 0 },   // RIGHT
        { x: 0, y: 1 },   // DOWN
        { x: -1, y: 0 }   // LEFT
    ],
    
    // 地图块类型
    TILE_TYPE: {
        EMPTY: 0,
        BRICK: 1,
        STEEL: 2,
        WATER: 3,
        FOREST: 4,
        BASE: 5
    },
    
    // 游戏状态
    GAME_STATE: {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAME_OVER: 3,
        VICTORY: 4
    },
    
    // 坦克类型
    TANK_TYPE: {
        PLAYER: 0,
        ENEMY_NORMAL: 1,
        ENEMY_FAST: 2,
        ENEMY_ARMOR: 3,
        ENEMY_BONUS: 4
    },
    
    // 游戏配置
    PLAYER_LIVES: 3,
    ENEMIES_PER_LEVEL: 20,
    MAX_ENEMIES_ON_SCREEN: 4,
    ENEMY_SPAWN_COOLDOWN: 3000, // 毫秒
    
    // 生成点位置
    SPAWN_POINTS: [
        { x: 0, y: 0 },           // 左上
        { x: 200, y: 0 },         // 中上
        { x: 400 - 26, y: 0 }     // 右上
    ],
    
    // 玩家出生点
    PLAYER_SPAWN: { x: 128, y: 384 },
    
    // 基地位置
    BASE_POSITION: { x: 192, y: 384 },
    
    // 颜色配置（FC经典配色）
    COLORS: {
        PLAYER_TANK: '#FFD700',      // 金黄色
        ENEMY_TANK: '#808080',       // 灰色
        ENEMY_FAST: '#FFFFFF',       // 白色
        ENEMY_ARMOR: '#00FF00',      // 绿色
        ENEMY_BONUS: '#FF0000',      // 红色
        BULLET: '#FFFF00',           // 黄色
        BRICK: '#D2691E',            // 砖色
        STEEL: '#C0C0C0',            // 钢色
        WATER: '#4169E1',            // 蓝色
        FOREST: '#228B22',           // 绿色
        BASE: '#FFD700',             // 金色
        BACKGROUND: '#000000'        // 黑色
    },
    
    // 分数
    SCORES: {
        ENEMY_NORMAL: 100,
        ENEMY_FAST: 200,
        ENEMY_ARMOR: 300,
        ENEMY_BONUS: 500
    }
};
