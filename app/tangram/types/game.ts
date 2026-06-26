import { GameStatus, Position } from '@/lib/types/game';

export type TangramPieceType =
    | 'largeTriangle1'
    | 'largeTriangle2'
    | 'mediumTriangle'
    | 'smallTriangle1'
    | 'smallTriangle2'
    | 'square'
    | 'parallelogram';

export type TangramStatus = Extract<GameStatus, 'idle' | 'playing' | 'won'>;

export interface TangramPieceState {
    id: TangramPieceType;
    vertices: Position[];
    position: Position;
    rotation: number;
    isFlipped: boolean;
}

export interface PuzzleDef {
    id: string;
    name: string;
    icon: string;
    difficulty: '简单' | '中等' | '困难';
    silhouette: { polygons: Position[][] };
    pieceStartPositions: Record<TangramPieceType, Position>;
}
