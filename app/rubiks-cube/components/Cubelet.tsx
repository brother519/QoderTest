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
}

const STICKER_FACES: StickerFace[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export function Cubelet({ data, hidden }: CubeletProps) {
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
