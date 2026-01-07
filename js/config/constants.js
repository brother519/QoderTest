// constants.js - 游戏常量配置
const GAME_CONFIG = {
    // 卡片尺寸
    CARD_WIDTH: 60,
    CARD_HEIGHT: 80,
    
    // 卡槽配置
    SLOT_CAPACITY: 7,  // 卡槽最大容量
    SLOT_SPACING: 10,  // 卡槽间距
    
    // 游戏区域配置
    GAME_WIDTH: 800,
    GAME_HEIGHT: 500,
    
    // 卡片类型数量（12种不同的图案）
    CARD_TYPES: 12,
    
    // 遮挡判断阈值（重叠面积超过此比例则认为被遮挡）
    BLOCK_THRESHOLD: 0.3,
    
    // 动画配置
    ANIMATION_DURATION: 300,  // 动画持续时间（毫秒）
    
    // 颜色配置
    CARD_COLORS: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ],
    
    // 游戏状态
    GAME_STATUS: {
        IDLE: 'idle',
        PLAYING: 'playing',
        PAUSED: 'paused',
        WIN: 'win',
        LOSE: 'lose'
    }
};