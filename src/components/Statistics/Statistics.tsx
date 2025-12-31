import React from 'react';
import { storageService } from '../../services/storageService';
import { statisticsService } from '../../services/statisticsService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './Statistics.css';

const Statistics: React.FC = () => {
  const [history] = useLocalStorage('minesweeper:gameHistory', []);

  if (typeof history !== 'object' || history === null || !Array.isArray(history)) {
    return <div className="statistics-container"><p>暂无数据</p></div>;
  }

  const stats = statisticsService.calculateStatistics(history);
  const winRate = statisticsService.getWinRate(stats);

  return (
    <div className="statistics-container">
      <h2>游戏统计</h2>
      
      {stats.totalGames === 0 ? (
        <p className="no-data">还没有游戏记录，开始玩游戏吧！</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalGames}</div>
              <div className="stat-label">总游戏数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.wins}</div>
              <div className="stat-label">赢得游戏</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{winRate}</div>
              <div className="stat-label">胜率</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statisticsService.formatTime(stats.totalTimeSpent)}</div>
              <div className="stat-label">总耗时</div>
            </div>
          </div>

          <div className="level-stats">
            <h3>各难度统计</h3>
            <div className="level-stat-item">
              <span>初级</span>
              <div className="progress-info">
                <span>{stats.easyStats.total}局 | {stats.easyStats.wins}胜</span>
              </div>
            </div>
            <div className="level-stat-item">
              <span>中级</span>
              <div className="progress-info">
                <span>{stats.mediumStats.total}局 | {stats.mediumStats.wins}胜</span>
              </div>
            </div>
            <div className="level-stat-item">
              <span>高级</span>
              <div className="progress-info">
                <span>{stats.hardStats.total}局 | {stats.hardStats.wins}胜</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
