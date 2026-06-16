/**
 * Sudoku puzzle generator
 *
 * Generates valid Sudoku puzzles with unique solutions using backtracking.
 *
 * @module sudoku/utils/generator
 */

import { GRID_SIZE, BOX_SIZE, DIFFICULTY_CONFIG } from '../constants/config';
import { SudokuDifficulty } from '../types/game';

type Grid = number[][];

function createEmptyGrid(): Grid {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }

    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
            if (grid[r][c] === num) return false;
        }
    }

    return true;
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function solveGrid(grid: Grid): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 0) {
                const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of nums) {
                    if (isValidPlacement(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solveGrid(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(grid: Grid, limit: number): number {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 0) {
                let count = 0;
                for (let num = 1; num <= 9; num++) {
                    if (isValidPlacement(grid, row, col, num)) {
                        grid[row][col] = num;
                        count += countSolutions(grid, limit - count);
                        grid[row][col] = 0;
                        if (count >= limit) return count;
                    }
                }
                return count;
            }
        }
    }
    return 1;
}

export function generatePuzzle(difficulty: SudokuDifficulty): {
    puzzle: number[][];
    solution: number[][];
} {
    const solution = createEmptyGrid();
    solveGrid(solution);

    const puzzle = solution.map((row) => [...row]);
    const toRemove = DIFFICULTY_CONFIG[difficulty];

    const positions: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            positions.push([r, c]);
        }
    }

    const mirrorMap = new Map<string, [number, number][]>();
    for (const [r, c] of positions) {
        const mirrorR = GRID_SIZE - 1 - r;
        const mirrorC = GRID_SIZE - 1 - c;
        const key1 = `${r},${c}`;
        const key2 = `${mirrorR},${mirrorC}`;
        const canonicalKey = key1 < key2 ? key1 : key2;

        if (!mirrorMap.has(canonicalKey)) {
            mirrorMap.set(canonicalKey, []);
        }
        const group = mirrorMap.get(canonicalKey)!;
        if (!group.some(([pr, pc]) => pr === r && pc === c)) {
            group.push([r, c]);
        }
    }

    const symmetricPositions = shuffleArray(Array.from(mirrorMap.values()));

    let removed = 0;
    for (const group of symmetricPositions) {
        if (removed >= toRemove) break;

        const testPuzzle = puzzle.map((row) => [...row]);
        for (const [r, c] of group) {
            testPuzzle[r][c] = 0;
        }

        const testCopy = testPuzzle.map((row) => [...row]);
        if (countSolutions(testCopy, 2) === 1) {
            for (const [r, c] of group) {
                puzzle[r][c] = 0;
            }
            removed += group.length;
        }
    }

    return { puzzle, solution };
}
