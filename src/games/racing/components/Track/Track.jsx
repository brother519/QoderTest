import React from 'react';
import { usePlane } from '@react-three/cannon';
import { TRACK_DATA } from '../../data/trackData.js';
import Barriers from './Barriers.jsx';
import Checkpoints from './Checkpoints.jsx';

const Track = ({ onCheckpoint }) => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: {
      friction: 0.7,
      restitution: 0.3,
    },
  }));

  return (
    <group>
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      <mesh position={[0, 0.01, -60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[15, 35, 64]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 150]} />
        <meshStandardMaterial color="#1a202c" opacity={0.8} transparent />
      </mesh>

      <Barriers />
      <Checkpoints checkpoints={TRACK_DATA.checkpoints} onCheckpoint={onCheckpoint} />
    </group>
  );
};

export default Track;
