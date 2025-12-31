import React from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { GameRecord } from '../../types/game';
import { statisticsService } from '../../services/statisticsService';
import './GameHistory.css';

const GameHistory: React.FC = () => {
  const [history] = useLocalStorage<GameRecord[]>('minesweeper:gameHistory', []);
  const [sortBy, setSortBy] = React.useState<'date' | 'time'>('date');

  const validHistory = Array.isArray(history) ? history : [];
  
  const sortedHistory = [...validHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return b.timestamp - a.timestamp;
    } else {
      return a.elapsedTime - b.elapsedTime;
    }
  });

  return (
    <div className="game-history-container">
      <h2>游戏历史</h2>
      
      {validHistory.length === 0 ? (
        <p className="no-data">还没有游戏记录</p>
      ) : (
        <>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => setSortBy('date')}
            >
              按时间排序
            </button>
            <button
              className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`}
              onClick={() => setSortBy('time')}
            >
              按耗时排序
            </button>
          </div>

          <div className="history-list">
            {sortedHistory.map((record, index) => (
              <div key={record.id} className={`history-item ${record.status}`}>
                <div className="item-number">#{sortedHistory.length - index}</div>
                <div className="item-details">
                  <div className="item-status">
                    {record.status === 'won' ? '✅ 胜利' : '❌ 失败'}
                  </div>
                  <div className="item-level">{record.level.name}</div>
                  <div className="item-time">
                    耗时: {statisticsService.formatTime(record.elapsedTime)}
                  </div>
                </div>
                <div className="item-date">
                  {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GameHistory;
