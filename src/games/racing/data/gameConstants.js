export const GAME_CONSTANTS = {
  MAX_SPEED: 200,
  ACCELERATION: 50,
  BRAKE_FORCE: 100,
  TURN_SPEED: 0.5,
  DRIFT_FRICTION: 0.3,
  NORMAL_FRICTION: 0.7,
  DRIFT_SPEED_THRESHOLD: 60,
  DRIFT_ANGLE_THRESHOLD: 15,
  
  NITRO_MAX: 100,
  NITRO_CONSUMPTION: 20,
  NITRO_GAIN_RATE: 10,
  NITRO_SPEED_MULTIPLIER: 1.5,
  NITRO_MAX_SPEED: 250,
  
  TOTAL_LAPS: 3,
  
  PHYSICS: {
    GRAVITY: -30,
    FIXED_TIME_STEP: 1 / 60,
    MAX_SUB_STEPS: 3,
  },
  
  CAMERA: {
    OFFSET_DISTANCE: 10,
    OFFSET_HEIGHT: 5,
    SMOOTHNESS: 0.1,
  },
};

export const CONTROLS = {
  FORWARD: ['w', 'W', 'ArrowUp'],
  BACKWARD: ['s', 'S', 'ArrowDown'],
  LEFT: ['a', 'A', 'ArrowLeft'],
  RIGHT: ['d', 'D', 'ArrowRight'],
  NITRO: ['Shift'],
  DRIFT: [' '], // Space
};

export const GAME_STATES = {
  NOT_STARTED: 'not_started',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  PAUSED: 'paused',
  FINISHED: 'finished',
};
