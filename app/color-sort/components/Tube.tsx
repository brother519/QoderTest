'use client';

import { TubeState } from '../types/game';
import {
    COLOR_PALETTE,
    TUBE_WIDTH,
    TUBE_HEIGHT,
    BALL_SIZE,
    BALL_GAP,
    BALL_BOTTOM_PADDING,
} from '../constants/config';

interface TubeProps {
    tube: TubeState;
    isSelected: boolean;
    isValidTarget: boolean;
    onClick: () => void;
}

export function Tube({ tube, isSelected, isValidTarget, onClick }: TubeProps) {
    return (
        <div
            className={`relative cursor-pointer transition-transform duration-150 ${
                isSelected ? '-translate-y-2' : ''
            } ${isValidTarget ? 'ring-2 ring-green-400/40 rounded-xl' : ''}`}
            style={{ width: TUBE_WIDTH, height: TUBE_HEIGHT }}
            onClick={onClick}
        >
            <div className="absolute inset-0 border-l-2 border-r-2 border-b-2 border-white/20 rounded-b-xl" />

            {Array.from({ length: tube.capacity }).map((_, i) => (
                <div
                    key={`marker-${i}`}
                    className="absolute left-1 right-1 border-t border-white/5"
                    style={{
                        bottom: i * (BALL_SIZE + BALL_GAP) + BALL_BOTTOM_PADDING,
                    }}
                />
            ))}

            {tube.balls.map((color, i) => {
                const palette = COLOR_PALETTE[color];
                const isTop = i === tube.balls.length - 1;
                return (
                    <div
                        key={`ball-${i}`}
                        className={`absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-200 ${
                            palette?.bg ?? 'bg-gray-500'
                        } ${
                            isTop && isSelected
                                ? 'shadow-lg scale-110 ring-2 ring-white/40'
                                : ''
                        }`}
                        style={{
                            width: BALL_SIZE,
                            height: BALL_SIZE,
                            bottom: i * (BALL_SIZE + BALL_GAP) + BALL_BOTTOM_PADDING,
                        }}
                    />
                );
            })}
        </div>
    );
}
