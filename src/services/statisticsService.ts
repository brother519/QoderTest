import { GameRecord, Statistics, Level } from '../types/game';

export const statisticsService = {
  calculateStatistics: (history: GameRecord[]): Statistics => {
    const stats: Statistics = {
      totalGames: history.length,
      wins: history.filter(r => r.status === 'won').length,
      losses: history.filter(r => r.status === 'lost').length,
      totalTimeSpent: history.reduce((sum, r) => sum + r.elapsedTime, 0),
      easyStats: { total: 0, wins: 0, avgTime: 0 },
      mediumStats: { total: 0, wins: 0, avgTime: 0 },
      hardStats: { total: 0, wins: 0, avgTime: 0 }
    };

    const easyGames = history.filter(r => r.level.id === 'easy');
    const mediumGames = history.filter(r => r.level.id === 'medium');
    const hardGames = history.filter(r => r.level.id === 'hard');

    stats.easyStats = statisticsService.getLevelStats(easyGames);
    stats.mediumStats = statisticsService.getLevelStats(mediumGames);
    stats.hardStats = statisticsService.getLevelStats(hardGames);

    return stats;
  },

  getLevelStats: (games: GameRecord[]) => {
    const total = games.length;
    const wins = games.filter(r => r.status === 'won').length;
    const avgTime = total > 0 ? games.reduce((sum, r) => sum + r.elapsedTime, 0) / total : 0;

    return {
      total,
      wins,
      avgTime: Math.round(avgTime)
    };
  },

  getWinRate: (statistics: Statistics): string => {
    if (statistics.totalGames === 0) return '0%';
    const rate = (statistics.wins / statistics.totalGames) * 100;
    return rate.toFixed(1) + '%';
  },

  formatTime: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分`;
    }
    if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    }
    return `${secs}秒`;
  }
};
