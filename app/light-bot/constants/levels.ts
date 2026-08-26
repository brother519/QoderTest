/**
 * Light-bot 关卡数据
 *
 * 每关的 solution 至少提供一条可行解，关卡验证测试会据此断言可通关。
 *
 * solution 约定（引擎实现需满足，测试也以此为准）：
 * - 解法中的每一步都是合法步：移动不会越界、不会撞墙；
 * - `light` 只出现在机器人正站在尚未点亮的灯格上时。
 * 因此无论引擎把「非法移动」实现为失败还是原地忽略，这些解法都能通关。
 *
 * @module light-bot/constants/levels
 */

import { Level } from '../types/game';

export const LEVELS: Level[] = [
    {
        id: 1,
        name: '热身',
        size: 3,
        start: { row: 0, col: 0 },
        walls: [],
        lamps: [
            { row: 0, col: 2 },
            { row: 1, col: 1 },
            { row: 2, col: 0 },
            { row: 2, col: 2 },
        ],
        // 12 步：(0,2) -> (1,1) -> (2,2) -> (2,0)
        solution: [
            'right', 'right', 'light',
            'down', 'left', 'light',
            'down', 'right', 'light',
            'left', 'left', 'light',
        ],
    },
    {
        id: 2,
        name: '绕墙',
        size: 4,
        start: { row: 0, col: 0 },
        walls: [
            { row: 1, col: 1 },
            { row: 2, col: 2 },
        ],
        lamps: [
            { row: 1, col: 0 },
            { row: 0, col: 3 },
            { row: 1, col: 3 },
            { row: 2, col: 0 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
        ],
        // 15 步：沿左列下行，绕过 (1,1)/(2,2) 两面墙，再从右列上行收尾
        solution: [
            'down', 'light',
            'down', 'light',
            'down', 'right', 'light',
            'right', 'right', 'light',
            'up', 'up', 'light',
            'up', 'light',
        ],
    },
    {
        id: 3,
        name: '迷宫',
        size: 5,
        start: { row: 0, col: 0 },
        walls: [
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 2, col: 2 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
        ],
        lamps: [
            { row: 0, col: 2 },
            { row: 0, col: 4 },
            { row: 1, col: 2 },
            { row: 2, col: 0 },
            { row: 2, col: 4 },
            { row: 3, col: 2 },
            { row: 4, col: 0 },
            { row: 4, col: 2 },
        ],
        // 25 步（最短解）：左列下行 -> 底排 -> 右列上行 -> 顶排回收 (0,2)/(1,2)
        solution: [
            'down', 'down', 'light',
            'down', 'down', 'light',
            'right', 'right', 'light',
            'up', 'light',
            'down', 'right', 'right',
            'up', 'up', 'light',
            'up', 'up', 'light',
            'left', 'left', 'light',
            'down', 'light',
        ],
    },
];

/** 最大队列长度 */
export const MAX_QUEUE_LENGTH = 30;

/** 每步执行间隔（毫秒） */
export const STEP_INTERVAL_MS = 400;
