/**
 * 单个小立方体组件
 *
 * @module rubiks-cube/components/Cubelet
 */

'use client';

import { CubeletRenderData, StickerFace } from '../types/game';
import { CUBELET_OFFSET } from '../constants/config';
import { Sticker } from './Sticker';

interface CubeletProps {
    /** cubelet 渲染数据 */
    data: CubeletRenderData;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 是否高亮（hover 预览） */
    highlight?: boolean;
}

const STICKER_FACES: StickerFace[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function Cubelet({ data, hidden, highlight }: CubeletProps) {
    const [x, y, z] = data.position;

    return (
        <div
            data-cubelet-position={`${x},${y},${z}`}
            style={{
                position: 'absolute',
                width: CUBELET_OFFSET - 4,
                height: CUBELET_OFFSET - 4,
                transformStyle: 'preserve-3d',
                transform: `translate3d(${
                    x * CUBELET_OFFSET
                }px, ${y * CUBELET_OFFSET}px, ${z * CUBELET_OFFSET}px)`,
                visibility: hidden ? 'hidden' : 'visible',
                boxShadow: highlight
                    ? '0 0 20px 6px rgba(255,255,255,0.85), inset 0 0 12px rgba(255,255,255,0.5)'
                    : 'none',
                borderRadius: highlight ? 4 : 0,
                outline: highlight ? '2px solid rgba(255,255,255,0.9)' : 'none',
                outlineOffset: highlight ? 2 : 0,
            }}
        >
            {STICKER_FACES.map((face) => (
                <Sticker
                    key={face}
                    face={face}
                    color={data.stickers[face]}
                    hidden={hidden}
                />
            ))}
        </div>
    );
}
