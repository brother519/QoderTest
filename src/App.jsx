import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameSelector from './shared/components/GameSelector.jsx';
import Game2048 from './games/game2048/index.jsx';
import RacingGame from './games/racing/index.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameSelector />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/racing" element={<RacingGame />} />
      </Routes>
    </Router>
  );
}

export default App;
