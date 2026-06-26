/**
 * 魔方贴纸面组件
 *
 * @module rubiks-cube/components/Sticker
 */

'use client';

import { FaceColor, StickerFace } from '../types/game';
import { CUBELET_HALF_SIZE, FACE_COLORS, INNER_FACE_COLOR } from '../constants/config';

interface StickerProps {
    /** 贴纸面方向 */
    face: StickerFace;
    /** 贴纸颜色，为空表示内部不可见面 */
    color?: FaceColor;
    /** 是否隐藏 */
    hidden?: boolean;
}

/** 各面在 3D 空间中的 transform */
const FACE_TRANSFORMS: Record<StickerFace, string> = {
    front: `translateZ(${CUBELET_HALF_SIZE}px)`,
    back: `rotateY(180deg) translateZ(${CUBELET_HALF_SIZE}px)`,
    right: `rotateY(90deg) translateZ(${CUBELET_HALF_SIZE}px)`,
    left: `rotateY(-90deg) translateZ(${CUBELET_HALF_SIZE}px)`,
    top: `rotateX(90deg) translateZ(${CUBELET_HALF_SIZE}px)`,
    bottom: `rotateX(-90deg) translateZ(${CUBELET_HALF_SIZE}px)`,
};

export function Sticker({ face, color, hidden }: StickerProps) {
    const isVisible = color !== undefined;
    const backgroundColor = isVisible ? FACE_COLORS[color] : INNER_FACE_COLOR;

    return (
        <div
            data-face={face}
            style={{
                position: 'absolute',
                width: CUBELET_HALF_SIZE * 2,
                height: CUBELET_HALF_SIZE * 2,
                backfaceVisibility: 'hidden',
                backgroundColor,
                transform: FACE_TRANSFORMS[face],
                borderRadius: 4,
                border: isVisible ? '1px solid rgba(0,0,0,0.25)' : 'none',
                boxSizing: 'border-box',
                visibility: hidden ? 'hidden' : 'visible',
            }}
        />
    );
}
