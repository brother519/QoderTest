export function checkAABB(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

export function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(array) {
    return array[random(0, array.length - 1)];
}
