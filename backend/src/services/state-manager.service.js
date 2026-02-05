const { v4: uuidv4 } = require('uuid');

class StateManager {
    constructor() {
        // 使用 Map 存储游戏会话
        this.sessions = new Map();
        // 会话过期时间（1小时）
        this.sessionTimeout = 60 * 60 * 1000;
    }

    // 创建新会话
    createSession(levelId, gameState) {
        const sessionId = uuidv4();
        const session = {
            sessionId,
            levelId,
            gameState,
            createdAt: new Date(),
            lastAccessedAt: new Date()
        };
        
        this.sessions.set(sessionId, session);
        return sessionId;
    }

    // 获取会话
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        // 检查会话是否过期
        const now = Date.now();
        if (now - session.lastAccessedAt.getTime() > this.sessionTimeout) {
            this.sessions.delete(sessionId);
            return null;
        }

        // 更新最后访问时间
        session.lastAccessedAt = new Date();
        return session;
    }

    // 更新会话状态
    updateSession(sessionId, gameState) {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.gameState = gameState;
        session.lastAccessedAt = new Date();
        return true;
    }

    // 删除会话
    deleteSession(sessionId) {
        return this.sessions.delete(sessionId);
    }

    // 清理过期会话（定期执行）
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastAccessedAt.getTime() > this.sessionTimeout) {
                this.sessions.delete(sessionId);
            }
        }
    }

    // 获取会话统计信息
    getStats() {
        return {
            totalSessions: this.sessions.size,
            timestamp: new Date()
        };
    }
}

// 导出单例
module.exports = new StateManager();
