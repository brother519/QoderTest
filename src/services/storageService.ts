import { GameRecord, Statistics, UserSettings } from '../types/game';

const STORAGE_KEYS = {
  HISTORY: 'minesweeper:gameHistory',
  STATISTICS: 'minesweeper:statistics',
  SETTINGS: 'minesweeper:userSettings'
};

const DEFAULT_STATISTICS: Statistics = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalTimeSpent: 0,
  easyStats: { total: 0, wins: 0, avgTime: 0 },
  mediumStats: { total: 0, wins: 0, avgTime: 0 },
  hardStats: { total: 0, wins: 0, avgTime: 0 }
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  animationEnabled: true,
  theme: 'light'
};

export const storageService = {
  getGameHistory: (): GameRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading game history:', error);
      return [];
    }
  },

  addGameRecord: (record: GameRecord): void => {
    try {
      const history = storageService.getGameHistory();
      history.push(record);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving game record:', error);
    }
  },

  deleteGameRecord: (id: string): void => {
    try {
      const history = storageService.getGameHistory();
      const filtered = history.filter(record => record.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting game record:', error);
    }
  },

  getStatistics: (): Statistics => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      return data ? JSON.parse(data) : DEFAULT_STATISTICS;
    } catch (error) {
      console.error('Error reading statistics:', error);
      return DEFAULT_STATISTICS;
    }
  },

  updateStatistics: (stats: Statistics): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error reading settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings: (settings: UserSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  exportData: () => {
    try {
      const data = {
        history: storageService.getGameHistory(),
        statistics: storageService.getStatistics(),
        settings: storageService.getSettings(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.history) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      if (data.statistics) {
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(data.statistics));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
