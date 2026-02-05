const app = require('./src/app');
const appConfig = require('./src/config/app.config');
const stateManager = require('./src/services/state-manager.service');

const PORT = appConfig.port;

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 羊了个羊游戏服务器运行在 http://localhost:${PORT}`);
    console.log(`📋 API 端点:`);
    console.log(`   - GET  /api/levels - 获取关卡列表`);
    console.log(`   - POST /api/game/start - 开始游戏`);
    console.log(`   - POST /api/game/:sessionId/click - 点击卡片`);
    console.log(`   - GET  /api/game/:sessionId/state - 获取游戏状态`);
    console.log(`   - POST /api/game/:sessionId/restart - 重新开始`);
});

// 定期清理过期会话（每10分钟）
setInterval(() => {
    stateManager.cleanupExpiredSessions();
    console.log('✅ 已清理过期会话');
}, 10 * 60 * 1000);

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});
