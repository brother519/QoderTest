export const CAR_CONFIG = {
  BODY: {
    mass: 1500,
    width: 2,
    height: 1,
    length: 4,
    color: '#ff4444',
  },
  
  WHEEL: {
    radius: 0.4,
    width: 0.3,
    mass: 50,
    color: '#333333',
  },
  
  ENGINE: {
    maxForce: 5000,
    maxSpeed: 200,
    acceleration: 50,
    brakeForce: 100,
  },
  
  STEERING: {
    maxAngle: Math.PI / 6, // 30 degrees
    turnSpeed: 0.5,
  },
};
