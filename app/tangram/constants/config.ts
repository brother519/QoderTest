import { Position } from '@/lib/types/game';
import { TangramPieceType } from '../types/game';

export const UNIT_PX = 40;

export const PIECE_LOCAL_VERTICES: Record<TangramPieceType, Position[]> = {
    largeTriangle1: [
        { x: -2, y: 0 },
        { x: 0, y: -2 },
        { x: 2, y: 0 },
    ],
    largeTriangle2: [
        { x: -2, y: 0 },
        { x: 0, y: -2 },
        { x: 2, y: 0 },
    ],
    mediumTriangle: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: -1 },
    ],
    smallTriangle1: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: -0.5 },
    ],
    smallTriangle2: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: -0.5 },
    ],
    square: [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
        { x: -0.5, y: 0.5 },
    ],
    parallelogram: [
        { x: -0.5, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 1.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
    ],
};

export const PIECE_COLORS: Record<TangramPieceType, string> = {
    largeTriangle1: '#ef4444',
    largeTriangle2: '#f97316',
    mediumTriangle: '#22c55e',
    smallTriangle1: '#3b82f6',
    smallTriangle2: '#8b5cf6',
    square: '#eab308',
    parallelogram: '#ec4899',
};

export const PIECE_NAMES: Record<TangramPieceType, string> = {
    largeTriangle1: '大三角 A',
    largeTriangle2: '大三角 B',
    mediumTriangle: '中三角',
    smallTriangle1: '小三角 A',
    smallTriangle2: '小三角 B',
    square: '正方形',
    parallelogram: '平行四边形',
};

export const BOARD_WIDTH = 420;
export const BOARD_HEIGHT = 560;
export const SILHOUETTE_ORIGIN_X = 60;
export const SILHOUETTE_ORIGIN_Y = 20;
export const SILHOUETTE_SIZE = 300;
export const PIECE_TRAY_Y = 340;
export const SNAP_DISTANCE = 0.4;

export const ROTATION_STEP = 45;
export const INITIAL_TIME = 0;

export const ALL_PIECE_IDS: TangramPieceType[] = [
    'largeTriangle1',
    'largeTriangle2',
    'mediumTriangle',
    'smallTriangle1',
    'smallTriangle2',
    'square',
    'parallelogram',
];
