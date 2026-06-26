import { useState, useCallback, useRef, useEffect } from 'react';
import { Block, KlotskiStatus } from '../types/game';
import {
    BOARD_COLS,
    BOARD_ROWS,
    EXIT_ROW,
    EXIT_COL,
    BEST_STEPS_KEY,
    MOVE_DURATION,
} from '../constants/config';
import { LEVELS } from '../constants/levels';

// ─── Helper: Build a 2D occupancy grid ───────────────────────────────────────

/**
 * Build a boolean grid marking which cells are occupied.
 * Optionally exclude a specific block (so we can check its move target).
 */
function buildOccupancyGrid(blocks: Block[], excludeId?: string): boolean[][] {
    const grid: boolean[][] = Array.from({ length: BOARD_ROWS }, () =>
        Array(BOARD_COLS).fill(false)
    );
    for (const block of blocks) {
        if (block.id === excludeId) continue;
        for (let r = 0; r < block.height; r++) {
            for (let c = 0; c < block.width; c++) {
                grid[block.row + r][block.col + c] = true;
            }
        }
    }
    return grid;
}

// ─── Helper: Collision detection ─────────────────────────────────────────────

/**
 * Check if a block can move in direction (dr, dc).
 * Validates board bounds and cell availability.
 */
function canMove(
    block: Block,
    dr: number,
    dc: number,
    grid: boolean[][]
): boolean {
    const newRow = block.row + dr;
    const newCol = block.col + dc;

    // Boundary check
    if (newRow < 0 || newRow + block.height > BOARD_ROWS) return false;
    if (newCol < 0 || newCol + block.width > BOARD_COLS) return false;

    // Occupancy check - all destination cells must be free
    for (let r = 0; r < block.height; r++) {
        for (let c = 0; c < block.width; c++) {
            if (grid[newRow + r][newCol + c]) return false;
        }
    }
    return true;
}

// ─── Helper: Win detection ───────────────────────────────────────────────────

/**
 * Check if the king block has reached the exit position.
 */
function checkWin(blocks: Block[]): boolean {
    const king = blocks.find((b) => b.type === 'king');
    if (!king) return false;
    return king.row === EXIT_ROW && king.col === EXIT_COL;
}

// ─── Helper: Deep clone block array ─────────────────────────────────────────

function cloneBlocks(blocks: Block[]): Block[] {
    return blocks.map((b) => ({ ...b }));
}

// ─── Helper: localStorage access ────────────────────────────────────────────

function loadBestSteps(levelId: string): number | null {
    try {
        const val = localStorage.getItem(BEST_STEPS_KEY + levelId);
        return val ? parseInt(val, 10) : null;
    } catch {
        return null;
    }
}

function saveBestSteps(levelId: string, steps: number): void {
    try {
        const key = BEST_STEPS_KEY + levelId;
        const existing = localStorage.getItem(key);
        if (!existing || steps < parseInt(existing, 10)) {
            localStorage.setItem(key, String(steps));
        }
    } catch {
        // Silently ignore localStorage errors (e.g. private browsing)
    }
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export function useKlotskiGame() {
    // Core game state
    const [status, setStatus] = useState<KlotskiStatus>('selecting');
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [steps, setSteps] = useState(0);
    const [history, setHistory] = useState<Block[][]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
    const [bestStepsMap, setBestStepsMap] = useState<Record<string, number | null>>({});
    const [shakingBlockId, setShakingBlockId] = useState<string | null>(null);
    const [wonLevelId, setWonLevelId] = useState<string | null>(null);

    // Refs to keep latest values accessible in callbacks without stale closures
    const blocksRef = useRef(blocks);
    const stepsRef = useRef(steps);
    const statusRef = useRef(status);
    const lockRef = useRef(false);

    // Sync refs with state on every render
    blocksRef.current = blocks;
    stepsRef.current = steps;
    statusRef.current = status;

    // Load best steps from localStorage on mount
    useEffect(() => {
        const map: Record<string, number | null> = {};
        for (const level of LEVELS) {
            map[level.id] = loadBestSteps(level.id);
        }
        setBestStepsMap(map);
    }, []);

    // ─── Level Management ────────────────────────────────────────────────────

    const startLevel = useCallback((levelId: string) => {
        const level = LEVELS.find((l) => l.id === levelId);
        if (!level) return;

        const initialBlocks = cloneBlocks(level.blocks);
        setBlocks(initialBlocks);
        setSteps(0);
        setHistory([]);
        setSelectedBlockId(null);
        setCurrentLevelId(levelId);
        setStatus('playing');
        setShakingBlockId(null);
        setWonLevelId(null);
    }, []);

    const reset = useCallback(() => {
        if (!currentLevelId) return;
        startLevel(currentLevelId);
    }, [currentLevelId, startLevel]);

    const goBackToSelect = useCallback(() => {
        setStatus('selecting');
        setCurrentLevelId(null);
        setSelectedBlockId(null);
        setBlocks([]);
        setSteps(0);
        setHistory([]);
    }, []);

    // ─── Block Selection ─────────────────────────────────────────────────────

    const selectBlock = useCallback((blockId: string | null) => {
        setSelectedBlockId(blockId);
    }, []);

    // ─── Move Logic ──────────────────────────────────────────────────────────

    const moveBlock = useCallback(
        (blockId: string, dr: number, dc: number): boolean => {
            // Guard: only allow moves during active play
            if (statusRef.current !== 'playing') return false;

            // Guard: prevent rapid duplicate moves
            if (lockRef.current) return false;

            const currentBlocks = blocksRef.current;
            const block = currentBlocks.find((b) => b.id === blockId);
            if (!block) return false;

            const grid = buildOccupancyGrid(currentBlocks, blockId);

            if (!canMove(block, dr, dc, grid)) {
                // Trigger shake animation for blocked move
                setShakingBlockId(blockId);
                setTimeout(() => setShakingBlockId(null), 300);
                return false;
            }

            // Lock to prevent rapid moves during animation
            lockRef.current = true;

            // Save current state for undo
            const prevBlocks = cloneBlocks(currentBlocks);

            // Compute new blocks state
            const newBlocks = cloneBlocks(currentBlocks);
            const target = newBlocks.find((b) => b.id === blockId)!;
            target.row += dr;
            target.col += dc;

            // Apply state updates
            setHistory((prev) => [...prev, prevBlocks]);
            setBlocks(newBlocks);
            setSteps((s) => s + 1);

            // Check win condition
            if (checkWin(newBlocks)) {
                const newSteps = stepsRef.current + 1;
                setStatus('won');
                setWonLevelId(currentLevelId);
                if (currentLevelId) {
                    saveBestSteps(currentLevelId, newSteps);
                    setBestStepsMap((prev) => {
                        const existing = prev[currentLevelId];
                        if (existing === null || existing === undefined || newSteps < existing) {
                            return { ...prev, [currentLevelId]: newSteps };
                        }
                        return prev;
                    });
                }
            }

            // Release lock after animation duration
            setTimeout(() => {
                lockRef.current = false;
            }, MOVE_DURATION);

            return true;
        },
        [currentLevelId]
    );

    const moveSelected = useCallback(
        (dr: number, dc: number): boolean => {
            if (!selectedBlockId) return false;
            return moveBlock(selectedBlockId, dr, dc);
        },
        [selectedBlockId, moveBlock]
    );

    // ─── Drag Support ────────────────────────────────────────────────────────

    const dragMove = useCallback(
        (blockId: string, dr: number, dc: number): boolean => {
            // Auto-select the dragged block
            setSelectedBlockId(blockId);
            return moveBlock(blockId, dr, dc);
        },
        [moveBlock]
    );

    // ─── Undo ────────────────────────────────────────────────────────────────

    const undo = useCallback(() => {
        if (statusRef.current !== 'playing') return;
        setHistory((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setBlocks(last);
            setSteps((s) => s - 1);
            return prev.slice(0, -1);
        });
    }, []);

    // ─── Return ──────────────────────────────────────────────────────────────

    return {
        status,
        blocks,
        steps,
        selectedBlockId,
        currentLevelId,
        bestStepsMap,
        shakingBlockId,
        wonLevelId,
        canUndo: history.length > 0,
        startLevel,
        reset,
        goBackToSelect,
        selectBlock,
        moveBlock,
        moveSelected,
        dragMove,
        undo,
    };
}
