import React from 'react';
import './GameFooter.css';

interface GameFooterProps {
  onReset: () => void;
  onBack: () => void;
}

const GameFooter: React.FC<GameFooterProps> = ({ onReset, onBack }) => {
  return (
    <div className="game-footer">
      <button className="footer-button" onClick={onReset}>
        🔄 重新开始
      </button>
      <button className="footer-button" onClick={onBack}>
        🏠 返回菜单
      </button>
    </div>
  );
};

export default GameFooter;
