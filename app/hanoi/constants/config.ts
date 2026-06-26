/**
 * Hanoi Tower Game Constants
 *
 * @module hanoi/constants/config
 */

// AI测试生成
import { GameMode, HanoiConfig } from '../types/game';

/** 游戏配置 */
export const HANOI_CONFIG: HanoiConfig = {
    minLevel: 3,
    maxLevel: 8,
    diskColors: [
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#eab308', // yellow-500
        '#22c55e', // green-500
        '#06b6d4', // cyan-500
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
    ],
    animationDuration: 200,
};

/** 每种模式的柱子数量 */
export const PEG_COUNT: Record<GameMode, number> = {
    classic: 3,
    'frame-stewart': 4,
};

/** 模式标签 */
export const MODE_LABELS: Record<GameMode, string> = {
    classic: '经典三柱',
    'frame-stewart': '四柱挑战',
};

/** localStorage 键名 */
export const STORAGE_KEY = 'hanoi-game-stats';

/** 画布尺寸 */
export const CANVAS = {
    width: 800,
    height: 400,
    pegWidth: 12,
    pegHeight: 200,
    diskHeight: 24,
    diskMaxWidth: 120,
    diskMinWidth: 36,
    baseHeight: 20,
    /** 根据柱子数量返回柱子 X 坐标 */
    getPegXPositions(pegCount: number): number[] {
        if (pegCount === 3) return [150, 400, 650];
        return [100, 300, 500, 700];
    },
    /** 柱子点击检测半径 */
    getPegHitRadius(pegCount: number): number {
        return pegCount === 3 ? 100 : 80;
    },
};
