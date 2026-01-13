export class StorageManager {
    constructor() {
        this.saveKey = 'tankBattle_saveData';
        this.highScoreKey = 'tankBattle_highScores';
        this.customLevelsKey = 'tankBattle_customLevels';
        this.settingsKey = 'tankBattle_settings';
    }
    
    saveGame(gameState) {
        try {
            const data = {
                currentLevel: gameState.currentLevel,
                score: gameState.score,
                lives: gameState.lives,
                timestamp: Date.now()
            };
            localStorage.setItem(this.saveKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
    
    loadGame() {
        try {
            const data = localStorage.getItem(this.saveKey);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }
    
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }
    
    saveHighScore(name, score) {
        try {
            const scores = this.getHighScores();
            scores.push({
                name: name || 'Player',
                score,
                date: new Date().toISOString()
            });
            
            scores.sort((a, b) => b.score - a.score);
            const topScores = scores.slice(0, 10);
            
            localStorage.setItem(this.highScoreKey, JSON.stringify(topScores));
            return true;
        } catch (e) {
            console.error('Failed to save high score:', e);
            return false;
        }
    }
    
    getHighScores() {
        try {
            const data = localStorage.getItem(this.highScoreKey);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to get high scores:', e);
            return [];
        }
    }
    
    saveCustomLevel(levelData) {
        try {
            const levels = this.getCustomLevels();
            levelData.id = Date.now();
            levelData.createdAt = new Date().toISOString();
            levels.push(levelData);
            
            localStorage.setItem(this.customLevelsKey, JSON.stringify(levels));
            return levelData.id;
        } catch (e) {
            console.error('Failed to save custom level:', e);
            return null;
        }
    }
    
    getCustomLevels() {
        try {
            const data = localStorage.getItem(this.customLevelsKey);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to get custom levels:', e);
            return [];
        }
    }
    
    deleteCustomLevel(id) {
        try {
            const levels = this.getCustomLevels();
            const filtered = levels.filter(l => l.id !== id);
            localStorage.setItem(this.customLevelsKey, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Failed to delete custom level:', e);
            return false;
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }
    
    getSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            if (!data) {
                return {
                    musicVolume: 0.5,
                    sfxVolume: 0.7,
                    showFPS: false
                };
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to get settings:', e);
            return {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                showFPS: false
            };
        }
    }
    
    clearAll() {
        try {
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem(this.highScoreKey);
            localStorage.removeItem(this.customLevelsKey);
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (e) {
            console.error('Failed to clear storage:', e);
            return false;
        }
    }
}
