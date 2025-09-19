import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<HomePage />} />
          <Route path="/product/:id" element={<HomePage />} />
          {/* 其他路由可以在这里添加 */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;