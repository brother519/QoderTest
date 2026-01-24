module.exports = {
    port: process.env.PORT || 3000,
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100 // 限制每个IP 100个请求
    }
};
