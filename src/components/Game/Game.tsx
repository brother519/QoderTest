import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import GameHeader from './GameHeader';
import GameBoard from './GameBoard';
import GameFooter from './GameFooter';
import GameOverModal from '../Modal/GameOverModal';
import './Game.css';

interface GameProps {
  onBackToMenu: () => void;
}

const Game: React.FC<GameProps> = ({ onBackToMenu }) => {
  const { gameState, currentLevel, revealCell, toggleFlag, resetGame } = useGame();
  const isPlaying = gameState.status === 'playing' || gameState.status === 'idle';
  const { time } = useTimer(isPlaying);
  const { play } = useAudio(true);

  useEffect(() => {
    if (gameState.status === 'won') {
      play('win');
    } else if (gameState.status === 'lost') {
      play('lose');
    }
  }, [gameState.status]);

  const gameBoardClassName = `game-board-container ${
    gameState.status === 'won' ? 'victory' : ''
  } ${gameState.status === 'lost' ? 'defeat' : ''}`;

  return (
    <div className={gameBoardClassName}>
      <GameHeader 
        time={time}
        flaggedCount={gameState.flaggedCount}
        totalMines={currentLevel.mines}
        difficulty={currentLevel.name}
      />
      
      <GameBoard 
        board={gameState.board}
        onCellLeftClick={revealCell}
        onCellRightClick={toggleFlag}
      />
      
      <GameFooter onReset={resetGame} onBack={onBackToMenu} />
      
      {gameState.status !== 'idle' && gameState.status !== 'playing' && (
        <GameOverModal 
          status={gameState.status}
          time={time}
          totalMines={currentLevel.mines}
          difficulty={currentLevel.name}
          onReset={resetGame}
          onBack={onBackToMenu}
        />
      )}
    </div>
  );
};

export default Game;