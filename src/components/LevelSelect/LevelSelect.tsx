import React from 'react';
import { LEVELS } from '../../constants/levels';
import './LevelSelect.css';

interface LevelSelectProps {
  onSelectLevel: (levelId: string) => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel }) => {
  return (
    <div className="level-select-container">
      <h1 className="title">扫雷游戏</h1>
      <p className="subtitle">选择难度开始游戏</p>
      
      <div className="level-buttons">
        {LEVELS.map(level => (
          <button
            key={level.id}
            className="level-button"
            onClick={() => onSelectLevel(level.id)}
          >
            <div className="level-name">{level.name}</div>
            <div className="level-info">
              {level.width}×{level.height}
            </div>
            <div className="level-mines">{level.mines}个地雷</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
