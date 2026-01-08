const rateLimit = require('express-rate-limit');

// 通用速率限制
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 限制 100 个请求
    message: {
        success: false,
        error: '请求过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 游戏操作速率限制（更严格）
const gameLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 分钟
    max: 60, // 限制 60 个请求（平均每秒1次）
    message: {
        success: false,
        error: '操作过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    gameLimiter
};
