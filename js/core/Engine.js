import { CONFIG } from '../utils/Config.js';

export class Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.backgroundOffset = 0;
    }
    
    clear() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground(deltaTime) {
        const gridSize = 20;
        const speed = 30;
        
        this.backgroundOffset += speed * deltaTime;
        if (this.backgroundOffset > gridSize) {
            this.backgroundOffset = 0;
        }
        
        this.ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let y = -gridSize + this.backgroundOffset; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    getContext() {
        return this.ctx;
    }
    
    getWidth() {
        return this.canvas.width;
    }
    
    getHeight() {
        return this.canvas.height;
    }
}
