import React from 'react';
import './GameOverModal.css';

interface GameOverModalProps {
  status: 'won' | 'lost';
  time: number;
  totalMines: number;
  difficulty: string;
  onReset: () => void;
  onBack: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  time,
  totalMines,
  difficulty,
  onReset,
  onBack
}) => {
  const isWon = status === 'won';
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className={`modal-header ${isWon ? 'won' : 'lost'}`}>
          {isWon ? '🎉 恭喜！' : '💥 游戏结束！'}
        </div>
        
        <div className="modal-body">
          <p className="modal-message">
            {isWon ? '你成功地排除了所有地雷！' : '抱歉，你踩到了地雷'}
          </p>
          
          <div className="modal-stats">
            <div className="stat-item">
              <span className="stat-label">难度:</span>
              <span className="stat-value">{difficulty}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">耗时:</span>
              <span className="stat-value">{formatTime(time)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">地雷数:</span>
              <span className="stat-value">{totalMines}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button primary" onClick={onReset}>
            {isWon ? '⭐ 再玩一次' : '🔄 重试'}
          </button>
          <button className="modal-button secondary" onClick={onBack}>
            🏠 返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
