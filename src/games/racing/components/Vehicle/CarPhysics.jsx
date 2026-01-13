import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { GAME_CONSTANTS } from '../../data/gameConstants.js';
import { CAR_CONFIG } from '../../data/carConfig.js';

const CarPhysics = ({ position, rotation, controls, nitroActive, isDrifting, onUpdate }) => {
  const [ref, api] = useBox(() => ({
    mass: CAR_CONFIG.BODY.mass,
    position,
    rotation,
    args: [CAR_CONFIG.BODY.width, CAR_CONFIG.BODY.height, CAR_CONFIG.BODY.length],
    linearDamping: 0.3,
    angularDamping: 0.3,
  }));

  const velocity = useRef([0, 0, 0]);
  const currentPosition = useRef(position);
  const currentRotation = useRef(rotation);

  useEffect(() => {
    const unsubscribeVel = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    const unsubscribePos = api.position.subscribe((p) => {
      currentPosition.current = p;
    });
    const unsubscribeRot = api.rotation.subscribe((r) => {
      currentRotation.current = r;
    });

    return () => {
      unsubscribeVel();
      unsubscribePos();
      unsubscribeRot();
    };
  }, [api]);

  useFrame((state, delta) => {
    const speed = Math.sqrt(
      velocity.current[0] ** 2 + 
      velocity.current[2] ** 2
    ) * 3.6;

    let force = 0;
    let torque = 0;

    if (controls.forward) {
      const maxForce = nitroActive ? 
        CAR_CONFIG.ENGINE.maxForce * GAME_CONSTANTS.NITRO_SPEED_MULTIPLIER : 
        CAR_CONFIG.ENGINE.maxForce;
      force = maxForce;
    }
    if (controls.backward) {
      force = -CAR_CONFIG.ENGINE.maxForce * 0.5;
    }

    if (controls.left && speed > 5) {
      torque = CAR_CONFIG.STEERING.turnSpeed;
    }
    if (controls.right && speed > 5) {
      torque = -CAR_CONFIG.STEERING.turnSpeed;
    }

    const rotation = currentRotation.current;
    const forceX = Math.sin(rotation[1]) * force;
    const forceZ = Math.cos(rotation[1]) * force;

    api.applyForce([forceX, 0, forceZ], [0, 0, 0]);
    api.applyTorque([0, torque, 0]);

    const maxSpeed = nitroActive ? GAME_CONSTANTS.NITRO_MAX_SPEED : GAME_CONSTANTS.MAX_SPEED;
    if (speed > maxSpeed) {
      api.velocity.set(
        velocity.current[0] * 0.95,
        velocity.current[1],
        velocity.current[2] * 0.95
      );
    }

    if (isDrifting) {
      const lateralVel = velocity.current[0] * Math.cos(rotation[1]) - 
                        velocity.current[2] * Math.sin(rotation[1]);
      api.velocity.set(
        velocity.current[0] - lateralVel * Math.cos(rotation[1]) * 0.3,
        velocity.current[1],
        velocity.current[2] + lateralVel * Math.sin(rotation[1]) * 0.3
      );
    }

    if (onUpdate) {
      onUpdate({
        position: currentPosition.current,
        rotation: currentRotation.current,
        velocity: velocity.current,
        speed,
      });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[CAR_CONFIG.BODY.width, CAR_CONFIG.BODY.height, CAR_CONFIG.BODY.length]} />
      <meshStandardMaterial color={CAR_CONFIG.BODY.color} />
    </mesh>
  );
};

export default CarPhysics;
