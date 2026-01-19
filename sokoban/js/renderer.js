/**
 * Canvas Renderer for Sokoban
 */

// Color scheme
const COLORS = {
    BACKGROUND: '#1a1a2e',
    WALL: '#4a4a6a',
    WALL_BORDER: '#2a2a4a',
    FLOOR: '#2a2a3e',
    TARGET: '#2ecc71',
    TARGET_GLOW: 'rgba(46, 204, 113, 0.3)',
    BOX: '#e67e22',
    BOX_BORDER: '#d35400',
    BOX_ON_TARGET: '#27ae60',
    BOX_ON_TARGET_BORDER: '#1e8449',
    PLAYER: '#3498db',
    PLAYER_BORDER: '#2980b9',
    PLAYER_EYE: '#fff'
};

/**
 * Renderer class
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 50;
        this.padding = 2;
    }

    /**
     * Render the game
     */
    render(game) {
        const mapSize = game.getMapSize();
        
        // Resize canvas to fit the map
        this.canvas.width = mapSize.width * this.tileSize;
        this.canvas.height = mapSize.height * this.tileSize;

        // Clear canvas
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each cell
        for (let y = 0; y < game.map.length; y++) {
            for (let x = 0; x < game.map[y].length; x++) {
                this.drawCell(x, y, game);
            }
        }
    }

    /**
     * Draw a single cell
     */
    drawCell(x, y, game) {
        const cell = game.getCell(x, y);
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        const size = this.tileSize;
        const padding = this.padding;

        // Draw base (floor or outside)
        if (cell !== ' ' || game.isTarget(x, y)) {
            this.ctx.fillStyle = COLORS.FLOOR;
            this.ctx.fillRect(px, py, size, size);
        }

        // Draw target indicator (always draw if it's a target position)
        if (game.isTarget(x, y)) {
            this.drawTarget(px, py, size);
        }

        // Draw cell content
        switch (cell) {
            case ELEMENTS.WALL:
                this.drawWall(px, py, size, padding);
                break;
            case ELEMENTS.BOX:
                this.drawBox(px, py, size, padding, false);
                break;
            case ELEMENTS.BOX_ON_TARGET:
                this.drawBox(px, py, size, padding, true);
                break;
            case ELEMENTS.PLAYER:
            case ELEMENTS.PLAYER_ON_TARGET:
                this.drawPlayer(px, py, size, padding);
                break;
        }
    }

    /**
     * Draw wall
     */
    drawWall(px, py, size, padding) {
        // Wall shadow
        this.ctx.fillStyle = COLORS.WALL_BORDER;
        this.ctx.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2);
        
        // Wall face
        const gradient = this.ctx.createLinearGradient(px, py, px + size, py + size);
        gradient.addColorStop(0, '#5a5a7a');
        gradient.addColorStop(1, COLORS.WALL);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(px + padding + 2, py + padding + 2, size - padding * 2 - 4, size - padding * 2 - 6);
        
        // Brick pattern
        this.ctx.strokeStyle = COLORS.WALL_BORDER;
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        this.ctx.beginPath();
        this.ctx.moveTo(px + padding + 2, py + size / 2);
        this.ctx.lineTo(px + size - padding - 2, py + size / 2);
        this.ctx.stroke();
        
        // Vertical lines
        this.ctx.beginPath();
        this.ctx.moveTo(px + size / 2, py + padding + 2);
        this.ctx.lineTo(px + size / 2, py + size / 2);
        this.ctx.moveTo(px + size / 4, py + size / 2);
        this.ctx.lineTo(px + size / 4, py + size - padding - 2);
        this.ctx.moveTo(px + size * 3 / 4, py + size / 2);
        this.ctx.lineTo(px + size * 3 / 4, py + size - padding - 2);
        this.ctx.stroke();
    }

    /**
     * Draw target
     */
    drawTarget(px, py, size) {
        const centerX = px + size / 2;
        const centerY = py + size / 2;
        const radius = size / 4;

        // Glow effect
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
        gradient.addColorStop(0, COLORS.TARGET_GLOW);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(px, py, size, size);

        // Target marker
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = COLORS.TARGET;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Inner dot
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = COLORS.TARGET;
        this.ctx.fill();
    }

    /**
     * Draw box
     */
    drawBox(px, py, size, padding, onTarget) {
        const boxPadding = padding + 4;
        const boxSize = size - boxPadding * 2;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(px + boxPadding + 3, py + boxPadding + 3, boxSize, boxSize);
        
        // Box body
        const color = onTarget ? COLORS.BOX_ON_TARGET : COLORS.BOX;
        const borderColor = onTarget ? COLORS.BOX_ON_TARGET_BORDER : COLORS.BOX_BORDER;
        
        this.ctx.fillStyle = borderColor;
        this.ctx.fillRect(px + boxPadding, py + boxPadding, boxSize, boxSize);
        
        // Box face with gradient
        const gradient = this.ctx.createLinearGradient(
            px + boxPadding, py + boxPadding,
            px + boxPadding + boxSize, py + boxPadding + boxSize
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, borderColor);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(px + boxPadding + 2, py + boxPadding + 2, boxSize - 4, boxSize - 4);
        
        // Cross pattern
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        
        const crossPadding = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(px + boxPadding + crossPadding, py + boxPadding + crossPadding);
        this.ctx.lineTo(px + boxPadding + boxSize - crossPadding, py + boxPadding + boxSize - crossPadding);
        this.ctx.moveTo(px + boxPadding + boxSize - crossPadding, py + boxPadding + crossPadding);
        this.ctx.lineTo(px + boxPadding + crossPadding, py + boxPadding + boxSize - crossPadding);
        this.ctx.stroke();
        
        // Checkmark if on target
        if (onTarget) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(px + size / 3, py + size / 2);
            this.ctx.lineTo(px + size / 2 - 2, py + size / 2 + 8);
            this.ctx.lineTo(px + size * 2 / 3, py + size / 2 - 8);
            this.ctx.stroke();
            this.ctx.lineCap = 'butt';
        }
    }

    /**
     * Draw player
     */
    drawPlayer(px, py, size, padding) {
        const centerX = px + size / 2;
        const centerY = py + size / 2;
        const radius = (size - padding * 2) / 2 - 4;

        // Shadow
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 2, centerY + size / 4, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();

        // Body with gradient
        const gradient = this.ctx.createRadialGradient(
            centerX - radius / 3, centerY - radius / 3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#5dade2');
        gradient.addColorStop(1, COLORS.PLAYER);
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = COLORS.PLAYER_BORDER;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Eyes
        const eyeOffset = radius / 3;
        const eyeRadius = radius / 5;
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - eyeOffset / 2, eyeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = COLORS.PLAYER_EYE;
        this.ctx.fill();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - eyeOffset / 2, eyeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = COLORS.PLAYER_EYE;
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset + 1, centerY - eyeOffset / 2 + 1, eyeRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset + 1, centerY - eyeOffset / 2 + 1, eyeRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Smile
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 2, radius / 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}
