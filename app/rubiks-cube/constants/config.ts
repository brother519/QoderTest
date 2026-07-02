/**
 * 魔方游戏常量配置
 *
 * @module rubiks-cube/constants/config
 */

import { FaceColor, FaceKey, MoveKey, ViewAngles } from '../types/game';
import { fromEulerXY } from '../utils/viewMatrix';

/** 单个小立方体边长（px） */
export const CUBELET_SIZE = 56;

/** cubelet 间距（px） */
export const GAP = 4;

/** 层旋转动画时长（ms） */
export const ROTATION_DURATION = 150;

/** 打乱步数 */
export const SCRAMBLE_COUNT = 20;

/** 3D 透视距离（px） */
export const PERSPECTIVE = 800;

/** Initial view angle (equivalent to rotateX(-30) rotateY(30)) */
export const INITIAL_VIEW: ViewAngles = { matrix: fromEulerXY(-30, 30) };

/** 最小拖拽距离（px），低于此视为点击 */
export const MIN_DRAG_DISTANCE = 10;

/** 场景容器内边距（px），为 3D 旋转留出空间 */
export const SCENE_PADDING = 280;

/** 视角拖拽灵敏度系数 */
export const DRAG_SENSITIVITY = 0.5;

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

/** 18 个基本操作 */
export const MOVES: MoveConfig[] = [
    { move: 'R', moveKey: 'R', direction: 'CW', label: 'R' },
    { move: 'Ri', moveKey: 'R', direction: 'CCW', label: "R'" },
    { move: 'L', moveKey: 'L', direction: 'CW', label: 'L' },
    { move: 'Li', moveKey: 'L', direction: 'CCW', label: "L'" },
    { move: 'U', moveKey: 'U', direction: 'CW', label: 'U' },
    { move: 'Ui', moveKey: 'U', direction: 'CCW', label: "U'" },
    { move: 'D', moveKey: 'D', direction: 'CW', label: 'D' },
    { move: 'Di', moveKey: 'D', direction: 'CCW', label: "D'" },
    { move: 'F', moveKey: 'F', direction: 'CW', label: 'F' },
    { move: 'Fi', moveKey: 'F', direction: 'CCW', label: "F'" },
    { move: 'B', moveKey: 'B', direction: 'CW', label: 'B' },
    { move: 'Bi', moveKey: 'B', direction: 'CCW', label: "B'" },
    { move: 'M', moveKey: 'M', direction: 'CW', label: 'M' },
    { move: 'Mi', moveKey: 'M', direction: 'CCW', label: "M'" },
    { move: 'E', moveKey: 'E', direction: 'CW', label: 'E' },
    { move: 'Ei', moveKey: 'E', direction: 'CCW', label: "E'" },
    { move: 'S', moveKey: 'S', direction: 'CW', label: 'S' },
    { move: 'Si', moveKey: 'S', direction: 'CCW', label: "S'" },
];

/** 操作配置 */
export interface MoveConfig {
    /** 操作字符串 */
    move: `${MoveKey}${'' | 'i'}`;
    /** 旋转层 */
    moveKey: MoveKey;
    /** 旋转方向 */
    direction: 'CW' | 'CCW';
    /** 显示标签 */
    label: string;
}
