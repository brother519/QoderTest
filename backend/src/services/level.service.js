const levels = require('../config/levels.config');

class LevelService {
    // 获取所有关卡
    static getAllLevels(completedLevels = []) {
        return levels.map(level => {
            // 检查是否解锁
            let isLocked = level.isLocked;
            if (level.unlockCondition) {
                const { type, requiredLevel } = level.unlockCondition;
                if (type === 'level') {
                    isLocked = !completedLevels.includes(requiredLevel);
                }
            } else {
                isLocked = false;
            }

            // 返回关卡信息（隐藏详细配置给锁定的关卡）
            return {
                id: level.id,
                name: level.name,
                difficulty: level.difficulty,
                description: level.description,
                isLocked,
                config: isLocked ? null : level.config
            };
        });
    }

    // 获取特定关卡
    static getLevelById(levelId) {
        const level = levels.find(l => l.id === parseInt(levelId));
        if (!level) {
            return null;
        }
        return level;
    }

    // 检查关卡是否解锁
    static isLevelUnlocked(levelId, completedLevels = []) {
        const level = this.getLevelById(levelId);
        if (!level) {
            return false;
        }

        if (!level.isLocked) {
            return true;
        }

        if (level.unlockCondition) {
            const { type, requiredLevel } = level.unlockCondition;
            if (type === 'level') {
                return completedLevels.includes(requiredLevel);
            }
        }

        return false;
    }
}

module.exports = LevelService;
