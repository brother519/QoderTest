/**
 * Maze game core logic hook
 *
 * Uses useReducer for state management. Implements maze generation
 * with Recursive Backtracker (DFS) algorithm and player movement
 * with wall collision detection.
 *
 * @module maze/hooks/useMaze
 */

'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
    MazeGrid,
    MazeCell,
    MazeDirection,
    Difficulty,
    MazeGameStatus,
    PlayerPosition,
    BestTimes,
} from '../types/game';
import { GRID_SIZES, STORAGE_KEY_PREFIX } from '../constants/config';

// ─── State & Actions ────────────────────────────────────────────────────────

interface MazeState {
    grid: MazeGrid;
    playerPosition: PlayerPosition;
    status: MazeGameStatus;
    elapsedTime: number;
    difficulty: Difficulty;
    bestTimes: BestTimes;
    moveCount: number;
}

type MazeAction =
    | { type: 'MOVE'; direction: MazeDirection }
    | { type: 'TICK' }
    | { type: 'NEW_MAZE'; difficulty: Difficulty }
    | { type: 'RESTART' }
    | { type: 'LOAD_BEST_TIMES'; bestTimes: BestTimes };

// ─── Maze Generation (Recursive Backtracker / DFS) ──────────────────────────

/** Create an empty grid with all walls intact */
function createEmptyGrid(size: number): MazeGrid {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, (): MazeCell => ({
            top: true,
            right: true,
            bottom: true,
            left: true,
            visited: false,
        }))
    );
}

/** Direction offsets: [row delta, col delta] */
const DIRECTION_OFFSETS: [number, number][] = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
];

/** Wall keys for removing walls between cells */
const WALL_PAIRS: [keyof MazeCell, keyof MazeCell][] = [
    ['top', 'bottom'],    // up: remove current top, neighbor bottom
    ['bottom', 'top'],    // down: remove current bottom, neighbor top
    ['left', 'right'],    // left: remove current left, neighbor right
    ['right', 'left'],    // right: remove current right, neighbor left
];

/** Shuffle array in place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Generate a maze using iterative DFS (Recursive Backtracker).
 * Uses an explicit stack to avoid call-stack overflow for large grids.
 */
function generateMaze(size: number): MazeGrid {
    const grid = createEmptyGrid(size);
    const stack: [number, number][] = [];

    // Start from top-left corner
    const startRow = 0;
    const startCol = 0;
    grid[startRow][startCol].visited = true;
    stack.push([startRow, startCol]);

    while (stack.length > 0) {
        const [currentRow, currentCol] = stack[stack.length - 1];

        // Find unvisited neighbors
        const directions = shuffle([0, 1, 2, 3]);
        let found = false;

        for (const dirIndex of directions) {
            const [dr, dc] = DIRECTION_OFFSETS[dirIndex];
            const newRow = currentRow + dr;
            const newCol = currentCol + dc;

            if (
                newRow >= 0 &&
                newRow < size &&
                newCol >= 0 &&
                newCol < size &&
                !grid[newRow][newCol].visited
            ) {
                // Remove wall between current and neighbor
                const [currentWall, neighborWall] = WALL_PAIRS[dirIndex];
                (grid[currentRow][currentCol] as unknown as Record<string, boolean>)[currentWall] = false;
                (grid[newRow][newCol] as unknown as Record<string, boolean>)[neighborWall] = false;

                // Mark neighbor as visited and push to stack
                grid[newRow][newCol].visited = true;
                stack.push([newRow, newCol]);
                found = true;
                break;
            }
        }

        // Backtrack if no unvisited neighbors
        if (!found) {
            stack.pop();
        }
    }

    return grid;
}

// ─── Movement Logic ─────────────────────────────────────────────────────────

/** Check if movement in a direction is allowed (no wall blocking) */
function canMove(grid: MazeGrid, position: PlayerPosition, direction: MazeDirection): boolean {
    const cell = grid[position.row][position.col];
    switch (direction) {
        case 'up':
            return !cell.top;
        case 'down':
            return !cell.bottom;
        case 'left':
            return !cell.left;
        case 'right':
            return !cell.right;
    }
}

/** Get the next position after moving in a direction */
function getNextPosition(position: PlayerPosition, direction: MazeDirection): PlayerPosition {
    switch (direction) {
        case 'up':
            return { row: position.row - 1, col: position.col };
        case 'down':
            return { row: position.row + 1, col: position.col };
        case 'left':
            return { row: position.row, col: position.col - 1 };
        case 'right':
            return { row: position.row, col: position.col + 1 };
    }
}

// ─── Best Time Persistence ──────────────────────────────────────────────────

/** Load best times from localStorage */
function loadBestTimes(): BestTimes {
    const defaults: BestTimes = { easy: null, medium: null, hard: null };
    try {
        const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
        for (const d of difficulties) {
            const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${d}`);
            if (saved) {
                const val = parseInt(saved, 10);
                if (!isNaN(val)) defaults[d] = val;
            }
        }
    } catch {
        // localStorage unavailable
    }
    return defaults;
}

/** Save a best time to localStorage */
function saveBestTime(difficulty: Difficulty, time: number): void {
    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}-${difficulty}`, String(time));
    } catch {
        // localStorage unavailable
    }
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function createInitialState(difficulty: Difficulty): MazeState {
    const size = GRID_SIZES[difficulty];
    return {
        grid: generateMaze(size),
        playerPosition: { row: 0, col: 0 },
        status: 'idle',
        elapsedTime: 0,
        difficulty,
        bestTimes: { easy: null, medium: null, hard: null },
        moveCount: 0,
    };
}

function mazeReducer(state: MazeState, action: MazeAction): MazeState {
    switch (action.type) {
        case 'MOVE': {
            // Only allow moves when idle (first move) or playing
            if (state.status === 'won') return state;

            const { direction } = action;
            if (!canMove(state.grid, state.playerPosition, direction)) return state;

            const nextPos = getNextPosition(state.playerPosition, direction);
            const size = GRID_SIZES[state.difficulty];

            // Start timer on first move
            const newStatus: MazeGameStatus =
                state.status === 'idle' ? 'playing' : state.status;

            // Check win condition (reached bottom-right corner)
            if (nextPos.row === size - 1 && nextPos.col === size - 1) {
                const finalTime = state.elapsedTime;
                const currentBest = state.bestTimes[state.difficulty];
                const isNewBest = currentBest === null || finalTime < currentBest;

                if (isNewBest) {
                    saveBestTime(state.difficulty, finalTime);
                }

                return {
                    ...state,
                    playerPosition: nextPos,
                    status: 'won',
                    moveCount: state.moveCount + 1,
                    bestTimes: isNewBest
                        ? { ...state.bestTimes, [state.difficulty]: finalTime }
                        : state.bestTimes,
                };
            }

            return {
                ...state,
                playerPosition: nextPos,
                status: newStatus,
                moveCount: state.moveCount + 1,
            };
        }

        case 'TICK': {
            if (state.status !== 'playing') return state;
            return { ...state, elapsedTime: state.elapsedTime + 1 };
        }

        case 'NEW_MAZE': {
            const size = GRID_SIZES[action.difficulty];
            return {
                ...state,
                grid: generateMaze(size),
                playerPosition: { row: 0, col: 0 },
                status: 'idle',
                elapsedTime: 0,
                difficulty: action.difficulty,
                moveCount: 0,
            };
        }

        case 'RESTART': {
            return {
                ...state,
                playerPosition: { row: 0, col: 0 },
                status: 'idle',
                elapsedTime: 0,
                moveCount: 0,
            };
        }

        case 'LOAD_BEST_TIMES': {
            return { ...state, bestTimes: action.bestTimes };
        }

        default:
            return state;
    }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMaze(initialDifficulty: Difficulty = 'easy') {
    const [state, dispatch] = useReducer(
        mazeReducer,
        initialDifficulty,
        createInitialState
    );

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load best times from localStorage on mount
    useEffect(() => {
        const bestTimes = loadBestTimes();
        dispatch({ type: 'LOAD_BEST_TIMES', bestTimes });
    }, []);

    // Timer management
    useEffect(() => {
        if (state.status === 'playing') {
            timerRef.current = setInterval(() => {
                dispatch({ type: 'TICK' });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [state.status]);

    const move = useCallback((direction: MazeDirection) => {
        dispatch({ type: 'MOVE', direction });
    }, []);

    const newMaze = useCallback((difficulty: Difficulty) => {
        dispatch({ type: 'NEW_MAZE', difficulty });
    }, []);

    const restart = useCallback(() => {
        dispatch({ type: 'RESTART' });
    }, []);

    return {
        grid: state.grid,
        playerPosition: state.playerPosition,
        status: state.status,
        elapsedTime: state.elapsedTime,
        difficulty: state.difficulty,
        bestTimes: state.bestTimes,
        moveCount: state.moveCount,
        exitPosition: {
            row: GRID_SIZES[state.difficulty] - 1,
            col: GRID_SIZES[state.difficulty] - 1,
        } as PlayerPosition,
        move,
        newMaze,
        restart,
    };
}
