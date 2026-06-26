/**
 * 魔方游戏常量配置
 *
 * @module rubiks-cube/constants/config
 */

import { FaceColor, FaceKey, ViewAngles } from '../types/game';

/** 单个小立方体边长（px） */
export const CUBELET_SIZE = 56;

/** cubelet 间距（px） */
export const GAP = 4;

/** 层旋转动画时长（ms） */
export const ROTATION_DURATION = 300;

/** 打乱步数 */
export const SCRAMBLE_COUNT = 20;

/** 3D 透视距离（px） */
export const PERSPECTIVE = 800;

/** 初始视角 */
export const INITIAL_VIEW: ViewAngles = { rx: -30, ry: 30 };

/** 最小拖拽距离（px），低于此视为点击 */
export const MIN_DRAG_DISTANCE = 10;

/** 每个 cubelet 的实际偏移量 */
export const CUBELET_OFFSET = CUBELET_SIZE + GAP;

/** 单个小立方体边长的一半 */
export const CUBELET_HALF_SIZE = CUBELET_SIZE / 2;

/** 六个面的标准颜色配置 */
export const FACE_COLORS: Record<FaceColor, string> = {
    W: '#FFFFFF',
    Y: '#FFD500',
    R: '#B71234',
    O: '#FF5800',
    B: '#0046AD',
    G: '#009B48',
};

/** 内部不可见面的颜色 */
export const INNER_FACE_COLOR = '#1a1a2e';

/** 六个面的标识数组 */
export const FACE_KEYS: FaceKey[] = ['U', 'D', 'F', 'B', 'L', 'R'];

/** 初始还原态魔方 */
export const SOLVED_CUBE: Record<FaceKey, FaceColor> = {
    U: 'W',
    D: 'Y',
    F: 'R',
    B: 'O',
    L: 'B',
    R: 'G',
};

/** 12 个基本操作 */
export const MOVES: MoveConfig[] = [
    { move: 'R', face: 'R', direction: 'CW', label: "R" },
    { move: 'Ri', face: 'R', direction: 'CCW', label: "R'" },
    { move: 'L', face: 'L', direction: 'CW', label: "L" },
    { move: 'Li', face: 'L', direction: 'CCW', label: "L'" },
    { move: 'U', face: 'U', direction: 'CW', label: "U" },
    { move: 'Ui', face: 'U', direction: 'CCW', label: "U'" },
    { move: 'D', face: 'D', direction: 'CW', label: "D" },
    { move: 'Di', face: 'D', direction: 'CCW', label: "D'" },
    { move: 'F', face: 'F', direction: 'CW', label: "F" },
    { move: 'Fi', face: 'F', direction: 'CCW', label: "F'" },
    { move: 'B', face: 'B', direction: 'CW', label: "B" },
    { move: 'Bi', face: 'B', direction: 'CCW', label: "B'" },
];

/** 操作配置 */
export interface MoveConfig {
    /** 操作字符串 */
    move: `${FaceKey}${'' | 'i'}`;
    /** 操作面 */
    face: FaceKey;
    /** 旋转方向 */
    direction: 'CW' | 'CCW';
    /** 显示标签 */
    label: string;
}
