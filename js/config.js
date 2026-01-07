// 游戏配置常量

// Canvas配置
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// 游戏状态
export const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

// 玩家配置
export const PLAYER_CONFIG = {
    width: 40,
    height: 40,
    speed: 5,
    health: 5,
    shootInterval: 300, // 毫秒
    bulletSpeed: 8,
    color: '#00ff00'
};

// 子弹配置
export const BULLET_CONFIG = {
    width: 4,
    height: 12,
    speed: 8,
    color: '#ffff00'
};

// 敌机配置
export const ENEMY_TYPES = {
    SMALL: {
        width: 30,
        height: 30,
        health: 1,
        speed: 2,
        score: 10,
        color: '#ff0000',
        shootInterval: 0, // 不射击
        movePattern: 'straight'
    },
    MEDIUM: {
        width: 40,
        height: 40,
        health: 3,
        speed: 1.5,
        score: 50,
        color: '#ff6600',
        shootInterval: 2000,
        movePattern: 'sine'
    },
    LARGE: {
        width: 50,
        height: 50,
        health: 5,
        speed: 1,
        score: 100,
        color: '#ff00ff',
        shootInterval: 1500,
        movePattern: 'zigzag'
    }
};

// 敌机子弹配置
export const ENEMY_BULLET_CONFIG = {
    width: 4,
    height: 10,
    speed: 4,
    color: '#ff0000'
};

// 道具配置
export const POWERUP_TYPES = {
    HEALTH: {
        width: 25,
        height: 25,
        speed: 2,
        color: '#ff0000',
        dropRate: 0.15, // 15%概率掉落
        effect: 'health'
    },
    FIREPOWER: {
        width: 25,
        height: 25,
        speed: 2,
        color: '#ffff00',
        dropRate: 0.10, // 10%概率
        effect: 'firepower'
    },
    SHIELD: {
        width: 25,
        height: 25,
        speed: 2,
        color: '#00ffff',
        dropRate: 0.08, // 8%概率
        effect: 'shield'
    }
};

// 关卡配置
export const LEVEL_CONFIG = [
    { level: 1, enemyInterval: 2000, enemySpeed: 1.0, scoreThreshold: 200, bossLevel: false },
    { level: 2, enemyInterval: 1800, enemySpeed: 1.2, scoreThreshold: 500, bossLevel: false },
    { level: 3, enemyInterval: 1500, enemySpeed: 1.4, scoreThreshold: 1000, bossLevel: true },
    { level: 4, enemyInterval: 1300, enemySpeed: 1.5, scoreThreshold: 1500, bossLevel: false },
    { level: 5, enemyInterval: 1200, enemySpeed: 1.6, scoreThreshold: 2200, bossLevel: false },
    { level: 6, enemyInterval: 1000, enemySpeed: 1.8, scoreThreshold: 3000, bossLevel: true },
];

// Boss配置
export const BOSS_CONFIG = {
    width: 120,
    height: 100,
    health: 150,
    speed: 2,
    score: 1000,
    color: '#ff0000',
    shootInterval: 500,
    phaseThresholds: [0.7, 0.4] // 70%和40%血量时切换阶段
};

// 火力等级配置
export const FIREPOWER_LEVELS = {
    1: { bulletCount: 1, spread: 0 },      // 单发
    2: { bulletCount: 2, spread: 20 },     // 双发
    3: { bulletCount: 3, spread: 15 }      // 三发扇形
};

// 对象池大小
export const POOL_SIZES = {
    PLAYER_BULLETS: 50,
    ENEMY_BULLETS: 100,
    ENEMIES: 30,
    POWERUPS: 10
};

// 游戏平衡参数
export const GAME_BALANCE = {
    invincibilityDuration: 2000, // 玩家受伤后无敌时间(毫秒)
    powerUpDuration: 0, // 道具持续时间,0表示永久
    bossWarningDuration: 3000 // Boss出现警告时间
};
