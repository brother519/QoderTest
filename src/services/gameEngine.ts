import { Cell, GameBoard, GameState, GameStatus, Level } from '../types/game';

class GameEngine {
  private width: number;
  private height: number;
  private totalMines: number;
  private board: GameBoard;

  constructor(width: number, height: number, totalMines: number) {
    this.width = width;
    this.height = height;
    this.totalMines = totalMines;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): GameBoard {
    const cells: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const id = `${x}-${y}`;
        cells.push({
          id,
          x,
          y,
          hasMine: false,
          state: 'hidden',
          adjacentMines: 0,
          isRevealed: false,
          isFlagged: false
        });
      }
    }
    return {
      width: this.width,
      height: this.height,
      totalMines: this.totalMines,
      cells
    };
  }

  public placeMines(avoidX?: number, avoidY?: number): void {
    const emptyCells = this.board.cells.filter(
      cell => !cell.hasMine && !(avoidX !== undefined && avoidY !== undefined && cell.x === avoidX && cell.y === avoidY)
    );

    const shuffled = emptyCells.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(this.totalMines, shuffled.length); i++) {
      shuffled[i].hasMine = true;
    }

    this.updateAdjacentMines();
  }

  private updateAdjacentMines(): void {
    this.board.cells.forEach(cell => {
      if (!cell.hasMine) {
        cell.adjacentMines = this.countAdjacentMines(cell.x, cell.y);
      }
    });
  }

  private countAdjacentMines(x: number, y: number): number {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const cell = this.getCellAt(nx, ny);
          if (cell?.hasMine) count++;
        }
      }
    }
    return count;
  }

  private getCellAt(x: number, y: number): Cell | undefined {
    return this.board.cells.find(cell => cell.x === x && cell.y === y);
  }

  private getAdjacentCells(x: number, y: number): Cell[] {
    const adjacent: Cell[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const cell = this.getCellAt(nx, ny);
          if (cell) adjacent.push(cell);
        }
      }
    }
    return adjacent;
  }

  public revealCell(x: number, y: number): GameStatus {
    const cell = this.getCellAt(x, y);
    if (!cell || cell.isRevealed || cell.isFlagged) {
      return 'playing';
    }

    if (cell.hasMine) {
      this.revealAllMines();
      return 'lost';
    }

    this.revealBFS(x, y);
    return this.checkGameStatus();
  }

  private revealBFS(startX: number, startY: number): void {
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x}-${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const cell = this.getCellAt(x, y);
      if (!cell || cell.isRevealed || cell.isFlagged) continue;

      cell.isRevealed = true;
      cell.state = 'revealed';

      if (cell.adjacentMines === 0) {
        const adjacent = this.getAdjacentCells(x, y);
        for (const adjCell of adjacent) {
          if (!visited.has(`${adjCell.x}-${adjCell.y}`)) {
            queue.push([adjCell.x, adjCell.y]);
          }
        }
      }
    }
  }

  public toggleFlag(x: number, y: number): boolean {
    const cell = this.getCellAt(x, y);
    if (!cell || cell.isRevealed) return false;

    cell.isFlagged = !cell.isFlagged;
    cell.state = cell.isFlagged ? 'flagged' : 'hidden';
    return cell.isFlagged;
  }

  private revealAllMines(): void {
    this.board.cells.forEach(cell => {
      if (cell.hasMine) {
        cell.isRevealed = true;
        cell.state = 'revealed';
      }
    });
  }

  public checkGameStatus(): GameStatus {
    const revealedCount = this.board.cells.filter(cell => cell.isRevealed).length;
    const totalNonMineCells = this.width * this.height - this.totalMines;

    if (revealedCount === totalNonMineCells) {
      return 'won';
    }

    const hasLostMine = this.board.cells.some(cell => cell.hasMine && cell.isRevealed);
    if (hasLostMine) {
      return 'lost';
    }

    return 'playing';
  }

  public getBoard(): GameBoard {
    return this.board;
  }

  public getRevealedCount(): number {
    return this.board.cells.filter(cell => cell.isRevealed).length;
  }

  public getFlaggedCount(): number {
    return this.board.cells.filter(cell => cell.isFlagged).length;
  }

  public reset(level: Level): void {
    this.width = level.width;
    this.height = level.height;
    this.totalMines = level.mines;
    this.board = this.initializeBoard();
  }
}

export default GameEngine;
