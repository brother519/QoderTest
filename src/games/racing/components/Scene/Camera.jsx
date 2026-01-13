import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { lerp } from '../../utils/math.js';
import { GAME_CONSTANTS } from '../../data/gameConstants.js';

const Camera = ({ target, offset = GAME_CONSTANTS.CAMERA.OFFSET_DISTANCE }) => {
  const { camera } = useThree();
  const smoothPosition = useRef([0, 0, 0]);
  const smoothTarget = useRef([0, 0, 0]);

  useEffect(() => {
    if (target) {
      smoothPosition.current = [
        target.position[0],
        target.position[1] + GAME_CONSTANTS.CAMERA.OFFSET_HEIGHT,
        target.position[2] + offset
      ];
      smoothTarget.current = target.position;
    }
  }, [target, offset]);

  useFrame(() => {
    if (!target) return;

    const targetPos = [
      target.position[0] - Math.sin(target.rotation[1]) * offset,
      target.position[1] + GAME_CONSTANTS.CAMERA.OFFSET_HEIGHT,
      target.position[2] - Math.cos(target.rotation[1]) * offset
    ];

    smoothPosition.current = [
      lerp(smoothPosition.current[0], targetPos[0], GAME_CONSTANTS.CAMERA.SMOOTHNESS),
      lerp(smoothPosition.current[1], targetPos[1], GAME_CONSTANTS.CAMERA.SMOOTHNESS),
      lerp(smoothPosition.current[2], targetPos[2], GAME_CONSTANTS.CAMERA.SMOOTHNESS)
    ];

    smoothTarget.current = [
      lerp(smoothTarget.current[0], target.position[0], GAME_CONSTANTS.CAMERA.SMOOTHNESS),
      lerp(smoothTarget.current[1], target.position[1], GAME_CONSTANTS.CAMERA.SMOOTHNESS),
      lerp(smoothTarget.current[2], target.position[2], GAME_CONSTANTS.CAMERA.SMOOTHNESS)
    ];

    camera.position.set(...smoothPosition.current);
    camera.lookAt(...smoothTarget.current);
  });

  return null;
};

export default Camera;
