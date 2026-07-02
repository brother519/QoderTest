/**
 * Rotation matrix utilities for trackball-style 3D view rotation.
 *
 * Uses 4x4 column-major matrices compatible with CSS matrix3d().
 * This avoids gimbal lock that occurs with Euler angle rotateX/rotateY.
 *
 * @module rubiks-cube/utils/viewMatrix
 */

/** 4x4 identity matrix (column-major) */
export function identityMatrix(): number[] {
    // prettier-ignore
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

/** Multiply two 4x4 column-major matrices: result = a * b */
export function multiplyMatrices(a: number[], b: number[]): number[] {
    const result = new Array(16).fill(0);
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[row + k * 4] * b[k + col * 4];
            }
            result[row + col * 4] = sum;
        }
    }
    return result;
}

/** Create a rotation matrix around the X axis (angle in degrees, column-major) */
export function rotationX(degrees: number): number[] {
    const rad = (degrees * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // prettier-ignore
    return [
        1, 0,  0, 0,
        0, c,  s, 0,
        0, -s, c, 0,
        0, 0,  0, 1,
    ];
}

/** Create a rotation matrix around the Y axis (angle in degrees, column-major) */
export function rotationY(degrees: number): number[] {
    const rad = (degrees * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // prettier-ignore
    return [
        c, 0, -s, 0,
        0, 1,  0, 0,
        s, 0,  c, 0,
        0, 0,  0, 1,
    ];
}

/**
 * Convert Euler angles (rx, ry) in degrees to a rotation matrix.
 * Equivalent to CSS: rotateX(rx) rotateY(ry) — applies Y first, then X.
 */
export function fromEulerXY(rx: number, ry: number): number[] {
    return multiplyMatrices(rotationX(rx), rotationY(ry));
}

/**
 * Apply an incremental screen-space rotation to an existing matrix.
 * deltaRx/deltaRy are in degrees. The rotation is applied in the global (screen)
 * frame by PRE-multiplying the delta rotation onto the current matrix.
 */
export function applyScreenRotation(
    currentMatrix: number[],
    deltaRx: number,
    deltaRy: number
): number[] {
    // Pre-multiply: new = Rx(drx) * Ry(dry) * current
    const delta = multiplyMatrices(rotationX(deltaRx), rotationY(deltaRy));
    return multiplyMatrices(delta, currentMatrix);
}

/** Convert a 4x4 column-major matrix to a CSS matrix3d() string */
export function matrixToCSS(m: number[]): string {
    return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-10 ? 0 : v)).join(',')})`;
}
