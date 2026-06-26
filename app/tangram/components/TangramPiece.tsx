import React from 'react';
import { TangramPieceType, TangramPieceState } from '../types/game';
import { PIECE_COLORS, PIECE_LOCAL_VERTICES, UNIT_PX } from '../constants/config';

interface TangramPieceProps {
    piece: TangramPieceState;
    isSelected: boolean;
    onSelect: (id: TangramPieceType) => void;
    onDragMove: (id: TangramPieceType, dx: number, dy: number) => void;
    onDragEnd: (id: TangramPieceType) => void;
}

export const TangramPiece: React.FC<TangramPieceProps> = ({
    piece,
    isSelected,
    onSelect,
    onDragMove,
    onDragEnd,
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartRef = React.useRef<{ clientX: number; clientY: number } | null>(null);
    const svgRef = React.useRef<SVGGElement>(null);

    const getScale = React.useCallback(() => {
        const svg = svgRef.current?.ownerSVGElement;
        if (!svg) return 1;
        const rect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        return viewBox.width / rect.width;
    }, []);

    const handlePointerDown = React.useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            e.preventDefault();
            (e.target as Element).setPointerCapture(e.pointerId);
            onSelect(piece.id);
            setIsDragging(true);
            dragStartRef.current = { clientX: e.clientX, clientY: e.clientY };
        },
        [piece.id, onSelect]
    );

    const handlePointerMove = React.useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging || !dragStartRef.current) return;

            const scale = getScale();
            const dx = (e.clientX - dragStartRef.current.clientX) * scale;
            const dy = (e.clientY - dragStartRef.current.clientY) * scale;

            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                onDragMove(piece.id, dx, dy);
                dragStartRef.current = { clientX: e.clientX, clientY: e.clientY };
            }
        },
        [isDragging, piece.id, onDragMove, getScale]
    );

    const handlePointerUp = React.useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging) return;
            e.stopPropagation();
            setIsDragging(false);
            dragStartRef.current = null;
            onDragEnd(piece.id);
        },
        [isDragging, piece.id, onDragEnd]
    );

    const rad = (piece.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const worldVertices = piece.vertices.map((v) => {
        let x = v.x * UNIT_PX;
        const y = v.y * UNIT_PX;
        if (piece.isFlipped) x = -x;
        return {
            x: x * cos - y * sin + piece.position.x * UNIT_PX,
            y: x * sin + y * cos + piece.position.y * UNIT_PX,
        };
    });

    const points = worldVertices.map((v) => `${v.x},${v.y}`).join(' ');

    return (
        <g
            ref={svgRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
            <polygon
                points={points}
                fill={PIECE_COLORS[piece.id]}
                stroke={isSelected ? '#fff' : '#1e293b'}
                strokeWidth={isSelected ? 2.5 : 1}
                opacity={isDragging ? 0.85 : 0.92}
                filter={isSelected ? 'url(#glow)' : undefined}
            />
        </g>
    );
};
