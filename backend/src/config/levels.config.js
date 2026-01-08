const CARD_TYPES = ['🐑', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🐮', '🐷', '🐵'];

const levels = [
    {
        id: 1,
        name: "新手教程",
        difficulty: "easy",
        description: "熟悉游戏规则，轻松上手",
        isLocked: false,
        config: {
            cardTypes: CARD_TYPES.slice(0, 6),
            typesCount: 6,
            cardsPerType: 9,
            layers: 3,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400,
            overlapThreshold: 0.5
        }
    },
    {
        id: 2,
        name: "渐入佳境",
        difficulty: "medium",
        description: "增加一些挑战，考验你的策略",
        isLocked: true,
        unlockCondition: {
            type: "level",
            requiredLevel: 1
        },
        config: {
            cardTypes: CARD_TYPES.slice(0, 8),
            typesCount: 8,
            cardsPerType: 9,
            layers: 4,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400,
            overlapThreshold: 0.5
        }
    },
    {
        id: 3,
        name: "高手之路",
        difficulty: "hard",
        description: "真正的挑战开始了",
        isLocked: true,
        unlockCondition: {
            type: "level",
            requiredLevel: 2
        },
        config: {
            cardTypes: CARD_TYPES.slice(0, 10),
            typesCount: 10,
            cardsPerType: 9,
            layers: 5,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400,
            overlapThreshold: 0.6
        }
    },
    {
        id: 4,
        name: "大师级别",
        difficulty: "expert",
        description: "只有少数人能通过的关卡",
        isLocked: true,
        unlockCondition: {
            type: "level",
            requiredLevel: 3
        },
        config: {
            cardTypes: CARD_TYPES,
            typesCount: 12,
            cardsPerType: 9,
            layers: 6,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400,
            overlapThreshold: 0.6
        }
    },
    {
        id: 5,
        name: "终极挑战",
        difficulty: "expert",
        description: "极限难度，你准备好了吗？",
        isLocked: true,
        unlockCondition: {
            type: "level",
            requiredLevel: 4
        },
        config: {
            cardTypes: CARD_TYPES,
            typesCount: 12,
            cardsPerType: 12,
            layers: 7,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400,
            overlapThreshold: 0.7
        }
    }
];

module.exports = levels;
