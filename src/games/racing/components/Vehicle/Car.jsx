import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { CAR_CONFIG } from '../../data/carConfig.js';
import Wheels from './Wheels.jsx';

const Car = ({ position = [0, 1, 0], rotation = [0, 0, 0], controls, onUpdate }) => {
  const [bodyRef, bodyApi] = useBox(() => ({
    mass: CAR_CONFIG.BODY.mass,
    position,
    rotation,
    args: [CAR_CONFIG.BODY.width, CAR_CONFIG.BODY.height, CAR_CONFIG.BODY.length],
    linearDamping: 0.3,
    angularDamping: 0.3,
  }));

  const wheelRefs = [useRef(), useRef(), useRef(), useRef()];

  return (
    <group>
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[CAR_CONFIG.BODY.width, CAR_CONFIG.BODY.height, CAR_CONFIG.BODY.length]} />
        <meshStandardMaterial color={CAR_CONFIG.BODY.color} />
      </mesh>
      
      <Wheels wheelRefs={wheelRefs} />
    </group>
  );
};

export default Car;
