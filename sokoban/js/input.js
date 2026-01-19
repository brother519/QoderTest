/**
 * Input Handler for Sokoban
 */

class InputHandler {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;
        this.setupKeyboardControls();
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for arrow keys to avoid page scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                e.preventDefault();
            }

            let moved = false;

            switch (e.key) {
                // Movement - Arrow keys
                case 'ArrowUp':
                    moved = this.game.move('UP');
                    break;
                case 'ArrowDown':
                    moved = this.game.move('DOWN');
                    break;
                case 'ArrowLeft':
                    moved = this.game.move('LEFT');
                    break;
                case 'ArrowRight':
                    moved = this.game.move('RIGHT');
                    break;
                
                // Movement - WASD
                case 'w':
                case 'W':
                    moved = this.game.move('UP');
                    break;
                case 's':
                case 'S':
                    moved = this.game.move('DOWN');
                    break;
                case 'a':
                case 'A':
                    moved = this.game.move('LEFT');
                    break;
                case 'd':
                case 'D':
                    moved = this.game.move('RIGHT');
                    break;
                
                // Undo - Z or Ctrl+Z
                case 'z':
                case 'Z':
                    this.game.undo();
                    this.renderer.render(this.game);
                    window.updateUI();
                    break;
                
                // Restart - R
                case 'r':
                case 'R':
                    this.game.restart();
                    this.renderer.render(this.game);
                    window.updateUI();
                    break;
                
                // Next level - N
                case 'n':
                case 'N':
                    this.game.nextLevel();
                    this.renderer.render(this.game);
                    window.updateUI();
                    break;
                
                // Previous level - P
                case 'p':
                case 'P':
                    this.game.prevLevel();
                    this.renderer.render(this.game);
                    window.updateUI();
                    break;
            }

            // If player moved, update display and check for win
            if (moved) {
                this.renderer.render(this.game);
                window.updateUI();
                
                // Check for win condition
                if (this.game.checkWin()) {
                    setTimeout(() => {
                        window.showWinModal();
                    }, 300);
                }
            }
        });
    }
}
