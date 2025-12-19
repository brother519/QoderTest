export const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  FPS_TARGET: 60,
  
  GAME_STATES: {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  },
  
  PLAYER: {
    WIDTH: 64,
    HEIGHT: 64,
    SPEED: 5,
    MAX_HEALTH: 5,
    FIRE_RATE: 200,
    COLOR: '#00ff00'
  },
  
  ENEMY: {
    SMALL: {
      WIDTH: 48,
      HEIGHT: 48,
      HEALTH: 1,
      SPEED: 2,
      SCORE: 10,
      COLOR: '#ff0000'
    },
    MEDIUM: {
      WIDTH: 56,
      HEIGHT: 56,
      HEALTH: 3,
      SPEED: 2.5,
      SCORE: 50,
      COLOR: '#ff6600'
    },
    LARGE: {
      WIDTH: 72,
      HEIGHT: 72,
      HEALTH: 10,
      SPEED: 1.5,
      SCORE: 100,
      COLOR: '#ff3333'
    }
  },
  
  BULLET: {
    WIDTH: 8,
    HEIGHT: 16,
    SPEED: 10,
    DAMAGE: 1,
    COLOR: '#ffff00'
  },
  
  POWERUP: {
    WIDTH: 32,
    HEIGHT: 32,
    SPEED: 2,
    TYPES: {
      HEALTH: 'health',
      FIRE_POWER: 'firePower',
      SHIELD: 'shield',
      BOMB: 'bomb'
    }
  },
  
  PARTICLE: {
    COUNT: 10,
    LIFETIME: 60,
    SPEED: 3
  },
  
  COLLISION: {
    GRID_SIZE: 100
  }
};
