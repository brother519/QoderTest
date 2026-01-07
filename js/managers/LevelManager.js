// LevelManager.js - 关卡数据管理
class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.levels = LEVELS; // 使用配置文件中的关卡数据
    }

    // 获取指定关卡数据
    getLevel(levelId) {
        return this.levels.find(level => level.id === levelId) || this.levels[0];
    }

    // 获取当前关卡
    getCurrentLevel() {
        if (this.currentLevel) {
            return this.currentLevel;
        }
        return this.getLevel(1); // 默认返回第一关
    }

    // 设置当前关卡
    setCurrentLevel(levelId) {
        this.currentLevel = this.getLevel(levelId);
        this.currentLevelIndex = this.levels.findIndex(l => l.id === levelId);
        return this.currentLevel;
    }

    // 获取下一个关卡
    getNextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            return this.levels[this.currentLevelIndex + 1];
        }
        // 如果已经是最后一关，返回最后一关
        return this.levels[this.levels.length - 1];
    }

    // 获取上一个关卡
    getPrevLevel() {
        if (this.currentLevelIndex > 0) {
            return this.levels[this.currentLevelIndex - 1];
        }
        // 如果是第一关，返回第一关
        return this.levels[0];
    }

    // 检查是否有下一个关卡
    hasNextLevel() {
        return this.currentLevelIndex < this.levels.length - 1;
    }

    // 生成指定关卡的卡片
    generateLevelCards(levelId) {
        const level = this.getLevel(levelId);
        if (!level) {
            console.error(`Level ${levelId} not found`);
            return [];
        }

        // 根据关卡配置生成卡片
        const cards = [];
        const totalCards = level.cardCount;
        const cardTypes = level.cardTypes;
        
        // 计算每种类型需要的卡片数量（确保是3的倍数）
        const cardsPerType = 3; // 每种类型至少3张，确保可以消除
        const requiredTypes = Math.floor(totalCards / 3);
        
        // 使用关卡中定义的类型或默认类型
        const typesToUse = cardTypes.length > 0 ? cardTypes : Array.from({length: Math.min(requiredTypes, GAME_CONFIG.CARD_TYPES)}, (_, i) => i + 1);
        
        // 生成卡片
        let cardId = 1;
        for (let i = 0; i < totalCards; i++) {
            const typeIndex = i % typesToUse.length;
            const type = typesToUse[typeIndex];
            
            cards.push(new Card(
                cardId++,
                type,
                0, // 临时坐标，布局时会更新
                0,
                0  // 临时层级，布局时会更新
            ));
        }

        return cards;
    }

    // 验证关卡配置
    validateLevel(level) {
        if (!level) return false;
        
        // 检查卡片数量是否为3的倍数
        if (level.cardCount % 3 !== 0) {
            console.warn(`Level ${level.id} card count is not multiple of 3`);
            return false;
        }
        
        // 检查卡片数量是否合理
        if (level.cardCount <= 0 || level.cardCount > 1000) {
            console.warn(`Level ${level.id} has invalid card count`);
            return false;
        }
        
        return true;
    }

    // 获取所有关卡信息
    getAllLevels() {
        return [...this.levels];
    }

    // 获取关卡总数
    getTotalLevels() {
        return this.levels.length;
    }

    // 获取当前关卡索引
    getCurrentLevelIndex() {
        return this.currentLevelIndex;
    }

    // 从布局算法获取卡片位置和层级
    generateLayoutForLevel(levelId) {
        const level = this.getLevel(levelId);
        const cards = this.generateLevelCards(levelId);
        
        // 使用布局管理器生成具体布局
        const layoutManager = new LayoutManager();
        return layoutManager.generateLayout(cards, level.layout);
    }

    // 检查玩家是否解锁了某个关卡
    isLevelUnlocked(levelId) {
        // 简单实现：只有完成前一关才能解锁下一关
        const currentMaxLevel = this.getCurrentLevelIndex() + 1;
        return levelId <= currentMaxLevel;
    }

    // 获取解锁的关卡列表
    getUnlockedLevels() {
        return this.levels.slice(0, this.getCurrentLevelIndex() + 1);
    }

    // 更新关卡进度（例如，当玩家完成某个关卡时）
    updateLevelProgress(levelId, completionData = {}) {
        // 这里可以实现关卡进度保存逻辑
        // 比如记录最佳得分、完成时间等
        console.log(`Level ${levelId} completed with data:`, completionData);
    }

    // 重置关卡管理器
    reset() {
        this.currentLevel = null;
        this.currentLevelIndex = 0;
    }

    // 获取关卡统计数据
    getLevelStats(levelId) {
        const level = this.getLevel(levelId);
        if (!level) return null;

        return {
            id: level.id,
            name: level.name,
            cardCount: level.cardCount,
            cardTypesCount: level.cardTypes.length,
            difficulty: level.difficulty,
            layoutType: level.layout.type,
            rows: level.layout.rows,
            cols: level.layout.cols
        };
    }
}

// 全局关卡管理实例
const levelManager = new LevelManager();