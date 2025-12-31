import React from 'react';
import { useBox } from '@react-three/cannon';

const Barrier = ({ position, args }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args,
    material: {
      friction: 0.3,
      restitution: 0.8,
    },
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#e53e3e" />
    </mesh>
  );
};

const Barriers = () => {
  const barriers = [
    { position: [-11, 1, -60], args: [2, 2, 150] },
    { position: [11, 1, -60], args: [2, 2, 150] },
    
    { position: [0, 1, 20], args: [24, 2, 2] },
    { position: [0, 1, -140], args: [24, 2, 2] },
  ];

  return (
    <>
      {barriers.map((barrier, index) => (
        <Barrier key={index} {...barrier} />
      ))}
    </>
  );
};

export default Barriers;
