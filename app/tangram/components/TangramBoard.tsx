import React from 'react';
import { TangramPieceState, TangramPieceType, PuzzleDef } from '../types/game';
import { TangramPiece } from './TangramPiece';
import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    SILHOUETTE_ORIGIN_X,
    SILHOUETTE_ORIGIN_Y,
    UNIT_PX,
    SILHOUETTE_SIZE,
} from '../constants/config';

interface TangramBoardProps {
    pieces: TangramPieceState[];
    puzzle: PuzzleDef;
    selectedPieceId: TangramPieceType | null;
    onSelectPiece: (id: TangramPieceType) => void;
    onDragMove: (id: TangramPieceType, dx: number, dy: number) => void;
    onDragEnd: (id: TangramPieceType) => void;
    onDeselectAll: () => void;
}

export const TangramBoard: React.FC<TangramBoardProps> = ({
    pieces,
    puzzle,
    selectedPieceId,
    onSelectPiece,
    onDragMove,
    onDragEnd,
    onDeselectAll,
}) => {
    const silhouettePolygons = puzzle.silhouette.polygons.map((poly) =>
        poly
            .map(
                (v) =>
                    `${SILHOUETTE_ORIGIN_X + v.x * UNIT_PX},${SILHOUETTE_ORIGIN_Y + v.y * UNIT_PX}`
            )
            .join(' ')
    );

    return (
        <svg
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50"
            onPointerDown={(e) => {
                if (e.target === e.currentTarget) onDeselectAll();
            }}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <pattern
                    id="grid"
                    width={UNIT_PX}
                    height={UNIT_PX}
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d={`M ${UNIT_PX} 0 L 0 0 0 ${UNIT_PX}`}
                        fill="none"
                        stroke="rgba(148,163,184,0.08)"
                        strokeWidth="0.5"
                    />
                </pattern>
            </defs>

            <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="url(#grid)" />

            {silhouettePolygons.map((points, i) => (
                <polygon
                    key={i}
                    points={points}
                    fill="rgba(148,163,184,0.12)"
                    stroke="rgba(148,163,184,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                />
            ))}

            <line
                x1={0}
                y1={SILHOUETTE_ORIGIN_Y + SILHOUETTE_SIZE + 20}
                x2={BOARD_WIDTH}
                y2={SILHOUETTE_ORIGIN_Y + SILHOUETTE_SIZE + 20}
                stroke="rgba(148,163,184,0.15)"
                strokeWidth="1"
            />

            {pieces.map((piece) => (
                <TangramPiece
                    key={piece.id}
                    piece={piece}
                    isSelected={selectedPieceId === piece.id}
                    onSelect={onSelectPiece}
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                />
            ))}
        </svg>
    );
};
