const Constants = {
  PLAYER: {
    SPEED: 200,
    JUMP_VELOCITY: -500,
    SIZE_SMALL: { width: 16, height: 32 },
    SIZE_BIG: { width: 16, height: 48 },
    INVINCIBLE_DURATION: 2000
  },
  
  ENEMY: {
    GOOMBA_SPEED: 50,
    KOOPA_SPEED: 60,
    DIE_DURATION: 2000
  },
  
  ITEM: {
    MUSHROOM_SPAWN_VELOCITY_Y: -300,
    MUSHROOM_MOVE_SPEED: 100,
    FIREBALL_SPEED: 300,
    FIREBALL_JUMP: -200,
    FIREBALL_LIFETIME: 5000
  },
  
  SCORE: {
    COIN: 10,
    GOOMBA: 100,
    KOOPA: 200,
    COINS_FOR_LIFE: 100
  },
  
  PHYSICS: {
    GRAVITY_Y: 800,
    BOUNCE_VELOCITY: -300
  },
  
  GAME: {
    WIDTH: 800,
    HEIGHT: 600,
    INITIAL_LIVES: 3
  }
};

export default Constants;
