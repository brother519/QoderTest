import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import Scene from './Scene/Scene.jsx';
import CarPhysics from './Vehicle/CarPhysics.jsx';
import Track from './Track/Track.jsx';
import HUD from './UI/HUD.jsx';
import { useCarControls } from '../hooks/useCarControls.js';
import { useNitro } from '../hooks/useNitro.js';
import { useDrift } from '../hooks/useDrift.js';
import { useGameState } from '../hooks/useGameState.js';
import { TRACK_DATA } from '../data/trackData.js';
import { GAME_CONSTANTS, GAME_STATES } from '../data/gameConstants.js';
import { Link } from 'react-router-dom';
import styles from '../styles/RacingGame.module.css';

const RacingGame = () => {
  const carRef = useRef();
  const [carData, setCarData] = useState({
    position: TRACK_DATA.startPosition,
    rotation: TRACK_DATA.startRotation,
    speed: 0,
  });

  const controls = useCarControls();
  const { nitro, isUsingNitro, useNitro: activateNitro, updateNitro } = useNitro();
  const { isDrifting, startDrift, stopDrift, updateDrift } = useDrift();
  const {
    gameState,
    currentLap,
    totalTime,
    bestLapTime,
    startGame,
    handleCheckpoint,
    updateTime,
    resetGame,
  } = useGameState();

  const handleCarUpdate = (data) => {
    setCarData(data);
    carRef.current = data;
  };

  const GameLogic = () => {
    useFrame((state, delta) => {
      updateTime(delta);
      
      if (controls.drift && carData.speed > GAME_CONSTANTS.DRIFT_SPEED_THRESHOLD) {
        startDrift(carData.speed, carData.rotation[1] * 57.3);
      } else {
        stopDrift();
      }
      
      activateNitro(controls.nitro);
      updateNitro(delta, isDrifting);
      
      if (isDrifting) {
        updateDrift(delta, carData.speed, carData.rotation[1] * 57.3);
      }
    });
    
    return null;
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>
        ← 返回游戏中心
      </Link>

      {gameState === GAME_STATES.NOT_STARTED && (
        <div className={styles.startScreen}>
          <h1 className={styles.title}>3D赛车</h1>
          <button onClick={startGame} className={styles.startButton}>
            开始游戏
          </button>
          <div className={styles.instructions}>
            <h3>操作说明：</h3>
            <p>W/↑ - 加速</p>
            <p>S/↓ - 刹车/倒车</p>
            <p>A/← - 左转</p>
            <p>D/→ - 右转</p>
            <p>Shift - 氮气加速</p>
            <p>Space - 漂移</p>
          </div>
        </div>
      )}

      {gameState === GAME_STATES.COUNTDOWN && (
        <div className={styles.countdown}>
          <div className={styles.countdownText}>准备...</div>
        </div>
      )}

      {gameState === GAME_STATES.FINISHED && (
        <div className={styles.finishScreen}>
          <h2 className={styles.finishTitle}>比赛结束！</h2>
          <div className={styles.stats}>
            <p>总时间: {(totalTime / 1000).toFixed(2)}秒</p>
            <p>最佳圈速: {(bestLapTime / 1000).toFixed(2)}秒</p>
          </div>
          <button onClick={resetGame} className={styles.restartButton}>
            重新开始
          </button>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 75 }}
        className={styles.canvas}
      >
        <Sky sunPosition={[100, 20, 100]} />
        
        <Physics gravity={[0, -30, 0]}>
          <Scene carRef={carRef}>
            <Track onCheckpoint={handleCheckpoint} />
            
            {gameState !== GAME_STATES.NOT_STARTED && (
              <CarPhysics
                position={TRACK_DATA.startPosition}
                rotation={TRACK_DATA.startRotation}
                controls={controls}
                nitroActive={isUsingNitro}
                isDrifting={isDrifting}
                onUpdate={handleCarUpdate}
              />
            )}
          </Scene>
          
          <GameLogic />
        </Physics>
      </Canvas>

      {(gameState === GAME_STATES.RACING || gameState === GAME_STATES.PAUSED) && (
        <HUD
          speed={carData.speed}
          nitro={nitro}
          currentLap={currentLap}
          totalLaps={GAME_CONSTANTS.TOTAL_LAPS}
          time={totalTime}
          bestLap={bestLapTime}
        />
      )}
    </div>
  );
};

export default RacingGame;
