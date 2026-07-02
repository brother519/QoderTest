/**
 * Rotation direction arrows indicator
 *
 * Renders small red directional arrows directly on the cube's visible side faces
 * at the boundary seam of the rotating layer, indicating movement direction.
 *
 * @module rubiks-cube/components/RotationArrows
 */

'use client';

import { Move, MoveKey } from '../types/game';
import { CUBELET_OFFSET, CUBELET_HALF_SIZE } from '../constants/config';

interface RotationArrowsProps {
    /** Current hovered move */
    move: Move | null | undefined;
}

type CubeFace = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';

/** Distance from cube center to face surface (slightly above stickers) */
const FACE_DIST = CUBELET_OFFSET + CUBELET_HALF_SIZE + 2;

/** Arrow visual length in px */
const ARROW_LENGTH = 42;

/** Transforms to position overlay on each face of the cube */
const FACE_TRANSFORMS: Record<CubeFace, string> = {
    front: `translateZ(${FACE_DIST}px)`,
    back: `rotateY(180deg) translateZ(${FACE_DIST}px)`,
    right: `rotateY(90deg) translateZ(${FACE_DIST}px)`,
    left: `rotateY(-90deg) translateZ(${FACE_DIST}px)`,
    top: `rotateX(90deg) translateZ(${FACE_DIST}px)`,
    bottom: `rotateX(-90deg) translateZ(${FACE_DIST}px)`,
};

/**
 * Local coordinate systems after face transforms:
 * - front:  local +X = world +X,  local +Y = world +Y
 * - back:   local +X = world -X,  local +Y = world +Y
 * - right:  local +X = world -Z,  local +Y = world +Y
 * - left:   local +X = world +Z,  local +Y = world +Y
 * - top:    local +X = world +X,  local +Y = world +Z
 * - bottom: local +X = world +X,  local +Y = world -Z
 *
 * Spec position mapping (cubelet index to spec coords):
 * - front:  spec.x = x_idx*60, spec.y = y_idx*60
 * - back:   spec.x = -x_idx*60, spec.y = y_idx*60
 * - right:  spec.x = -z_idx*60, spec.y = y_idx*60
 * - left:   spec.x = z_idx*60, spec.y = y_idx*60
 * - top:    spec.x = x_idx*60, spec.y = z_idx*60
 * - bottom: spec.x = x_idx*60, spec.y = -z_idx*60
 *
 * Angles: 0=right(+X local), 90=down(+Y local), 180=left, 270=up
 */

interface ArrowSpec {
    face: CubeFace;
    x: number; // position on face from center (px)
    y: number;
    angle: number; // rotation angle in degrees (0=right)
}

/** Cubelet center offset positions */
const P = CUBELET_OFFSET; // 60
const POSITIONS = [-P, 0, P]; // [-60, 0, 60]

/** Helper to generate 3 arrows along a row/col on a face */
function row(face: CubeFace, fixedAxis: 'x' | 'y', fixedVal: number, angle: number): ArrowSpec[] {
    return POSITIONS.map((v) => ({
        face,
        x: fixedAxis === 'y' ? v : fixedVal,
        y: fixedAxis === 'x' ? v : fixedVal,
        angle,
    }));
}

/**
 * Arrow definitions for each MoveKey in CW direction.
 * Arrows on ALL 4 side faces of the rotating layer (not the rotating face itself).
 * For CCW, angles are reversed (+180°).
 */
const MOVE_ARROWS_CW: Record<MoveKey, ArrowSpec[]> = {
    // U CW (rotateY(-90°)): stickers move left on all side faces → angle 180
    U: [
        ...row('front', 'y', -P, 180),
        ...row('right', 'y', -P, 180),
        ...row('back', 'y', -P, 180),
        ...row('left', 'y', -P, 180),
    ],
    // D CW (rotateY(+90°)): stickers move right on all side faces → angle 0
    D: [
        ...row('front', 'y', P, 0),
        ...row('right', 'y', P, 0),
        ...row('back', 'y', P, 0),
        ...row('left', 'y', P, 0),
    ],
    // R CW (CW from right): front/top/bottom UP(270), back DOWN(90)
    R: [
        ...row('front', 'x', P, 270),
        ...row('top', 'x', P, 270),
        ...row('back', 'x', -P, 90),
        ...row('bottom', 'x', P, 270),
    ],
    // L CW (CW from left): front/top/bottom DOWN(90), back UP(270)
    L: [
        ...row('front', 'x', -P, 90),
        ...row('top', 'x', -P, 90),
        ...row('back', 'x', P, 270),
        ...row('bottom', 'x', -P, 90),
    ],
    // F CW (CW from front): top RIGHT(0), right DOWN(90), bottom LEFT(180), left UP(270)
    F: [
        ...row('top', 'y', P, 0),
        ...row('right', 'x', -P, 90),
        ...row('bottom', 'y', -P, 180),
        ...row('left', 'x', P, 270),
    ],
    // B CW (CW from back): top LEFT(180), right UP(270), bottom RIGHT(0), left DOWN(90)
    B: [
        ...row('top', 'y', -P, 180),
        ...row('right', 'x', P, 270),
        ...row('bottom', 'y', P, 0),
        ...row('left', 'x', -P, 90),
    ],
    // M CW (same as L): front/top/bottom DOWN(90), back UP(270)
    M: [
        ...row('front', 'x', 0, 90),
        ...row('top', 'x', 0, 90),
        ...row('back', 'x', 0, 270),
        ...row('bottom', 'x', 0, 90),
    ],
    // E CW (same as D, rotateY(+90°)): stickers move right → angle 0
    E: [
        ...row('front', 'y', 0, 0),
        ...row('right', 'y', 0, 0),
        ...row('back', 'y', 0, 0),
        ...row('left', 'y', 0, 0),
    ],
    // S CW (same as F): top RIGHT(0), right DOWN(90), bottom LEFT(180), left UP(270)
    S: [
        ...row('top', 'y', 0, 0),
        ...row('right', 'x', 0, 90),
        ...row('bottom', 'y', 0, 180),
        ...row('left', 'x', 0, 270),
    ],
};

function parseMove(move: Move): { face: MoveKey; direction: 'CW' | 'CCW' } {
    const face = move.charAt(0) as MoveKey;
    const direction = move.length === 2 ? 'CCW' : 'CW';
    return { face, direction };
}

/**
 * Single arrow element - a thin red line with arrowhead
 */
function Arrow({ spec, reverse }: { spec: ArrowSpec; reverse: boolean }) {
    const finalAngle = reverse ? spec.angle + 180 : spec.angle;

    return (
        <div
            style={{
                position: 'absolute',
                left: CUBELET_HALF_SIZE,
                top: CUBELET_HALF_SIZE,
                width: 0,
                height: 0,
                transformStyle: 'preserve-3d',
                transform: FACE_TRANSFORMS[spec.face],
                pointerEvents: 'none',
            }}
        >
            <svg
                width={ARROW_LENGTH}
                height={14}
                viewBox={`0 0 ${ARROW_LENGTH} 14`}
                style={{
                    position: 'absolute',
                    left: spec.x - ARROW_LENGTH / 2,
                    top: spec.y - 7,
                    transform: `rotate(${finalAngle}deg)`,
                    overflow: 'visible',
                    filter: 'drop-shadow(0 0 2px rgba(255,0,0,0.6))',
                }}
            >
                {/* Arrow line */}
                <line
                    x1={2}
                    y1={7}
                    x2={ARROW_LENGTH - 11}
                    y2={7}
                    stroke="#ff2222"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />
                {/* Arrowhead triangle */}
                <polygon
                    points={`${ARROW_LENGTH - 2},7 ${ARROW_LENGTH - 11},2.5 ${ARROW_LENGTH - 11},11.5`}
                    fill="#ff2222"
                />
            </svg>
        </div>
    );
}

export function RotationArrows({ move }: RotationArrowsProps) {
    if (!move) return null;

    const { face, direction } = parseMove(move);
    const arrows = MOVE_ARROWS_CW[face];
    const reverse = direction === 'CCW';

    return (
        <>
            {arrows.map((spec, i) => (
                <Arrow key={i} spec={spec} reverse={reverse} />
            ))}
        </>
    );
}
