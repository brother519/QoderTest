/**
 * 魔方旋转逻辑
 *
 * 提供纯函数用于操作魔方状态：创建还原态、应用操作、打乱、胜利检测等。
 *
 * @module rubiks-cube/utils/cubeMoves
 */

import { CubeState, Face, FaceColor, FaceKey, Move } from '../types/game';
import { SCRAMBLE_COUNT, SOLVED_CUBE } from '../constants/config';

/** 面顺时针旋转 90° 的索引映射 */
const CW_MAP = [6, 3, 0, 7, 4, 1, 8, 5, 2];

/** 面逆时针旋转 90° 的索引映射 */
const CCW_MAP = [2, 5, 8, 1, 4, 7, 0, 3, 6];

/** 单面顺时针旋转 */
function rotateFaceCW(face: Face): Face {
    return CW_MAP.map((i) => face[i]);
}

/** 单面逆时针旋转 */
function rotateFaceCCW(face: Face): Face {
    return CCW_MAP.map((i) => face[i]);
}

/** 边缘循环规则：每个面顺时针时，四个相邻面上被影响的索引 */
interface EdgeCycle {
    /** 相邻面 */
    face: FaceKey;
    /** 该面上受影响的 3 个贴纸索引，按循环方向排列 */
    indices: [number, number, number];
}

/** 六个面的顺时针边缘循环定义 */
const EDGE_CYCLES: Record<FaceKey, EdgeCycle[]> = {
    R: [
        // Ordered so the edge flow is U->B->D->F->U (physical clockwise),
        // matching getLayerRotation('R','CW') = rotateX(+90deg).
        // The previous order [F,U,B,D] flowed U->F->D->B->U (counter-clockwise),
        // which was opposite to the animation and caused color jumps on commit.
        { face: 'U', indices: [2, 5, 8] },
        { face: 'F', indices: [2, 5, 8] },
        { face: 'D', indices: [2, 5, 8] },
        { face: 'B', indices: [6, 3, 0] },
    ],
    L: [
        { face: 'F', indices: [0, 3, 6] },
        { face: 'U', indices: [0, 3, 6] },
        { face: 'B', indices: [2, 5, 8] },
        { face: 'D', indices: [0, 3, 6] },
    ],
    U: [
        { face: 'F', indices: [0, 1, 2] },
        { face: 'R', indices: [0, 1, 2] },
        { face: 'B', indices: [2, 1, 0] },
        { face: 'L', indices: [2, 1, 0] },
    ],
    D: [
        { face: 'F', indices: [6, 7, 8] },
        { face: 'L', indices: [8, 7, 6] },
        { face: 'B', indices: [6, 7, 8] },
        { face: 'R', indices: [6, 7, 8] },
    ],
    F: [
        // Ordered for physical clockwise (U->R->D->L->U), matching
        // getLayerRotation('F','CW') = rotateZ(+90deg).
        { face: 'U', indices: [6, 7, 8] },
        { face: 'L', indices: [6, 3, 0] },
        { face: 'D', indices: [2, 1, 0] },
        { face: 'R', indices: [2, 5, 8] },
    ],
    B: [
        // Ordered for physical clockwise (U->L->D->R->U), matching
        // getLayerRotation('B','CW') = rotateZ(-90deg).
        { face: 'U', indices: [0, 1, 2] },
        { face: 'R', indices: [0, 3, 6] },
        { face: 'D', indices: [8, 7, 6] },
        { face: 'L', indices: [8, 5, 2] },
    ],
};

/**
 * 对 CubeState 深拷贝
 */
function cloneCubeState(state: CubeState): CubeState {
    return {
        U: [...state.U],
        D: [...state.D],
        F: [...state.F],
        B: [...state.B],
        L: [...state.L],
        R: [...state.R],
    };
}

/**
 * 应用单个顺时针操作
 */
function applyClockwiseMove(state: CubeState, face: FaceKey): CubeState {
    const next = cloneCubeState(state);

    // 1. 旋转操作面本身
    next[face] = rotateFaceCW(state[face]);

    // 2. 循环相邻面边缘贴纸
    const cycle = EDGE_CYCLES[face];
    const temp: FaceColor[] = cycle[0].indices.map((i) => state[cycle[0].face][i]);

    for (let i = 0; i < cycle.length - 1; i++) {
        const current = cycle[i];
        const nextCycle = cycle[i + 1];
        current.indices.forEach((idx, j) => {
            next[current.face][idx] = state[nextCycle.face][nextCycle.indices[j]];
        });
    }

    const last = cycle[cycle.length - 1];
    last.indices.forEach((idx, j) => {
        next[last.face][idx] = temp[j];
    });

    return next;
}

/**
 * 创建初始还原态魔方
 */
export function createSolvedCube(): CubeState {
    return {
        U: Array(9).fill(SOLVED_CUBE.U) as Face,
        D: Array(9).fill(SOLVED_CUBE.D) as Face,
        F: Array(9).fill(SOLVED_CUBE.F) as Face,
        B: Array(9).fill(SOLVED_CUBE.B) as Face,
        L: Array(9).fill(SOLVED_CUBE.L) as Face,
        R: Array(9).fill(SOLVED_CUBE.R) as Face,
    };
}

/**
 * 解析操作字符串
 */
function parseMove(move: Move): { face: FaceKey; isInverse: boolean } {
    const face = move.charAt(0) as FaceKey;
    const isInverse = move.length === 2 && move.charAt(1) === 'i';
    return { face, isInverse };
}

/**
 * 应用一步操作
 */
export function applyMove(state: CubeState, move: Move): CubeState {
    const { face, isInverse } = parseMove(move);

    if (!isInverse) {
        return applyClockwiseMove(state, face);
    }

    // 逆时针 = 顺时针执行 3 次
    let next = state;
    for (let i = 0; i < 3; i++) {
        next = applyClockwiseMove(next, face);
    }
    return next;
}

/**
 * 连续应用多步操作
 */
export function applyMoves(state: CubeState, moves: Move[]): CubeState {
    return moves.reduce((current, move) => applyMove(current, move), state);
}

/**
 * 获取操作的逆操作
 */
export function getInverseMove(move: Move): Move {
    const { face, isInverse } = parseMove(move);
    return isInverse ? (face as Move) : (`${face}i` as Move);
}

/**
 * 检测魔方是否已还原
 */
export function isSolved(state: CubeState): boolean {
    const faces: FaceKey[] = ['U', 'D', 'F', 'B', 'L', 'R'];
    return faces.every((face) => {
        const centerColor = state[face][4];
        return state[face].every((sticker) => sticker === centerColor);
    });
}

/**
 * 生成随机打乱序列
 */
export function generateScrambleMoves(count: number = SCRAMBLE_COUNT): Move[] {
    const allMoves: Move[] = ['R', 'Ri', 'L', 'Li', 'U', 'Ui', 'D', 'Di', 'F', 'Fi', 'B', 'Bi'];
    const moves: Move[] = [];
    let lastFace: FaceKey | '' = '';

    for (let i = 0; i < count; i++) {
        let move: Move;
        do {
            move = allMoves[Math.floor(Math.random() * allMoves.length)];
        } while (move.charAt(0) === lastFace);
        moves.push(move);
        lastFace = move.charAt(0) as FaceKey;
    }

    return moves;
}

/**
 * 打乱魔方状态并返回新状态与序列
 */
export function scrambleCube(
    state: CubeState,
    count: number = SCRAMBLE_COUNT
): { state: CubeState; moves: Move[] } {
    const moves = generateScrambleMoves(count);
    return {
        state: applyMoves(state, moves),
        moves,
    };
}
