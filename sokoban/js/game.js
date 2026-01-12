/**
 * Sokoban Game Logic
 */

// Game element constants
const ELEMENTS = {
    WALL: '#',
    FLOOR: ' ',
    TARGET: '.',
    BOX: '$',
    PLAYER: '@',
    BOX_ON_TARGET: '*',
    PLAYER_ON_TARGET: '+'
};

// Direction vectors
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

/**
 * Main Game class
 */
class Game {
    constructor() {
        this.currentLevel = 0;
        this.map = [];
        this.playerPos = { x: 0, y: 0 };
        this.moves = 0;
        this.history = [];
        this.targets = [];
        this.loadLevel(this.currentLevel);
    }

    /**
     * Load a level by index
     */
    loadLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= levels.length) {
            return false;
        }

        this.currentLevel = levelIndex;
        this.moves = 0;
        this.history = [];
        this.targets = [];
        
        // Deep copy the level data
        this.map = levels[levelIndex].map(row => row.split(''));
        
        // Find player position and targets
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const cell = this.map[y][x];
                
                if (cell === ELEMENTS.PLAYER || cell === ELEMENTS.PLAYER_ON_TARGET) {
                    this.playerPos = { x, y };
                }
                
                if (cell === ELEMENTS.TARGET || cell === ELEMENTS.BOX_ON_TARGET || cell === ELEMENTS.PLAYER_ON_TARGET) {
                    this.targets.push({ x, y });
                }
            }
        }

        return true;
    }

    /**
     * Get cell content at position
     */
    getCell(x, y) {
        if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[y].length) {
            return ELEMENTS.WALL;
        }
        return this.map[y][x];
    }

    /**
     * Set cell content at position
     */
    setCell(x, y, value) {
        if (y >= 0 && y < this.map.length && x >= 0 && x < this.map[y].length) {
            this.map[y][x] = value;
        }
    }

    /**
     * Check if a position is a target
     */
    isTarget(x, y) {
        return this.targets.some(t => t.x === x && t.y === y);
    }

    /**
     * Move player in a direction
     */
    move(direction) {
        const dir = DIRECTIONS[direction];
        if (!dir) return false;

        const newX = this.playerPos.x + dir.x;
        const newY = this.playerPos.y + dir.y;
        const newCell = this.getCell(newX, newY);

        // Check if movement is possible
        if (newCell === ELEMENTS.WALL) {
            return false;
        }

        // Check if there's a box to push
        if (newCell === ELEMENTS.BOX || newCell === ELEMENTS.BOX_ON_TARGET) {
            const boxNewX = newX + dir.x;
            const boxNewY = newY + dir.y;
            const boxNewCell = this.getCell(boxNewX, boxNewY);

            // Can't push box into wall or another box
            if (boxNewCell === ELEMENTS.WALL || 
                boxNewCell === ELEMENTS.BOX || 
                boxNewCell === ELEMENTS.BOX_ON_TARGET) {
                return false;
            }

            // Save state for undo
            this.saveState();

            // Move the box
            this.setCell(boxNewX, boxNewY, this.isTarget(boxNewX, boxNewY) ? ELEMENTS.BOX_ON_TARGET : ELEMENTS.BOX);
            this.setCell(newX, newY, this.isTarget(newX, newY) ? ELEMENTS.TARGET : ELEMENTS.FLOOR);
        } else {
            // Save state for undo (no box push)
            this.saveState();
        }

        // Move the player
        const currentCell = this.getCell(this.playerPos.x, this.playerPos.y);
        this.setCell(
            this.playerPos.x, 
            this.playerPos.y, 
            this.isTarget(this.playerPos.x, this.playerPos.y) ? ELEMENTS.TARGET : ELEMENTS.FLOOR
        );
        
        this.playerPos = { x: newX, y: newY };
        this.setCell(newX, newY, this.isTarget(newX, newY) ? ELEMENTS.PLAYER_ON_TARGET : ELEMENTS.PLAYER);

        this.moves++;
        return true;
    }

    /**
     * Save current state for undo
     */
    saveState() {
        this.history.push({
            map: this.map.map(row => [...row]),
            playerPos: { ...this.playerPos },
            moves: this.moves
        });

        // Limit history to prevent memory issues
        if (this.history.length > 1000) {
            this.history.shift();
        }
    }

    /**
     * Undo last move
     */
    undo() {
        if (this.history.length === 0) {
            return false;
        }

        const state = this.history.pop();
        this.map = state.map;
        this.playerPos = state.playerPos;
        this.moves = state.moves;
        return true;
    }

    /**
     * Restart current level
     */
    restart() {
        this.loadLevel(this.currentLevel);
    }

    /**
     * Go to next level
     */
    nextLevel() {
        if (this.currentLevel < levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
            return true;
        }
        return false;
    }

    /**
     * Go to previous level
     */
    prevLevel() {
        if (this.currentLevel > 0) {
            this.loadLevel(this.currentLevel - 1);
            return true;
        }
        return false;
    }

    /**
     * Check if level is complete
     */
    checkWin() {
        // All targets must have boxes on them
        for (const target of this.targets) {
            const cell = this.getCell(target.x, target.y);
            if (cell !== ELEMENTS.BOX_ON_TARGET) {
                return false;
            }
        }
        return this.targets.length > 0;
    }

    /**
     * Get map dimensions
     */
    getMapSize() {
        const height = this.map.length;
        const width = Math.max(...this.map.map(row => row.length));
        return { width, height };
    }

    /**
     * Get total number of levels
     */
    getTotalLevels() {
        return levels.length;
    }
}
