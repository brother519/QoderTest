export const CONFIG = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 0.1,
    
    PLAYER: {
        WIDTH: 30,
        HEIGHT: 30,
        SPEED: 250,
        MAX_HEALTH: 5,
        SHOOT_COOLDOWN: 0.2,
        INVINCIBLE_TIME: 2,
        COLOR: '#00aaff',
        ENGINE_COLOR: '#ffffff'
    },
    
    BULLET: {
        PLAYER: {
            WIDTH: 4,
            HEIGHT: 10,
            SPEED: 400,
            COLOR: '#ffff00',
            DAMAGE: 1
        },
        ENEMY: {
            WIDTH: 6,
            HEIGHT: 6,
            SPEED: 200,
            COLOR: '#ff4444',
            DAMAGE: 1
        }
    },
    
    ENEMY: {
        SMALL: {
            WIDTH: 25,
            HEIGHT: 25,
            SPEED: 100,
            HEALTH: 1,
            SCORE: 100,
            SHOOT_INTERVAL: 3,
            COLOR: '#ff4444'
        },
        MEDIUM: {
            WIDTH: 35,
            HEIGHT: 35,
            SPEED: 80,
            HEALTH: 3,
            SCORE: 300,
            SHOOT_INTERVAL: 2,
            COLOR: '#ff6644'
        },
        FAST: {
            WIDTH: 20,
            HEIGHT: 20,
            SPEED: 200,
            HEALTH: 2,
            SCORE: 200,
            SHOOT_INTERVAL: 0,
            COLOR: '#ff8844'
        }
    },
    
    BOSS: {
        WIDTH: 80,
        HEIGHT: 80,
        SPEED: 60,
        BASE_HEALTH: 50,
        SCORE: 5000,
        COLOR: '#ff0000'
    },
    
    POWERUP: {
        WIDTH: 25,
        HEIGHT: 25,
        SPEED: 60,
        HEALTH: {
            COLOR: '#00ff44',
            PROBABILITY: 0.15,
            HEAL_AMOUNT: 1
        },
        WEAPON: {
            COLOR: '#ff8800',
            PROBABILITY: 0.10
        },
        SHIELD: {
            COLOR: '#00aaff',
            PROBABILITY: 0.08,
            HITS: 3,
            DURATION: 15
        }
    },
    
    PARTICLE: {
        COUNT: 8,
        MIN_SPEED: 30,
        MAX_SPEED: 100,
        MIN_SIZE: 2,
        MAX_SIZE: 5,
        LIFETIME: 0.8
    },
    
    LEVEL: {
        WAVES_PER_LEVEL: 5,
        ENEMIES_PER_WAVE_BASE: 4,
        WAVE_INTERVAL: 3,
        DIFFICULTY_MULTIPLIER: 1.2
    },
    
    COMBO: {
        TIMEOUT: 2,
        MULTIPLIERS: [
            { min: 2, max: 5, mult: 1.2 },
            { min: 6, max: 10, mult: 1.5 },
            { min: 11, max: 20, mult: 2.0 },
            { min: 21, max: Infinity, mult: 3.0 }
        ]
    },
    
    WEAPON_LEVELS: [
        { bullets: 1, spread: 0 },
        { bullets: 2, spread: 15 },
        { bullets: 3, spread: 20 },
        { bullets: 5, spread: 25 }
    ]
};
