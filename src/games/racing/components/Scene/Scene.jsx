import React from 'react';
import Lighting from './Lighting.jsx';
import Camera from './Camera.jsx';

const Scene = ({ carRef, children }) => {
  return (
    <>
      <Lighting />
      <Camera target={carRef?.current} />
      
      <fog attach="fog" args={['#87ceeb', 50, 500]} />
      
      {children}
    </>
  );
};

export default Scene;
