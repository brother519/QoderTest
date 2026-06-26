/**
 * 一笔画游戏 - 关卡数据与配置
 *
 * 所有关卡均满足欧拉路径条件：
 * - 欧拉路径：恰好有 0 或 2 个奇数度节点
 * - 欧拉回路：所有节点度数均为偶数（起终点相同）
 *
 * @module one-stroke/constants/config
 */

import { Level } from '../types/game';

/** SVG 视口尺寸 */
export const SVG_SIZE = 400;

/** 节点半径 */
export const NODE_RADIUS = 18;

/** 边线宽 */
export const EDGE_STROKE_WIDTH = 6;

/** 已走过的边的颜色（渐变色数组，依走过顺序循环使用） */
export const TRAVERSED_COLORS = [
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // red
    '#3b82f6', // blue
];

/** 所有关卡数据 */
export const LEVELS: Level[] = [
    // ──────────── Level 1：三角形（欧拉回路） ────────────
    {
        id: 1,
        name: '三角形',
        nodes: [
            { id: 0, x: 200, y: 80 },
            { id: 1, x: 80, y: 300 },
            { id: 2, x: 320, y: 300 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 2, to: 0 },
        ],
    },

    // ──────────── Level 2：正方形（欧拉回路） ────────────
    {
        id: 2,
        name: '正方形',
        nodes: [
            { id: 0, x: 100, y: 100 },
            { id: 1, x: 300, y: 100 },
            { id: 2, x: 300, y: 300 },
            { id: 3, x: 100, y: 300 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 2, to: 3 },
            { id: 3, from: 3, to: 0 },
        ],
    },

    // ──────────── Level 3：信封形（欧拉路径，2个奇数度节点） ────────────
    {
        id: 3,
        name: '信封',
        nodes: [
            { id: 0, x: 80, y: 100 },
            { id: 1, x: 320, y: 100 },
            { id: 2, x: 320, y: 300 },
            { id: 3, x: 80, y: 300 },
            { id: 4, x: 200, y: 200 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 2, to: 3 },
            { id: 3, from: 3, to: 0 },
            { id: 4, from: 0, to: 4 },
            { id: 5, from: 1, to: 4 },
            { id: 6, from: 2, to: 4 },
            { id: 7, from: 3, to: 4 },
        ],
    },

    // ──────────── Level 4：五角星（欧拉路径） ────────────
    {
        id: 4,
        name: '五角星',
        nodes: [
            { id: 0, x: 200, y: 60 },
            { id: 1, x: 360, y: 290 },
            { id: 2, x: 110, y: 170 },
            { id: 3, x: 290, y: 170 },
            { id: 4, x: 40, y: 290 },
        ],
        edges: [
            { id: 0, from: 0, to: 2 },
            { id: 1, from: 2, to: 1 },
            { id: 2, from: 1, to: 3 },
            { id: 3, from: 3, to: 4 },
            { id: 4, from: 4, to: 0 },
        ],
    },

    // ──────────── Level 5：带对角线的正方形（欧拉路径） ────────────
    {
        id: 5,
        name: '带对角线正方形',
        nodes: [
            { id: 0, x: 100, y: 100 },
            { id: 1, x: 300, y: 100 },
            { id: 2, x: 300, y: 300 },
            { id: 3, x: 100, y: 300 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 2, to: 3 },
            { id: 3, from: 3, to: 0 },
            { id: 4, from: 0, to: 2 },
        ],
    },

    // ──────────── Level 6：双三角形（欧拉回路） ────────────
    {
        id: 6,
        name: '双三角形',
        nodes: [
            { id: 0, x: 200, y: 70 },
            { id: 1, x: 80, y: 200 },
            { id: 2, x: 320, y: 200 },
            { id: 3, x: 200, y: 330 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 0, to: 2 },
            { id: 2, from: 1, to: 2 },
            { id: 3, from: 1, to: 3 },
            { id: 4, from: 2, to: 3 },
            { id: 5, from: 0, to: 3 },
        ],
    },

    // ──────────── Level 7：H 字形（欧拉路径） ────────────
    {
        id: 7,
        name: 'H 字形',
        nodes: [
            { id: 0, x: 100, y: 80 },
            { id: 1, x: 100, y: 200 },
            { id: 2, x: 100, y: 320 },
            { id: 3, x: 300, y: 80 },
            { id: 4, x: 300, y: 200 },
            { id: 5, x: 300, y: 320 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 3, to: 4 },
            { id: 3, from: 4, to: 5 },
            { id: 4, from: 1, to: 4 },
        ],
    },

    // ──────────── Level 8：蝴蝶形（欧拉路径） ────────────
    {
        id: 8,
        name: '蝴蝶形',
        nodes: [
            { id: 0, x: 200, y: 200 },
            { id: 1, x: 80, y: 80 },
            { id: 2, x: 320, y: 80 },
            { id: 3, x: 80, y: 320 },
            { id: 4, x: 320, y: 320 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 0, to: 2 },
            { id: 2, from: 0, to: 3 },
            { id: 3, from: 0, to: 4 },
            { id: 4, from: 1, to: 2 },
            { id: 5, from: 3, to: 4 },
        ],
    },

    // ──────────── Level 9：六边形（欧拉回路） ────────────
    {
        id: 9,
        name: '六边形',
        nodes: [
            { id: 0, x: 200, y: 60 },
            { id: 1, x: 330, y: 130 },
            { id: 2, x: 330, y: 270 },
            { id: 3, x: 200, y: 340 },
            { id: 4, x: 70, y: 270 },
            { id: 5, x: 70, y: 130 },
            { id: 6, x: 200, y: 200 }, // center
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 1, to: 2 },
            { id: 2, from: 2, to: 3 },
            { id: 3, from: 3, to: 4 },
            { id: 4, from: 4, to: 5 },
            { id: 5, from: 5, to: 0 },
            { id: 6, from: 0, to: 6 },
            { id: 7, from: 2, to: 6 },
            { id: 8, from: 4, to: 6 },
        ],
    },

    // ──────────── Level 10：复杂迷宫形（欧拉路径） ────────────
    {
        id: 10,
        name: '复杂图形',
        nodes: [
            { id: 0, x: 200, y: 60 },
            { id: 1, x: 100, y: 160 },
            { id: 2, x: 300, y: 160 },
            { id: 3, x: 60, y: 280 },
            { id: 4, x: 200, y: 240 },
            { id: 5, x: 340, y: 280 },
            { id: 6, x: 130, y: 360 },
            { id: 7, x: 270, y: 360 },
        ],
        edges: [
            { id: 0, from: 0, to: 1 },
            { id: 1, from: 0, to: 2 },
            { id: 2, from: 1, to: 2 },
            { id: 3, from: 1, to: 3 },
            { id: 4, from: 1, to: 4 },
            { id: 5, from: 2, to: 4 },
            { id: 6, from: 2, to: 5 },
            { id: 7, from: 3, to: 4 },
            { id: 8, from: 4, to: 5 },
            { id: 9, from: 3, to: 6 },
            { id: 10, from: 5, to: 7 },
            { id: 11, from: 6, to: 7 },
        ],
    },
];

/** 本地存储键 */
export const STORAGE_KEY = 'one-stroke-unlocked';
