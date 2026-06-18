'use client';

import { useState, useCallback, useRef } from 'react';
import { useHighScore, useIntervalLoop } from '@/lib/hooks';
import { ALL_PUZZLES } from '../constants/puzzles';
import type {
    CellState,
    Difficulty,
    NonogramStatus,
    Puzzle,
    Clues,
    UseNonogramGameReturn,
} from '../types/game';

function generateClues(solution: boolean[][]): { rowClues: Clues; colClues: Clues } {
    const size = solution.length;
    const rowClues: Clues = [];
    const colClues: Clues = [];

    for (let r = 0; r < size; r++) {
        const clue: number[] = [];
        let count = 0;
        for (let c = 0; c < size; c++) {
            if (solution[r][c]) {
                count++;
            } else if (count > 0) {
                clue.push(count);
                count = 0;
            }
        }
        if (count > 0) clue.push(count);
        rowClues.push(clue.length > 0 ? clue : [0]);
    }

    for (let c = 0; c < size; c++) {
        const clue: number[] = [];
        let count = 0;
        for (let r = 0; r < size; r++) {
            if (solution[r][c]) {
                count++;
            } else if (count > 0) {
                clue.push(count);
                count = 0;
            }
        }
        if (count > 0) clue.push(count);
        colClues.push(clue.length > 0 ? clue : [0]);
    }

    return { rowClues, colClues };
}

function createEmptyGrid(size: number): CellState[][] {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => 'empty' as CellState)
    );
}

function checkLineComplete(line: CellState[], solutionLine: boolean[]): boolean {
    for (let i = 0; i < line.length; i++) {
        const isFilled = line[i] === 'filled';
        if (isFilled !== solutionLine[i]) return false;
    }
    return true;
}

export function useNonogramGame(): UseNonogramGameReturn {
    const [grid, setGrid] = useState<CellState[][]>([]);
    const [rowClues, setRowClues] = useState<Clues>([]);
    const [colClues, setColClues] = useState<Clues>([]);
    const [status, setStatus] = useState<NonogramStatus>('idle');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState(0);
    const puzzleIndexRef = useRef<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });

    const [highScore, updateHighScore] = useHighScore('nonogramBestTime');

    useIntervalLoop(
        () => setTimer((t) => t + 1),
        1000,
        status === 'playing'
    );

    const loadPuzzle = useCallback((diff: Difficulty, index?: number): void => {
        const puzzles = ALL_PUZZLES[diff];
        const idx = index ?? puzzleIndexRef.current[diff];
        const selected = puzzles[idx % puzzles.length];
        const { rowClues: rc, colClues: cc } = generateClues(selected.solution);

        setPuzzle(selected);
        setGrid(createEmptyGrid(selected.size));
        setRowClues(rc);
        setColClues(cc);
        setTimer(0);
        setErrors(0);
        setStatus('playing');
    }, []);

    const start = useCallback((): void => {
        loadPuzzle(difficulty);
    }, [difficulty, loadPuzzle]);

    const restart = useCallback((): void => {
        if (puzzle) {
            setGrid(createEmptyGrid(puzzle.size));
            setTimer(0);
            setErrors(0);
            setStatus('playing');
        }
    }, [puzzle]);

    const changeDifficulty = useCallback((d: Difficulty): void => {
        setDifficulty(d);
        puzzleIndexRef.current[d] = 0;
        setStatus('idle');
    }, []);

    const nextPuzzle = useCallback((): void => {
        const puzzles = ALL_PUZZLES[difficulty];
        puzzleIndexRef.current[difficulty] = (puzzleIndexRef.current[difficulty] + 1) % puzzles.length;
        loadPuzzle(difficulty);
    }, [difficulty, loadPuzzle]);

    const checkWin = useCallback((newGrid: CellState[][]): boolean => {
        if (!puzzle) return false;
        for (let r = 0; r < puzzle.size; r++) {
            for (let c = 0; c < puzzle.size; c++) {
                const isFilled = newGrid[r][c] === 'filled';
                if (isFilled !== puzzle.solution[r][c]) return false;
            }
        }
        return true;
    }, [puzzle]);

    const toggleCell = useCallback((row: number, col: number): void => {
        if (status !== 'playing' || !puzzle) return;

        setGrid((prev) => {
            const newGrid = prev.map((r) => [...r]);
            if (newGrid[row][col] === 'filled') {
                newGrid[row][col] = 'empty';
            } else if (newGrid[row][col] === 'empty') {
                newGrid[row][col] = 'filled';
                if (!puzzle.solution[row][col]) {
                    setErrors((e) => e + 1);
                }
            }

            if (checkWin(newGrid)) {
                setStatus('won');
                updateHighScore(timer > 0 ? (highScore === 0 ? timer : Math.min(timer, highScore)) : 0);
            }
            return newGrid;
        });
    }, [status, puzzle, checkWin, timer, highScore, updateHighScore]);

    const markCell = useCallback((row: number, col: number): void => {
        if (status !== 'playing') return;

        setGrid((prev) => {
            const newGrid = prev.map((r) => [...r]);
            if (newGrid[row][col] === 'marked') {
                newGrid[row][col] = 'empty';
            } else if (newGrid[row][col] === 'empty') {
                newGrid[row][col] = 'marked';
            }
            return newGrid;
        });
    }, [status]);

    const isRowComplete = useCallback((rowIndex: number): boolean => {
        if (!puzzle || grid.length === 0) return false;
        return checkLineComplete(grid[rowIndex], puzzle.solution[rowIndex]);
    }, [grid, puzzle]);

    const isColComplete = useCallback((colIndex: number): boolean => {
        if (!puzzle || grid.length === 0) return false;
        const colCells = grid.map((row) => row[colIndex]);
        const colSolution = puzzle.solution.map((row) => row[colIndex]);
        return checkLineComplete(colCells, colSolution);
    }, [grid, puzzle]);

    return {
        grid,
        rowClues,
        colClues,
        status,
        difficulty,
        timer,
        errors,
        highScore,
        puzzleName: puzzle?.name ?? '',
        isRowComplete,
        isColComplete,
        toggleCell,
        markCell,
        start,
        restart,
        changeDifficulty,
        nextPuzzle,
    };
}
