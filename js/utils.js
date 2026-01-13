export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function angleToDirection(angle) {
    const deg = angle * (180 / Math.PI);
    if (deg >= -45 && deg < 45) return 'right';
    if (deg >= 45 && deg < 135) return 'down';
    if (deg >= -135 && deg < -45) return 'up';
    return 'left';
}

export function rectIntersect(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

export function gridToPixel(gridX, gridY, tileSize) {
    return {
        x: gridX * tileSize,
        y: gridY * tileSize
    };
}

export function pixelToGrid(pixelX, pixelY, tileSize) {
    return {
        col: Math.floor(pixelX / tileSize),
        row: Math.floor(pixelY / tileSize)
    };
}

export function isAlignedToGrid(x, y, gridSize) {
    return x % gridSize === 0 && y % gridSize === 0;
}

export function alignToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function easeOutQuad(t) {
    return t * (2 - t);
}

export function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
