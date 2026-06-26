import { useState, useCallback, useRef } from 'react';
import { Position } from '@/lib/types/game';
import { TangramPieceType, TangramPieceState, TangramStatus, PuzzleDef } from '../types/game';
import {
    PIECE_LOCAL_VERTICES,
    ROTATION_STEP,
    UNIT_PX,
    SILHOUETTE_ORIGIN_X,
    SILHOUETTE_ORIGIN_Y,
    ALL_PIECE_IDS,
} from '../constants/config';

export interface UseTangramGameReturn {
    pieces: TangramPieceState[];
    status: TangramStatus;
    selectedPieceId: TangramPieceType | null;
    currentPuzzle: PuzzleDef;
    elapsedTime: number;
    selectPiece: (id: TangramPieceType) => void;
    deselectAll: () => void;
    movePieceBy: (id: TangramPieceType, dx: number, dy: number) => void;
    rotatePiece: (id: TangramPieceType) => void;
    flipPiece: (id: TangramPieceType) => void;
    undo: () => void;
    redo: () => void;
    start: () => void;
    restart: () => void;
    setPuzzle: (puzzle: PuzzleDef) => void;
}

function applyTransform(
    vertices: Position[],
    rotation: number,
    isFlipped: boolean,
    position: Position
): Position[] {
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return vertices.map((v) => {
        let x = v.x * UNIT_PX;
        const y = v.y * UNIT_PX;

        if (isFlipped) x = -x;

        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;

        return { x: rx + position.x * UNIT_PX, y: ry + position.y * UNIT_PX };
    });
}

function getCentroid(piece: TangramPieceState): Position {
    const localCenter = piece.vertices.reduce(
        (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
        { x: 0, y: 0 }
    );
    localCenter.x /= piece.vertices.length;
    localCenter.y /= piece.vertices.length;

    const [world] = applyTransform([localCenter], piece.rotation, piece.isFlipped, piece.position);
    return world;
}

function pointInPolygon(px: number, py: number, polygon: Position[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

export function useTangramGame(initialPuzzle: PuzzleDef): UseTangramGameReturn {
    const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleDef>(initialPuzzle);
    const [status, setStatus] = useState<TangramStatus>('idle');
    const [selectedPieceId, setSelectedPieceId] = useState<TangramPieceType | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const createInitialPieces = useCallback(
        (puzzle: PuzzleDef): TangramPieceState[] =>
            ALL_PIECE_IDS.map((id) => ({
                id,
                vertices: PIECE_LOCAL_VERTICES[id],
                position: { ...puzzle.pieceStartPositions[id] },
                rotation: 0,
                isFlipped: false,
            })),
        []
    );

    const [pieces, setPieces] = useState<TangramPieceState[]>(() =>
        createInitialPieces(initialPuzzle)
    );

    const historyRef = useRef<TangramPieceState[][]>([createInitialPieces(initialPuzzle)]);
    const historyIndexRef = useRef(0);

    const updatePieces = useCallback(
        (newPieces: TangramPieceState[], recordHistory = true) => {
            setPieces(newPieces);
            if (recordHistory) {
                const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
                newHistory.push(newPieces.map((p) => ({ ...p, position: { ...p.position } })));
                historyRef.current = newHistory;
                historyIndexRef.current = newHistory.length - 1;
            }
        },
        []
    );

    const checkWin = useCallback(
        (currentPieces: TangramPieceState[]): boolean => {
            const { polygons } = currentPuzzle.silhouette;

            return currentPieces.every((piece) => {
                const centroid = getCentroid(piece);
                const ux = (centroid.x - SILHOUETTE_ORIGIN_X) / UNIT_PX;
                const uy = (centroid.y - SILHOUETTE_ORIGIN_Y) / UNIT_PX;
                return polygons.some((poly) => pointInPolygon(ux, uy, poly));
            });
        },
        [currentPuzzle]
    );

    const selectPiece = useCallback(
        (id: TangramPieceType) => {
            if (status === 'idle') {
                setStatus('playing');
                timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
            }
            setSelectedPieceId(id);
        },
        [status]
    );

    const deselectAll = useCallback(() => {
        setSelectedPieceId(null);
    }, []);

    const movePieceBy = useCallback(
        (id: TangramPieceType, dx: number, dy: number) => {
            const newPieces = pieces.map((p) =>
                p.id === id
                    ? {
                          ...p,
                          position: {
                              x: p.position.x + dx / UNIT_PX,
                              y: p.position.y + dy / UNIT_PX,
                          },
                      }
                    : p
            );

            updatePieces(newPieces, false);

            if (checkWin(newPieces)) {
                setStatus('won');
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        },
        [pieces, updatePieces, checkWin]
    );

    const rotatePiece = useCallback(
        (id: TangramPieceType) => {
            const newPieces = pieces.map((p) =>
                p.id === id ? { ...p, rotation: (p.rotation + ROTATION_STEP) % 360 } : p
            );
            updatePieces(newPieces);

            if (checkWin(newPieces)) {
                setStatus('won');
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        },
        [pieces, updatePieces, checkWin]
    );

    const flipPiece = useCallback(
        (id: TangramPieceType) => {
            const newPieces = pieces.map((p) =>
                p.id === id ? { ...p, isFlipped: !p.isFlipped } : p
            );
            updatePieces(newPieces);

            if (checkWin(newPieces)) {
                setStatus('won');
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        },
        [pieces, updatePieces, checkWin]
    );

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const prev = historyRef.current[historyIndexRef.current];
            setPieces(prev.map((p) => ({ ...p, position: { ...p.position } })));
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            const next = historyRef.current[historyIndexRef.current];
            setPieces(next.map((p) => ({ ...p, position: { ...p.position } })));
        }
    }, []);

    const start = useCallback(() => {
        setStatus('playing');
        setElapsedTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }, []);

    const restart = useCallback(() => {
        const initial = createInitialPieces(currentPuzzle);
        updatePieces(initial);
        setSelectedPieceId(null);
        setStatus('idle');
        setElapsedTime(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [currentPuzzle, createInitialPieces, updatePieces]);

    const setPuzzle = useCallback(
        (puzzle: PuzzleDef) => {
            setCurrentPuzzle(puzzle);
            const initial = createInitialPieces(puzzle);
            updatePieces(initial);
            setSelectedPieceId(null);
            setStatus('idle');
            setElapsedTime(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        },
        [createInitialPieces, updatePieces]
    );

    return {
        pieces,
        status,
        selectedPieceId,
        currentPuzzle,
        elapsedTime,
        selectPiece,
        deselectAll,
        movePieceBy,
        rotatePiece,
        flipPiece,
        undo,
        redo,
        start,
        restart,
        setPuzzle,
    };
}
