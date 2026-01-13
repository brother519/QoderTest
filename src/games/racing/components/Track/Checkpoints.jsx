import React from 'react';
import { useBox } from '@react-three/cannon';

const Checkpoint = ({ position, index, onCheckpoint }) => {
  const [ref] = useBox(() => ({
    isTrigger: true,
    position,
    args: [15, 5, 2],
    onCollide: () => {
      if (onCheckpoint) {
        onCheckpoint(index);
      }
    },
  }));

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[15, 5, 2]} />
      <meshBasicMaterial transparent opacity={0.3} color="#48bb78" />
    </mesh>
  );
};

const Checkpoints = ({ checkpoints, onCheckpoint }) => {
  return (
    <>
      {checkpoints.map((checkpoint) => (
        <Checkpoint
          key={checkpoint.index}
          position={checkpoint.position}
          index={checkpoint.index}
          onCheckpoint={onCheckpoint}
        />
      ))}
    </>
  );
};

export default Checkpoints;
