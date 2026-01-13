import React from 'react';

const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={['#87ceeb', '#8b4513', 0.6]} />
    </>
  );
};

export default Lighting;
