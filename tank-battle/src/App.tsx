
import { GameProvider } from './game/state/GameContext';
import { useGame } from './game/state/GameContext';
import { StartMenu } from './components/StartMenu';
import { Game } from './components/Game';
import './App.css';

function AppContent() {
  const { state, dispatch } = useGame();

  const handleStart = () => {
    dispatch({ type: 'START_GAME' });
  };

  if (state.status === 'menu') {
    return <StartMenu onStart={handleStart} />;
  }

  return <Game />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;