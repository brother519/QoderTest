import GameEngine from '../src/services/gameEngine';
import { LEVEL_MAP } from '../src/constants/levels';
import { Cell } from '../src/types/game';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(8, 8, 10);
  });

  describe('Board Initialization', () => {
    it('should create board with correct dimensions', () => {
      const board = engine.getBoard();
      expect(board.width).toBe(8);
      expect(board.height).toBe(8);
      expect(board.cells.length).toBe(64);
    });

    it('should place correct number of mines', () => {
      engine.placeMines();
      const mineCount = engine.getBoard().cells.filter(cell => cell.hasMine).length;
      expect(mineCount).toBe(10);
    });

    it('should not place mines at avoided position', () => {
      engine.placeMines(0, 0);
      const cell = engine.getBoard().cells.find(c => c.x === 0 && c.y === 0);
      expect(cell?.hasMine).toBe(false);
    });

    it('should initialize all cells as hidden', () => {
      const board = engine.getBoard();
      expect(board.cells.every(cell => cell.state === 'hidden')).toBe(true);
    });
  });

  describe('Reveal Cell', () => {
    beforeEach(() => {
      engine.placeMines(4, 4);
    });

    it('should reveal a non-mine cell', () => {
      const cell = engine.getBoard().cells.find(c => c.x === 4 && c.y === 4);
      expect(cell?.isRevealed).toBe(false);
      const status = engine.revealCell(4, 4);
      expect(cell?.isRevealed).toBe(true);
      expect(status).not.toBe('lost');
    });

    it('should return lost status when revealing a mine', () => {
      const board = engine.getBoard();
      const mineCell = board.cells.find(c => c.hasMine);
      if (mineCell) {
        const status = engine.revealCell(mineCell.x, mineCell.y);
        expect(status).toBe('lost');
      }
    });

    it('should recursively reveal adjacent cells with zero mines', () => {
      const status = engine.revealCell(4, 4);
      const board = engine.getBoard();
      const revealedCount = board.cells.filter(c => c.isRevealed).length;
      expect(revealedCount).toBeGreaterThan(1);
    });

    it('should not reveal already revealed cells', () => {
      engine.revealCell(4, 4);
      const revealedCountBefore = engine.getRevealedCount();
      engine.revealCell(4, 4);
      const revealedCountAfter = engine.getRevealedCount();
      expect(revealedCountBefore).toBe(revealedCountAfter);
    });

    it('should not reveal flagged cells', () => {
      engine.toggleFlag(5, 5);
      const cell = engine.getBoard().cells.find(c => c.x === 5 && c.y === 5);
      const wasRevealed = cell?.isRevealed;
      engine.revealCell(5, 5);
      expect(cell?.isRevealed).toBe(wasRevealed);
    });
  });

  describe('Flag Toggle', () => {
    it('should toggle flag on hidden cell', () => {
      expect(engine.toggleFlag(0, 0)).toBe(true);
      expect(engine.toggleFlag(0, 0)).toBe(false);
    });

    it('should not flag revealed cells', () => {
      engine.placeMines(4, 4);
      engine.revealCell(4, 4);
      const cell = engine.getBoard().cells.find(c => c.x === 4 && c.y === 4);
      const result = engine.toggleFlag(4, 4);
      expect(result).toBe(false);
      expect(cell?.isFlagged).toBe(false);
    });

    it('should update flagged count', () => {
      engine.toggleFlag(0, 0);
      expect(engine.getFlaggedCount()).toBe(1);
      engine.toggleFlag(1, 1);
      expect(engine.getFlaggedCount()).toBe(2);
      engine.toggleFlag(0, 0);
      expect(engine.getFlaggedCount()).toBe(1);
    });
  });

  describe('Game Status', () => {
    beforeEach(() => {
      engine.placeMines(7, 7);
    });

    it('should detect loss when mine is revealed', () => {
      const board = engine.getBoard();
      const mineCell = board.cells.find(c => c.hasMine);
      if (mineCell) {
        const status = engine.revealCell(mineCell.x, mineCell.y);
        expect(status).toBe('lost');
      }
    });

    it('should detect win when all non-mine cells are revealed', () => {
      let status: any = 'playing';
      for (const cell of engine.getBoard().cells) {
        if (!cell.hasMine) {
          status = engine.revealCell(cell.x, cell.y);
          if (status === 'lost') break;
        }
      }
      expect(status).toBe('won');
    });

    it('should reveal all mines on game lost', () => {
      const board = engine.getBoard();
      const mineCell = board.cells.find(c => c.hasMine);
      if (mineCell) {
        engine.revealCell(mineCell.x, mineCell.y);
        const revealedMines = board.cells.filter(c => c.hasMine && c.isRevealed).length;
        expect(revealedMines).toBeGreaterThan(0);
      }
    });
  });

  describe('Reset', () => {
    it('should reset board for new level', () => {
      engine.placeMines();
      const oldBoard = engine.getBoard();
      const oldMineCount = oldBoard.cells.filter(c => c.hasMine).length;

      engine.reset(LEVEL_MAP.medium);
      const newBoard = engine.getBoard();

      expect(newBoard.width).toBe(16);
      expect(newBoard.height).toBe(16);
      expect(newBoard.cells.length).toBe(256);
      expect(newBoard.cells.every(c => !c.isRevealed)).toBe(true);
    });
  });
});