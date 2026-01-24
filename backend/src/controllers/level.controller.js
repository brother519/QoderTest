const LevelService = require('../services/level.service');

class LevelController {
    // GET /api/levels
    static getAllLevels(req, res) {
        try {
            // TODO: 从用户会话或请求中获取已完成关卡列表
            const completedLevels = [];
            const levels = LevelService.getAllLevels(completedLevels);
            
            res.json({
                success: true,
                data: levels
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/levels/:levelId
    static getLevelById(req, res) {
        try {
            const { levelId } = req.params;
            const level = LevelService.getLevelById(levelId);
            
            if (!level) {
                return res.status(404).json({
                    success: false,
                    error: '关卡不存在'
                });
            }

            res.json({
                success: true,
                data: level
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = LevelController;
