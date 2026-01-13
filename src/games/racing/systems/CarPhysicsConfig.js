import { CAR_CONFIG } from '../data/carConfig.js';

export const CarPhysicsConfig = {
  chassisBody: {
    mass: CAR_CONFIG.BODY.mass,
    position: [0, 1, 0],
    args: [CAR_CONFIG.BODY.width, CAR_CONFIG.BODY.height, CAR_CONFIG.BODY.length],
    linearDamping: 0.3,
    angularDamping: 0.3,
  },
  
  wheelInfo: {
    radius: CAR_CONFIG.WHEEL.radius,
    directionLocal: [0, -1, 0],
    axleLocal: [-1, 0, 0],
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    frictionSlip: 5,
    rollInfluence: 0.01,
    useCustomSlidingRotationalSpeed: true,
    customSlidingRotationalSpeed: -30,
  },
  
  wheels: [
    // Front left
    { position: [-1, 0, 2], isFrontWheel: true },
    // Front right
    { position: [1, 0, 2], isFrontWheel: true },
    // Rear left
    { position: [-1, 0, -2], isFrontWheel: false },
    // Rear right
    { position: [1, 0, -2], isFrontWheel: false },
  ],
};
