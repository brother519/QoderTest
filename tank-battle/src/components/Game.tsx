import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../game/state/GameContext';
import { InputSystem } from '../game/systems/InputSystem';
import { GameCanvas } from './GameCanvas';
import { ScorePanel } from './UI/ScorePanel';
import { GameOver } from './UI/GameOver';
import { LevelStart } from './UI/LevelStart';
import { PauseMenu } from './UI/PauseMenu';
import './Game.css';

export function Game() {
  const { state, dispatch } = useGame();
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastPauseState = useRef(false);

  const gameLoop = useCallback(() => {
    const input = InputSystem.getInput();

    if (input.pause && !lastPauseState.current) {
      if (state.status === 'playing') {
        dispatch({ type: 'PAUSE' });
      } else if (state.status === 'paused') {
        dispatch({ type: 'RESUME' });
      }
    }
    lastPauseState.current = input.pause;

    if (state.status === 'playing') {
      dispatch({ type: 'GAME_TICK', payload: { input } });
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [state.status, dispatch]);

  useEffect(() => {
    InputSystem.init();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      InputSystem.cleanup();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  const handleRestart = () => {
    dispatch({ type: 'START_GAME' });
  };

  const handleLevelContinue = () => {
    dispatch({ type: 'NEXT_LEVEL' });
  };

  const enemiesLeft = state.spawnQueue + state.enemies.length;

  return (
    <div className="game-container">
      <ScorePanel
        score={state.score}
        lives={state.lives}
        level={state.level}
        enemiesLeft={enemiesLeft}
      />
      <div className="game-content">
        <GameCanvas />
        {state.status === 'gameOver' && (
          <GameOver score={state.score} onRestart={handleRestart} />
        )}
        {state.status === 'levelTransition' && (
          <LevelStart level={state.level + 1} onContinue={handleLevelContinue} />
        )}
        {state.status === 'paused' && (
          <PauseMenu />
        )}
      </div>
    </div>
  );
}