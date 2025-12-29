export const CONSTANTS = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    
    GRAVITY: 980,
    MAX_FALL_SPEED: 600,
    
    TILE_SIZE: 16,
    
    PLAYER: {
        WIDTH: 16,
        HEIGHT: 16,
        BIG_HEIGHT: 32,
        
        MOVE_SPEED: 150,
        RUN_SPEED: 250,
        ACCELERATION: 800,
        FRICTION: 600,
        
        JUMP_FORCE: 400,
        JUMP_HOLD_BOOST: 200,
        MAX_JUMP_TIME: 0.3,
        
        INVINCIBLE_TIME: 2.0,
        STAR_TIME: 10.0,
        
        STATES: {
            SMALL: 'small',
            BIG: 'big',
            FIRE: 'fire'
        }
    },
    
    ENEMY: {
        GOOMBA: {
            WIDTH: 16,
            HEIGHT: 16,
            SPEED: 30,
            STOMP_TIME: 0.5
        },
        KOOPA: {
            WIDTH: 16,
            HEIGHT: 24,
            SPEED: 40,
            SHELL_SPEED: 200,
            REVIVE_TIME: 10.0
        },
        PIRANHA: {
            WIDTH: 16,
            HEIGHT: 24,
            RISE_TIME: 2.0,
            VISIBLE_TIME: 3.0,
            LOWER_TIME: 2.0,
            HIDDEN_TIME: 3.0
        }
    },
    
    ITEM: {
        COIN: {
            WIDTH: 16,
            HEIGHT: 16,
            SCORE: 100
        },
        MUSHROOM: {
            WIDTH: 16,
            HEIGHT: 16,
            SPEED: 60,
            SCORE: 1000
        },
        FIRE_FLOWER: {
            WIDTH: 16,
            HEIGHT: 16,
            SCORE: 1000
        },
        STAR: {
            WIDTH: 16,
            HEIGHT: 16,
            SPEED: 80,
            SCORE: 1000
        }
    },
    
    FIREBALL: {
        WIDTH: 8,
        HEIGHT: 8,
        SPEED: 200,
        GRAVITY: 600,
        BOUNCE_FORCE: 300,
        LIFETIME: 3.0
    },
    
    BLOCK: {
        WIDTH: 16,
        HEIGHT: 16,
        BUMP_HEIGHT: 8,
        BUMP_TIME: 0.2
    },
    
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
        LEVEL_COMPLETE: 'levelComplete'
    },
    
    KEYS: {
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        JUMP: ['Space', 'KeyZ'],
        RUN: ['ShiftLeft', 'ShiftRight', 'KeyX'],
        PAUSE: ['Escape', 'KeyP']
    },
    
    CAMERA: {
        FOLLOW_SPEED: 0.1,
        DEAD_ZONE_Y: 100,
        OFFSET_X: 200
    },
    
    TILE_TYPES: {
        AIR: 0,
        GROUND: 1,
        BRICK: 2,
        STONE: 3,
        PIPE_TOP_LEFT: 4,
        PIPE_TOP_RIGHT: 5,
        PIPE_BODY_LEFT: 6,
        PIPE_BODY_RIGHT: 7
    },
    
    COLLISION_DIRS: {
        NONE: 0,
        TOP: 1,
        BOTTOM: 2,
        LEFT: 3,
        RIGHT: 4
    }
};

export default CONSTANTS;
