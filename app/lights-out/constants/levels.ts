/**
 * 点灯游戏关卡数据
 *
 * 所有关卡从全灭状态出发，通过模拟点击生成初始状态，保证 100% 可解。
 *
 * @module lights-out/constants/levels
 */

import { LevelData } from '../types/game';

/** 从全灭状态模拟点击生成可解关卡 */
function generateLevel(size: number, clicks: [number, number][]): boolean[][] {
    const grid = Array.from({ length: size }, () => Array(size).fill(false));

    for (const [r, c] of clicks) {
        grid[r][c] = !grid[r][c];
        if (r > 0) grid[r - 1][c] = !grid[r - 1][c];
        if (r < size - 1) grid[r + 1][c] = !grid[r + 1][c];
        if (c > 0) grid[r][c - 1] = !grid[r][c - 1];
        if (c < size - 1) grid[r][c + 1] = !grid[r][c + 1];
    }

    return grid;
}

export const LEVELS: LevelData[] = [
    {
        id: 1,
        name: '热身',
        size: 3,
        initial: generateLevel(3, [[1, 1]]),
    },
    {
        id: 2,
        name: '角落',
        size: 3,
        initial: generateLevel(3, [[0, 0], [2, 2]]),
    },
    {
        id: 3,
        name: '十字',
        size: 3,
        initial: generateLevel(3, [[0, 1], [1, 0], [1, 2], [2, 1]]),
    },
    {
        id: 4,
        name: '对角',
        size: 3,
        initial: generateLevel(3, [[0, 0], [0, 2], [2, 0], [2, 2]]),
    },
    {
        id: 5,
        name: '满布',
        size: 3,
        initial: generateLevel(3, [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]]),
    },
    {
        id: 6,
        name: '入门 4x4',
        size: 4,
        initial: generateLevel(4, [[0, 0], [1, 2], [2, 1], [3, 3]]),
    },
    {
        id: 7,
        name: '边框',
        size: 4,
        initial: generateLevel(4, [[0, 0], [0, 3], [1, 1], [2, 2], [3, 0], [3, 3]]),
    },
    {
        id: 8,
        name: '中心',
        size: 4,
        initial: generateLevel(4, [[1, 1], [1, 2], [2, 1], [2, 2]]),
    },
    {
        id: 9,
        name: '挑战 5x5',
        size: 5,
        initial: generateLevel(5, [[0, 2], [1, 1], [2, 0], [2, 4], [3, 3], [4, 2]]),
    },
    {
        id: 10,
        name: '大师',
        size: 5,
        initial: generateLevel(5, [[0, 0], [0, 4], [1, 2], [2, 1], [2, 3], [3, 2], [4, 0], [4, 4]]),
    },
];
