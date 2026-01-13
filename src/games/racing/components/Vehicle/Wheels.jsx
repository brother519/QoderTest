import React from 'react';
import { useCylinder } from '@react-three/cannon';
import { CAR_CONFIG } from '../../data/carConfig.js';

const Wheel = ({ position }) => {
  const [ref] = useCylinder(() => ({
    mass: CAR_CONFIG.WHEEL.mass,
    position,
    args: [CAR_CONFIG.WHEEL.radius, CAR_CONFIG.WHEEL.radius, CAR_CONFIG.WHEEL.width, 16],
    rotation: [0, 0, Math.PI / 2],
  }));

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[CAR_CONFIG.WHEEL.radius, CAR_CONFIG.WHEEL.radius, CAR_CONFIG.WHEEL.width, 16]} />
      <meshStandardMaterial color={CAR_CONFIG.WHEEL.color} />
    </mesh>
  );
};

const Wheels = ({ wheelRefs }) => {
  const positions = [
    [-1, 0.4, 2],   // Front left
    [1, 0.4, 2],    // Front right
    [-1, 0.4, -2],  // Rear left
    [1, 0.4, -2],   // Rear right
  ];

  return (
    <>
      {positions.map((pos, index) => (
        <Wheel key={index} position={pos} ref={wheelRefs[index]} />
      ))}
    </>
  );
};

export default Wheels;
