import type { PlayerIndex } from '../types/game';
import { Direction } from '../types/game';

/**
 * Manages keyboard input state with per-frame tracking of pressed and just-pressed keys.
 * Supports querying input for specific player indices in two-player mode.
 */
export class InputManager {
  private keys: Set<string> = new Set();
  private justPressed: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /** Attach keyboard event listeners to the window. */
  attach(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /** Remove keyboard event listeners from the window. */
  detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    e.preventDefault();
    this.keys.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    e.preventDefault();
    this.keys.delete(e.code);
  }

  /** Update just-pressed state. Must be called once per frame before input queries. */
  update(): void {
    this.justPressed.clear();
    for (const key of this.keys) {
      if (!this.prevKeys.has(key)) {
        this.justPressed.add(key);
      }
    }
    this.prevKeys = new Set(this.keys);
  }

  /**
   * Check if a key is currently held down.
   * @param key - The KeyboardEvent.code to check
   * @returns true if the key is pressed
   */
  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * Check if a key was pressed this frame (not held from previous frame).
   * @param key - The KeyboardEvent.code to check
   * @returns true if the key was just pressed
   */
  wasJustPressed(key: string): boolean {
    return this.justPressed.has(key);
  }

  /** Clear all key states. */
  reset(): void {
    this.keys.clear();
    this.justPressed.clear();
    this.prevKeys.clear();
  }

  /**
   * Get the movement direction for a specific player, or null if not moving.
   * P1 (index 0): WASD keys. P2 (index 1): Arrow keys.
   * @param playerIndex - Which player to query (0 or 1)
   * @returns The direction the player is pressing, or null
   */
  getPlayerDirection(playerIndex: PlayerIndex): Direction | null {
    if (playerIndex === 0) {
      if (this.keys.has('KeyW')) return Direction.UP;
      if (this.keys.has('KeyS')) return Direction.DOWN;
      if (this.keys.has('KeyA')) return Direction.LEFT;
      if (this.keys.has('KeyD')) return Direction.RIGHT;
    } else {
      if (this.keys.has('ArrowUp')) return Direction.UP;
      if (this.keys.has('ArrowDown')) return Direction.DOWN;
      if (this.keys.has('ArrowLeft')) return Direction.LEFT;
      if (this.keys.has('ArrowRight')) return Direction.RIGHT;
    }
    return null;
  }

  /**
   * Check if a specific player is pressing their fire button.
   * P1 (index 0): Space. P2 (index 1): Enter.
   * @param playerIndex - Which player to query (0 or 1)
   * @returns true if the player is firing
   */
  isPlayerFiring(playerIndex: PlayerIndex): boolean {
    if (playerIndex === 0) {
      return this.keys.has('Space') || this.justPressed.has('Space');
    }
    return this.keys.has('Enter') || this.justPressed.has('Enter');
  }
}
