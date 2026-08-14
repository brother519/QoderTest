/**
 * 数独核心游戏逻辑 Hook
 *
 * 管理游戏状态、输入处理、计时器、冲突检测和撤销。
 *
 * @module sudoku/hooks/useSudokuGame
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SudokuCell, SudokuGameStatus, SudokuDifficulty, HistoryEntry } from '../types/game';
import { GRID_SIZE, MAX_MISTAKES } from '../constants/config';
import { generatePuzzle } from '../utils/generator';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

function createBoard(puzzle: number[][]): SudokuCell[][] {
    return puzzle.map((row) =>
        row.map((value) => ({
            value,
            isGiven: value !== 0,
            notes: new Set<number>(),
            hasConflict: false,
        }))
    );
}

function cloneBoard(board: SudokuCell[][]): SudokuCell[][] {
    return board.map((row) =>
        row.map((cell) => ({
            ...cell,
            notes: new Set(cell.notes),
        }))
    );
}

function checkConflicts(board: SudokuCell[][]): SudokuCell[][] {
    const newBoard = cloneBoard(board);

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            newBoard[r][c].hasConflict = false;
        }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const val = newBoard[r][c].value;
            if (val === 0) continue;

            for (let i = 0; i < GRID_SIZE; i++) {
                if (i !== c && newBoard[r][i].value === val) {
                    newBoard[r][c].hasConflict = true;
                    newBoard[r][i].hasConflict = true;
                }
                if (i !== r && newBoard[i][c].value === val) {
                    newBoard[r][c].hasConflict = true;
                    newBoard[i][c].hasConflict = true;
                }
            }

            const boxRow = Math.floor(r / 3) * 3;
            const boxCol = Math.floor(c / 3) * 3;
            for (let br = boxRow; br < boxRow + 3; br++) {
                for (let bc = boxCol; bc < boxCol + 3; bc++) {
                    if ((br !== r || bc !== c) && newBoard[br][bc].value === val) {
                        newBoard[r][c].hasConflict = true;
                        newBoard[br][bc].hasConflict = true;
                    }
                }
            }
        }
    }

    return newBoard;
}

function isBoardComplete(board: SudokuCell[][]): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c].value === 0 || board[r][c].hasConflict) return false;
        }
    }
    return true;
}

export function useSudokuGame(difficulty: SudokuDifficulty) {
    const [board, setBoard] = useState<SudokuCell[][]>(() => createBoard(Array(9).fill(Array(9).fill(0))));
    const [solution, setSolution] = useState<number[][]>(() => Array(9).fill(Array(9).fill(0)));
    const [status, setStatus] = useState<SudokuGameStatus>('idle');
    const [timer, setTimer] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [notesMode, setNotesMode] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const { puzzle, solution: sol } = generatePuzzle(difficulty);
        setBoard(checkConflicts(createBoard(puzzle)));
        setSolution(sol);
        setStatus('playing');
        setTimer(0);
        setMistakes(0);
        setSelectedCell(null);
        setNotesMode(false);
        setHistory([]);
    }, [difficulty]);

    useEffect(() => {
        if (status === 'playing') {
            timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const selectCell = useCallback((row: number, col: number) => {
        setSelectedCell({ row, col });
    }, []);

    const inputNumber = useCallback(
        (num: number) => {
            if (!selectedCell || status !== 'playing') return;
            const { row, col } = selectedCell;
            const cell = board[row][col];
            if (cell.isGiven) return;

            if (notesMode) {
                const newBoard = cloneBoard(board);
                if (newBoard[row][col].notes.has(num)) {
                    newBoard[row][col].notes.delete(num);
                } else {
                    newBoard[row][col].notes.add(num);
                }
                setBoard(checkConflicts(newBoard));
                return;
            }

            setHistory((prev) => [
                ...prev,
                {
                    row,
                    col,
                    prevValue: cell.value,
                    prevNotes: new Set(cell.notes),
                    prevIsGiven: cell.isGiven,
                },
            ]);

            const newBoard = cloneBoard(board);
            newBoard[row][col].value = num;
            newBoard[row][col].notes.clear();

            const checked = checkConflicts(newBoard);
            setBoard(checked);

            if (num !== solution[row][col]) {
                const newMistakes = mistakes + 1;
                setMistakes(newMistakes);
                if (newMistakes >= MAX_MISTAKES) {
                    setStatus('lost');
                    return;
                }
            }

            if (isBoardComplete(checked)) {
                setStatus('won');
            }
        },
        [selectedCell, status, board, notesMode, solution, mistakes]
    );

    const eraseCell = useCallback(() => {
        if (!selectedCell || status !== 'playing') return;
        const { row, col } = selectedCell;
        const cell = board[row][col];
        if (cell.isGiven || (cell.value === 0 && cell.notes.size === 0)) return;

        setHistory((prev) => [
            ...prev,
            {
                row,
                col,
                prevValue: cell.value,
                prevNotes: new Set(cell.notes),
                prevIsGiven: cell.isGiven,
            },
        ]);

        const newBoard = cloneBoard(board);
        newBoard[row][col].value = 0;
        newBoard[row][col].notes.clear();
        setBoard(checkConflicts(newBoard));
    }, [selectedCell, status, board]);

    const undo = useCallback(() => {
        if (history.length === 0 || status !== 'playing') return;

        const lastEntry = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));

        const newBoard = cloneBoard(board);
        newBoard[lastEntry.row][lastEntry.col].value = lastEntry.prevValue;
        newBoard[lastEntry.row][lastEntry.col].notes = lastEntry.prevNotes;
        newBoard[lastEntry.row][lastEntry.col].isGiven = lastEntry.prevIsGiven;
        setBoard(checkConflicts(newBoard));
    }, [history, status, board]);

    const toggleNotes = useCallback(() => {
        setNotesMode((prev) => !prev);
    }, []);

    const reset = useCallback(() => {
        const { puzzle, solution: sol } = generatePuzzle(difficulty);
        setBoard(checkConflicts(createBoard(puzzle)));
        setSolution(sol);
        setStatus('playing');
        setTimer(0);
        setMistakes(0);
        setSelectedCell(null);
        setNotesMode(false);
        setHistory([]);
    }, [difficulty]);

    const SUDOKU_KEY_MAP: Record<string, string> = {
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
        '6': '6', '7': '7', '8': '8', '9': '9',
        Backspace: 'erase', Delete: 'erase',
        n: 'notes', N: 'notes',
        z: 'undo', Z: 'undo',
    };

    useKeyboard(SUDOKU_KEY_MAP, {
        onKeyDown: (action) => {
            if (status !== 'playing') return;
            if (action >= '1' && action <= '9') {
                inputNumber(parseInt(action));
            } else if (action === 'erase') {
                eraseCell();
            } else if (action === 'notes') {
                toggleNotes();
            }
        },
    }, { enabled: status === 'playing' });

    // Ctrl+Z undo needs separate handling since useKeyboard doesn't check modifiers
    useEffect(() => {
        const handleUndo = (e: KeyboardEvent) => {
            if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                undo();
            }
        };
        window.addEventListener('keydown', handleUndo);
        return () => window.removeEventListener('keydown', handleUndo);
    }, [undo]);

    return {
        board,
        status,
        timer,
        mistakes,
        selectedCell,
        notesMode,
        selectCell,
        inputNumber,
        eraseCell,
        undo,
        toggleNotes,
        reset,
        canUndo: history.length > 0,
    };
}
