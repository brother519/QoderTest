/**
 * 魔方渲染映射
 *
 * 将 CubeState 转换为 27 个 CubeletRenderData，用于 CSS 3D 渲染。
 *
 * @module rubiks-cube/utils/cubeRender
 */

import {
    CubeletPosition,
    CubeletRenderData,
    CubeState,
    FaceColor,
    FaceKey,
    MoveKey,
    StickerFace,
} from '../types/game';

/**
 * 根据 cubelet 的 (x, y, z) 坐标，计算其在指定面上对应的贴纸索引
 */
function getStickerIndex(face: FaceKey, x: number, y: number, z: number): number {
    switch (face) {
        case 'U':
            // U 面：u=x+1, v=z+1
            return (z + 1) * 3 + (x + 1);
        case 'D':
            // D 面：u=x+1, v=1-z
            return (1 - z) * 3 + (x + 1);
        case 'F':
            // F 面：u=x+1, v=y+1
            return (y + 1) * 3 + (x + 1);
        case 'B':
            // B 面：u=1-x, v=y+1
            return (y + 1) * 3 + (1 - x);
        case 'L':
            // L 面：u=1-z, v=y+1
            return (y + 1) * 3 + (1 - z);
        case 'R':
            // R 面：u=z+1, v=y+1
            return (y + 1) * 3 + (z + 1);
        default:
            return 0;
    }
}

/**
 * 获取某个层操作对应的 9 个 cubelet 位置
 */
export function getLayerCubelets(moveKey: MoveKey): CubeletPosition[] {
    const positions: CubeletPosition[] = [];
    for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
            switch (moveKey) {
                case 'U':
                case 'D':
                    positions.push([a, moveKey === 'U' ? -1 : 1, b]);
                    break;
                case 'F':
                case 'B':
                    positions.push([a, b, moveKey === 'F' ? 1 : -1]);
                    break;
                case 'L':
                case 'R':
                    positions.push([moveKey === 'L' ? -1 : 1, a, b]);
                    break;
                case 'M':
                    positions.push([0, a, b]);
                    break;
                case 'E':
                    positions.push([a, 0, b]);
                    break;
                case 'S':
                    positions.push([a, b, 0]);
                    break;
            }
        }
    }
    return positions;
}

/**
 * 获取层操作对应的旋转轴与角度
 */
export function getLayerRotation(
    moveKey: MoveKey,
    direction: 'CW' | 'CCW'
): { axis: 'x' | 'y' | 'z'; angle: number } {
    const isClockwise = direction === 'CW';
    switch (moveKey) {
        case 'R':
            return { axis: 'x', angle: isClockwise ? 90 : -90 };
        case 'L':
        case 'M':
            return { axis: 'x', angle: isClockwise ? -90 : 90 };
        case 'U':
            return { axis: 'y', angle: isClockwise ? -90 : 90 };
        case 'D':
        case 'E':
            return { axis: 'y', angle: isClockwise ? 90 : -90 };
        case 'F':
        case 'S':
            return { axis: 'z', angle: isClockwise ? 90 : -90 };
        case 'B':
            return { axis: 'z', angle: isClockwise ? -90 : 90 };
        default:
            return { axis: 'x', angle: 0 };
    }
}

/**
 * 将 CubeState 转换为 27 个 CubeletRenderData
 */
export function computeCubeletRenderData(state: CubeState): CubeletRenderData[] {
    const result: CubeletRenderData[] = [];

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const stickers: Partial<Record<StickerFace, FaceColor>> = {};

                if (x === 1) {
                    stickers.right = state.R[getStickerIndex('R', x, y, z)];
                }
                if (x === -1) {
                    stickers.left = state.L[getStickerIndex('L', x, y, z)];
                }
                if (y === -1) {
                    stickers.top = state.U[getStickerIndex('U', x, y, z)];
                }
                if (y === 1) {
                    stickers.bottom = state.D[getStickerIndex('D', x, y, z)];
                }
                if (z === 1) {
                    stickers.front = state.F[getStickerIndex('F', x, y, z)];
                }
                if (z === -1) {
                    stickers.back = state.B[getStickerIndex('B', x, y, z)];
                }

                result.push({
                    position: [x, y, z],
                    stickers,
                });
            }
        }
    }

    return result;
}
