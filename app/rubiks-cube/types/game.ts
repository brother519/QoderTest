/**
 * 魔方游戏类型定义
 *
 * @module rubiks-cube/types/game
 */

import { GameStatus } from '@/lib/types/game';

/** 六个面的标识 */
export type FaceKey = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

/** 中间层标识（slice moves） */
export type SliceKey = 'M' | 'E' | 'S';

/** 所有可旋转层标识 */
export type MoveKey = FaceKey | SliceKey;

/** 贴纸颜色 */
export type FaceColor = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';

/** 单面 9 个贴纸，行优先索引 0-8 */
export type Face = FaceColor[];

/** 魔方状态：六个面各 9 个贴纸 */
export type CubeState = Record<FaceKey, Face>;

/** 旋转方向 */
export type MoveDirection = 'CW' | 'CCW';

/** 一步操作，如 'R' 或 'Ri'（i 表示 inverse，逆时针） */
export type Move = `${MoveKey}${'' | 'i'}`;

/** 小立方体在 3D 空间中的坐标，每个分量取 -1/0/1 */
export type CubeletPosition = [number, number, number];

/** 贴纸面的物理方向 */
export type StickerFace = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';

/** 单个 cubelet 的渲染数据 */
export interface CubeletRenderData {
    /** 3D 坐标 */
    position: CubeletPosition;
    /** 六个物理方向上可见的贴纸颜色 */
    stickers: Partial<Record<StickerFace, FaceColor>>;
}

/** View rotation stored as a 4x4 column-major matrix (trackball style, no gimbal lock) */
export interface ViewAngles {
    matrix: number[];
}

/** 临时动画组数据 */
export interface AnimationGroup {
    /** 操作面 */
    face: FaceKey;
    /** 旋转方向 */
    direction: MoveDirection;
    /** 该层包含的 9 个 cubelet 位置 */
    positions: CubeletPosition[];
}

/** useRubiksCubeGame 返回值 */
export interface UseRubiksCubeGameReturn {
    /** 当前魔方状态 */
    cubeState: CubeState;
    /** 游戏状态 */
    status: GameStatus;
    /** 用户操作步数 */
    moves: number;
    /** 已用时间（秒） */
    time: number;
    /** 当前视角 */
    viewAngles: ViewAngles;
    /** 是否正在播放层旋转动画 */
    isAnimating: boolean;
    /** 当前待执行的动画操作 */
    pendingMove: Move | null;
    /** 打乱序列 */
    scrambleMoves: Move[];
    /** 最高分 */
    highScore: number;
    /** 当前 hover 的操作 */
    hoveredMove: Move | null;
    /** 执行一步操作 */
    applyMove: (move: Move) => void;
    /** 动画结束，提交状态更新 */
    commitMove: () => void;
    /** 打乱魔方 */
    scramble: () => void;
    /** 重置为还原态 */
    reset: () => void;
    /** 更新视角 */
    setViewAngles: (angles: ViewAngles) => void;
    /** 设置 hover 的操作 */
    setHoveredMove: (move: Move | null) => void;
}
