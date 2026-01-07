// levels.js - 关卡配置数据
const LEVELS = [
    {
        id: 1,
        name: "新手关卡",
        cardCount: 24,  // 8组，每组3张
        cardTypes: [1, 2, 3, 4, 5, 6],  // 使用6种图案
        layout: {
            type: "pyramid",
            rows: 4,
            cols: 6,
            layerConfig: {
                baseLayer: 0,      // 最底层层级为0
                layerSpacing: 1   // 每层增加1个层级
            }
        },
        difficulty: 1
    },
    {
        id: 2,
        name: "初级关卡",
        cardCount: 36,  // 12组，每组3张
        cardTypes: [1, 2, 3, 4, 5, 6, 7, 8],  // 使用8种图案
        layout: {
            type: "pyramid",
            rows: 5,
            cols: 8,
            layerConfig: {
                baseLayer: 0,
                layerSpacing: 1
            }
        },
        difficulty: 2
    },
    {
        id: 3,
        name: "中级关卡",
        cardCount: 48,  // 16组，每组3张
        cardTypes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // 使用10种图案
        layout: {
            type: "pyramid",
            rows: 6,
            cols: 10,
            layerConfig: {
                baseLayer: 0,
                layerSpacing: 1
            }
        },
        difficulty: 3
    }
];

// 默认关卡（如果需要更多关卡，可以扩展此数组）
const DEFAULT_LEVEL = LEVELS[0];