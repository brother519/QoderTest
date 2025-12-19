export class Input {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        this._setupEventListeners();
    }
    
    _setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
        });
        
        window.addEventListener('mouseup', (e) => {
            this.mouseDown = false;
        });
        
        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    isKeyDown(key) {
        return this.keys[key] || false;
    }
    
    isUp() {
        return this.isKeyDown('ArrowUp') || this.isKeyDown('w') || this.isKeyDown('W');
    }
    
    isDown() {
        return this.isKeyDown('ArrowDown') || this.isKeyDown('s') || this.isKeyDown('S');
    }
    
    isLeft() {
        return this.isKeyDown('ArrowLeft') || this.isKeyDown('a') || this.isKeyDown('A');
    }
    
    isRight() {
        return this.isKeyDown('ArrowRight') || this.isKeyDown('d') || this.isKeyDown('D');
    }
    
    isShoot() {
        return this.isKeyDown(' ') || this.mouseDown;
    }
    
    isPause() {
        return this.isKeyDown('p') || this.isKeyDown('P') || this.isKeyDown('Escape');
    }
}
