import React from 'react';
import './styles/global.css';
import './styles/animations.css';
import { GameProvider } from './context/GameContext';
import LevelSelect from './components/LevelSelect/LevelSelect';
import Game from './components/Game/Game';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [currentLevelId, setCurrentLevelId] = useLocalStorage<string>('minesweeper:currentLevel', 'easy');
  const [gameStarted, setGameStarted] = useLocalStorage<boolean>('minesweeper:gameStarted', false);

  return (
    <GameProvider>
      <div className="app">
        {!gameStarted ? (
          <LevelSelect onSelectLevel={(levelId: string) => {
            setCurrentLevelId(levelId);
            setGameStarted(true);
          }} />
        ) : (
          <Game onBackToMenu={() => setGameStarted(false)} />
        )}
      </div>
    </GameProvider>
  );
};

export default App;