import { FlowPuzzle, Position, EndpointPair } from '../types/game';

// Direction vectors: up, right, down, left
const DIRECTIONS: Position[] = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
];

// Minimum path length (including both endpoints)
const MIN_PATH_LENGTH = 3;

// Maximum attempts to generate a valid puzzle
const MAX_GENERATION_ATTEMPTS = 50;

// Minimum board coverage ratio for a valid puzzle
const MIN_COVERAGE_RATIO = 0.6;

/**
 * Check if a position is within the grid bounds
 */
function isInBounds(pos: Position, size: number): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size;
}

/**
 * Check if two positions are equal
 */
function posEquals(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Shuffle an array in place (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get neighbors of a position that are in bounds and not occupied
 */
function getAvailableNeighbors(
  pos: Position,
  size: number,
  occupied: boolean[][]
): Position[] {
  const neighbors: Position[] = [];
  for (const dir of DIRECTIONS) {
    const next: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    if (isInBounds(next, size) && !occupied[next.row][next.col]) {
      neighbors.push(next);
    }
  }
  return neighbors;
}

/**
 * Generate a single path using random walk with backtracking.
 * Returns the path as an array of positions, or null if no valid path could be generated.
 */
function generatePath(
  startPos: Position,
  size: number,
  occupied: boolean[][],
  minLength: number,
  maxLength: number
): Position[] | null {
  const path: Position[] = [startPos];
  occupied[startPos.row][startPos.col] = true;

  // Try to extend the path using random walk with backtracking
  let attempts = 0;
  const maxAttempts = maxLength * 4;

  while (path.length < maxLength && attempts < maxAttempts) {
    attempts++;
    const current = path[path.length - 1];
    const neighbors = shuffle(getAvailableNeighbors(current, size, occupied));

    if (neighbors.length === 0) {
      // Dead end: if path is long enough, stop
      if (path.length >= minLength) {
        break;
      }
      // Otherwise backtrack
      if (path.length > 1) {
        const removed = path.pop()!;
        occupied[removed.row][removed.col] = false;
        continue;
      }
      // Can't backtrack further, fail
      break;
    }

    // Pick a random neighbor, preferring ones that don't create dead ends
    let chosen: Position | null = null;
    for (const neighbor of neighbors) {
      // Temporarily mark as occupied to check connectivity
      occupied[neighbor.row][neighbor.col] = true;
      const futureNeighbors = getAvailableNeighbors(neighbor, size, occupied);
      occupied[neighbor.row][neighbor.col] = false;

      // Prefer cells that still have available neighbors (avoid painting into corners)
      if (futureNeighbors.length > 0 || path.length + 1 >= minLength) {
        chosen = neighbor;
        break;
      }
    }

    if (!chosen) {
      chosen = neighbors[0];
    }

    path.push(chosen);
    occupied[chosen.row][chosen.col] = true;
  }

  if (path.length < minLength) {
    // Clean up occupied cells
    for (const pos of path) {
      occupied[pos.row][pos.col] = false;
    }
    return null;
  }

  return path;
}

/**
 * Find an unoccupied cell to start a new path
 */
function findStartPosition(size: number, occupied: boolean[][]): Position | null {
  const candidates: Position[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!occupied[row][col]) {
        candidates.push({ row, col });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Calculate the maximum reasonable path length for a given grid and color count
 */
function getMaxPathLength(size: number, numColors: number): number {
  const totalCells = size * size;
  // Each path should take roughly an equal share of the board
  return Math.max(MIN_PATH_LENGTH + 2, Math.floor((totalCells / numColors) * 1.5));
}

/**
 * Generate a valid Flow Free puzzle using reverse generation.
 *
 * Algorithm:
 * 1. Create an empty grid
 * 2. For each color, find a start position and generate a random walk path
 * 3. Extract the two endpoints of each path as the puzzle definition
 * 4. Retry if coverage is insufficient
 */
export function generatePuzzle(size: number, numColors: number): FlowPuzzle {
  const totalCells = size * size;
  const maxPathLength = getMaxPathLength(size, numColors);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const occupied: boolean[][] = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    const paths: Position[][] = [];
    let success = true;

    for (let colorId = 0; colorId < numColors; colorId++) {
      const startPos = findStartPosition(size, occupied);
      if (!startPos) {
        success = false;
        break;
      }

      const path = generatePath(startPos, size, occupied, MIN_PATH_LENGTH, maxPathLength);
      if (!path) {
        success = false;
        break;
      }

      paths.push(path);
    }

    if (!success) continue;

    // Check coverage
    let coveredCells = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (occupied[row][col]) coveredCells++;
      }
    }

    const coverage = coveredCells / totalCells;

    // Accept if coverage is good enough (relax threshold after many attempts)
    const requiredCoverage = attempt < MAX_GENERATION_ATTEMPTS / 2
      ? MIN_COVERAGE_RATIO
      : MIN_COVERAGE_RATIO * 0.7;

    if (coverage >= requiredCoverage) {
      // Extract endpoints from each path
      const endpoints: EndpointPair[] = paths.map((path, idx) => ({
        colorId: idx,
        start: { ...path[0] },
        end: { ...path[path.length - 1] },
      }));

      return { size, endpoints };
    }
  }

  // Fallback: generate a simple puzzle with shorter paths
  return generateFallbackPuzzle(size, numColors);
}

/**
 * Fallback puzzle generation with relaxed constraints
 */
function generateFallbackPuzzle(size: number, numColors: number): FlowPuzzle {
  const occupied: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const endpoints: EndpointPair[] = [];

  for (let colorId = 0; colorId < numColors; colorId++) {
    const startPos = findStartPosition(size, occupied);
    if (!startPos) break;

    const path = generatePath(startPos, size, occupied, MIN_PATH_LENGTH, size * 2);
    if (!path) break;

    endpoints.push({
      colorId,
      start: { ...path[0] },
      end: { ...path[path.length - 1] },
    });
  }

  return { size, endpoints };
}

/**
 * Validate if a player's solution is correct.
 *
 * Checks:
 * 1. Each path connects its corresponding endpoint pair
 * 2. Paths don't overlap
 * 3. All cells are covered (board is filled)
 */
export function validateSolution(
  size: number,
  endpoints: EndpointPair[],
  paths: Map<number, Position[]>
): boolean {
  const totalCells = size * size;
  const covered: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  let filledCount = 0;

  for (const endpoint of endpoints) {
    const path = paths.get(endpoint.colorId);

    // Each color must have a path
    if (!path || path.length < 2) return false;

    const pathStart = path[0];
    const pathEnd = path[path.length - 1];

    // Path must connect the two endpoints (in either direction)
    const connectsForward =
      posEquals(pathStart, endpoint.start) && posEquals(pathEnd, endpoint.end);
    const connectsBackward =
      posEquals(pathStart, endpoint.end) && posEquals(pathEnd, endpoint.start);

    if (!connectsForward && !connectsBackward) return false;

    // Check path continuity and no overlaps
    for (let i = 0; i < path.length; i++) {
      const pos = path[i];

      // Must be in bounds
      if (!isInBounds(pos, size)) return false;

      // Must not overlap with other paths
      if (covered[pos.row][pos.col]) return false;
      covered[pos.row][pos.col] = true;
      filledCount++;

      // Each consecutive pair must be adjacent
      if (i > 0) {
        const prev = path[i - 1];
        const rowDiff = Math.abs(pos.row - prev.row);
        const colDiff = Math.abs(pos.col - prev.col);
        if (rowDiff + colDiff !== 1) return false;
      }
    }
  }

  // All cells must be filled
  return filledCount === totalCells;
}
