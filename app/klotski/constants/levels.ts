/**
 * Classic Klotski puzzle level definitions
 *
 * Each level represents a historically famous 华容道 configuration.
 * All layouts use a 4x5 grid with exactly 2 empty cells.
 * Standard pieces: 1 king (2x2), 1 horizontal general (2x1),
 * 4 vertical generals (1x2), and 4 soldiers (1x1).
 */

import { Level } from '../types/game';

export const LEVELS: Level[] = [
    {
        id: 'hengdao-lima',
        name: '横刀立马',
        description: '最经典的华容道布局，关羽横刀挡道',
        parSteps: 81,
        blocks: [
            { id: 'king', type: 'king', row: 0, col: 1, width: 2, height: 2, label: '曹操' },
            { id: 'guanyu', type: 'general_h', row: 2, col: 1, width: 2, height: 1, label: '关羽' },
            { id: 'zhangfei', type: 'general_v', row: 0, col: 0, width: 1, height: 2, label: '张飞' },
            { id: 'zhaoyun', type: 'general_v', row: 0, col: 3, width: 1, height: 2, label: '赵云' },
            { id: 'machao', type: 'general_v', row: 2, col: 0, width: 1, height: 2, label: '马超' },
            { id: 'huangzhong', type: 'general_v', row: 2, col: 3, width: 1, height: 2, label: '黄忠' },
            { id: 'soldier1', type: 'soldier', row: 3, col: 1, width: 1, height: 1, label: '兵' },
            { id: 'soldier2', type: 'soldier', row: 3, col: 2, width: 1, height: 1, label: '兵' },
            { id: 'soldier3', type: 'soldier', row: 4, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier4', type: 'soldier', row: 4, col: 3, width: 1, height: 1, label: '兵' },
        ],
    },
    {
        id: 'zhihui-ruoding',
        name: '指挥若定',
        description: '运筹帷幄，兵卒列阵于侧',
        parSteps: 70,
        blocks: [
            { id: 'king', type: 'king', row: 0, col: 1, width: 2, height: 2, label: '曹操' },
            { id: 'guanyu', type: 'general_h', row: 2, col: 1, width: 2, height: 1, label: '关羽' },
            { id: 'zhangfei', type: 'general_v', row: 0, col: 0, width: 1, height: 2, label: '张飞' },
            { id: 'zhaoyun', type: 'general_v', row: 0, col: 3, width: 1, height: 2, label: '赵云' },
            { id: 'machao', type: 'general_v', row: 2, col: 0, width: 1, height: 2, label: '马超' },
            { id: 'huangzhong', type: 'general_v', row: 2, col: 3, width: 1, height: 2, label: '黄忠' },
            { id: 'soldier1', type: 'soldier', row: 3, col: 1, width: 1, height: 1, label: '兵' },
            { id: 'soldier2', type: 'soldier', row: 3, col: 2, width: 1, height: 1, label: '兵' },
            { id: 'soldier3', type: 'soldier', row: 4, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier4', type: 'soldier', row: 4, col: 1, width: 1, height: 1, label: '兵' },
        ],
    },
    {
        id: 'bingfen-sanlu',
        name: '兵分三路',
        description: '将士分散布阵，兵卒各守要道',
        parSteps: 72,
        blocks: [
            { id: 'king', type: 'king', row: 0, col: 1, width: 2, height: 2, label: '曹操' },
            { id: 'guanyu', type: 'general_h', row: 4, col: 1, width: 2, height: 1, label: '关羽' },
            { id: 'zhangfei', type: 'general_v', row: 0, col: 0, width: 1, height: 2, label: '张飞' },
            { id: 'zhaoyun', type: 'general_v', row: 0, col: 3, width: 1, height: 2, label: '赵云' },
            { id: 'machao', type: 'general_v', row: 2, col: 1, width: 1, height: 2, label: '马超' },
            { id: 'huangzhong', type: 'general_v', row: 2, col: 2, width: 1, height: 2, label: '黄忠' },
            { id: 'soldier1', type: 'soldier', row: 2, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier2', type: 'soldier', row: 2, col: 3, width: 1, height: 1, label: '兵' },
            { id: 'soldier3', type: 'soldier', row: 3, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier4', type: 'soldier', row: 3, col: 3, width: 1, height: 1, label: '兵' },
        ],
    },
    {
        id: 'cengceng-shefang',
        name: '层层设防',
        description: '纵深防御阵型，步步为营',
        parSteps: 62,
        blocks: [
            { id: 'king', type: 'king', row: 0, col: 1, width: 2, height: 2, label: '曹操' },
            { id: 'guanyu', type: 'general_h', row: 2, col: 2, width: 2, height: 1, label: '关羽' },
            { id: 'zhangfei', type: 'general_v', row: 0, col: 0, width: 1, height: 2, label: '张飞' },
            { id: 'zhaoyun', type: 'general_v', row: 0, col: 3, width: 1, height: 2, label: '赵云' },
            { id: 'machao', type: 'general_v', row: 2, col: 0, width: 1, height: 2, label: '马超' },
            { id: 'huangzhong', type: 'general_v', row: 3, col: 2, width: 1, height: 2, label: '黄忠' },
            { id: 'soldier1', type: 'soldier', row: 2, col: 1, width: 1, height: 1, label: '兵' },
            { id: 'soldier2', type: 'soldier', row: 3, col: 1, width: 1, height: 1, label: '兵' },
            { id: 'soldier3', type: 'soldier', row: 4, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier4', type: 'soldier', row: 3, col: 3, width: 1, height: 1, label: '兵' },
        ],
    },
    {
        id: 'simian-chuge',
        name: '四面楚歌',
        description: '四方合围，兵卒紧逼曹营',
        parSteps: 50,
        blocks: [
            { id: 'king', type: 'king', row: 0, col: 1, width: 2, height: 2, label: '曹操' },
            { id: 'guanyu', type: 'general_h', row: 2, col: 1, width: 2, height: 1, label: '关羽' },
            { id: 'zhangfei', type: 'general_v', row: 0, col: 0, width: 1, height: 2, label: '张飞' },
            { id: 'zhaoyun', type: 'general_v', row: 0, col: 3, width: 1, height: 2, label: '赵云' },
            { id: 'machao', type: 'general_v', row: 3, col: 0, width: 1, height: 2, label: '马超' },
            { id: 'huangzhong', type: 'general_v', row: 3, col: 3, width: 1, height: 2, label: '黄忠' },
            { id: 'soldier1', type: 'soldier', row: 2, col: 0, width: 1, height: 1, label: '兵' },
            { id: 'soldier2', type: 'soldier', row: 2, col: 3, width: 1, height: 1, label: '兵' },
            { id: 'soldier3', type: 'soldier', row: 3, col: 1, width: 1, height: 1, label: '兵' },
            { id: 'soldier4', type: 'soldier', row: 3, col: 2, width: 1, height: 1, label: '兵' },
        ],
    },
];
