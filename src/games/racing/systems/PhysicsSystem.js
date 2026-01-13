import { GAME_CONSTANTS } from '../data/gameConstants.js';

export class PhysicsSystem {
  constructor() {
    this.gravity = GAME_CONSTANTS.PHYSICS.GRAVITY;
    this.fixedTimeStep = GAME_CONSTANTS.PHYSICS.FIXED_TIME_STEP;
    this.maxSubSteps = GAME_CONSTANTS.PHYSICS.MAX_SUB_STEPS;
  }

  getConfig() {
    return {
      gravity: [0, this.gravity, 0],
      defaultContactMaterial: {
        friction: 0.7,
        restitution: 0.3,
      },
    };
  }
}

export const physicsSystem = new PhysicsSystem();
