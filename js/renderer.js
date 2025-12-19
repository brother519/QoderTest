import { CONFIG } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTank(x, y, size, direction, color) {
        const halfSize = size / 2;
        
        this.ctx.save();
        this.ctx.translate(x + halfSize, y + halfSize);
        this.ctx.rotate(direction * Math.PI / 2);
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-halfSize, -halfSize, size, size);
        
        this.ctx.fillStyle = '#000000';
        const barrelLength = size * 0.6;
        const barrelWidth = size * 0.3;
        this.ctx.fillRect(-barrelWidth / 2, -halfSize - barrelLength, barrelWidth, barrelLength);
        
        this.ctx.restore();
    }

    drawText(text, x, y, color = '#FFFFFF', font = '20px Arial', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= CONFIG.GRID_COLS; i++) {
            const x = i * CONFIG.GRID_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        
        for (let j = 0; j <= CONFIG.GRID_ROWS; j++) {
            const y = j * CONFIG.GRID_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }
}
