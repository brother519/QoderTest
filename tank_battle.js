const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const TANK_SIZE = 35;
const BULLET_SIZE = 5;
const BULLET_SPEED = 5;
const TANK_SPEED = 2;

let playerTank = {
    x: 400,
    y: 550,
    width: TANK_SIZE,
    height: TANK_SIZE,
    color: '#00ff00',
    direction: 0,
    speed: TANK_SPEED,
    health: 3,
    canShoot: true
};

let score = 0;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let walls = [];
let gameOver = false;

const keys = {};

function createWalls() {
    walls = [];
    for (let i = 0; i < 15; i++) {
        walls.push({
            x: Math.floor(Math.random() * (canvas.width - TILE_SIZE)),
            y: Math.floor(Math.random() * (canvas.height - TILE_SIZE - 100)) + 50,
            width: TILE_SIZE,
            height: TILE_SIZE
        });
    }
}

function createEnemies() {
    enemies = [];
    for (let i = 0; i < 3; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - TANK_SIZE),
            y: 50,
            width: TANK_SIZE,
            height: TANK_SIZE,
            color: '#ff0000',
            direction: Math.floor(Math.random() * 4) * 90,
            speed: 1,
            health: 2,
            canShoot: true,
            shootTimer: 0
        });
    }
}

function init() {
    playerTank = {
        x: 400,
        y: 550,
        width: TANK_SIZE,
        height: TANK_SIZE,
        color: '#00ff00',
        direction: 0,
        speed: TANK_SPEED,
        health: 3,
        canShoot: true
    };
    score = 0;
    bullets = [];
    enemyBullets = [];
    gameOver = false;
    createWalls();
    createEnemies();
    updateUI();
}

function drawTank(tank) {
    ctx.save();
    ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
    ctx.rotate((tank.direction * Math.PI) / 180);
    
    ctx.fillStyle = tank.color;
    ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -tank.height / 2 - 10, 10, 15);
    
    ctx.restore();
}

function drawBullet(bullet) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);
}

function drawWall(wall) {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    ctx.strokeStyle = '#654321';
    ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
}

function shoot(tank, isPlayer = true) {
    if (!tank.canShoot) return;
    
    const bullet = {
        x: tank.x + tank.width / 2 - BULLET_SIZE / 2,
        y: tank.y + tank.height / 2 - BULLET_SIZE / 2,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        direction: tank.direction,
        speed: BULLET_SPEED
    };
    
    if (isPlayer) {
        bullets.push(bullet);
    } else {
        enemyBullets.push(bullet);
    }
    
    tank.canShoot = false;
    setTimeout(() => tank.canShoot = true, 500);
}

function moveBullet(bullet) {
    const rad = (bullet.direction * Math.PI) / 180;
    bullet.x += Math.sin(rad) * bullet.speed;
    bullet.y -= Math.cos(rad) * bullet.speed;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function moveTank(tank, dx, dy) {
    const newX = tank.x + dx;
    const newY = tank.y + dy;
    
    if (newX < 0 || newX + tank.width > canvas.width || 
        newY < 0 || newY + tank.height > canvas.height) {
        return false;
    }
    
    const tempTank = { ...tank, x: newX, y: newY };
    
    for (let wall of walls) {
        if (checkCollision(tempTank, wall)) {
            return false;
        }
    }
    
    tank.x = newX;
    tank.y = newY;
    return true;
}

function updatePlayer() {
    if (keys['w']) {
        playerTank.direction = 0;
        moveTank(playerTank, 0, -playerTank.speed);
    }
    if (keys['s']) {
        playerTank.direction = 180;
        moveTank(playerTank, 0, playerTank.speed);
    }
    if (keys['a']) {
        playerTank.direction = 270;
        moveTank(playerTank, -playerTank.speed, 0);
    }
    if (keys['d']) {
        playerTank.direction = 90;
        moveTank(playerTank, playerTank.speed, 0);
    }
    if (keys[' ']) {
        shoot(playerTank, true);
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.shootTimer++;
        
        if (enemy.shootTimer > 120 && Math.random() > 0.98) {
            const angle = Math.atan2(
                playerTank.y - enemy.y,
                playerTank.x - enemy.x
            );
            enemy.direction = (angle * 180 / Math.PI + 90) % 360;
            shoot(enemy, false);
            enemy.shootTimer = 0;
        }
        
        if (Math.random() > 0.98) {
            enemy.direction = Math.floor(Math.random() * 4) * 90;
        }
        
        const rad = (enemy.direction * Math.PI) / 180;
        const dx = Math.sin(rad) * enemy.speed;
        const dy = -Math.cos(rad) * enemy.speed;
        
        moveTank(enemy, dx, dy);
    });
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        moveBullet(bullet);
        
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            return false;
        }
        
        for (let i = 0; i < walls.length; i++) {
            if (checkCollision(bullet, walls[i])) {
                walls.splice(i, 1);
                return false;
            }
        }
        
        for (let i = 0; i < enemies.length; i++) {
            if (checkCollision(bullet, enemies[i])) {
                enemies[i].health--;
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    score += 100;
                    updateUI();
                }
                return false;
            }
        }
        
        return true;
    });
    
    enemyBullets = enemyBullets.filter(bullet => {
        moveBullet(bullet);
        
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            return false;
        }
        
        for (let i = 0; i < walls.length; i++) {
            if (checkCollision(bullet, walls[i])) {
                walls.splice(i, 1);
                return false;
            }
        }
        
        if (checkCollision(bullet, playerTank)) {
            playerTank.health--;
            updateUI();
            if (playerTank.health <= 0) {
                gameOver = true;
            }
            return false;
        }
        
        return true;
    });
}

function updateUI() {
    document.getElementById('health').textContent = playerTank.health;
    document.getElementById('score').textContent = score;
    document.getElementById('enemies').textContent = enemies.length;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    walls.forEach(drawWall);
    bullets.forEach(drawBullet);
    enemyBullets.forEach(drawBullet);
    enemies.forEach(drawTank);
    drawTank(playerTank);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('得分: ' + score, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('按 R 重新开始', canvas.width / 2, canvas.height / 2 + 80);
    } else if (enemies.length === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('胜利!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('得分: ' + score, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('按 R 重新开始', canvas.width / 2, canvas.height / 2 + 80);
    }
}

function gameLoop() {
    if (!gameOver && enemies.length > 0) {
        updatePlayer();
        updateEnemies();
        updateBullets();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r' && (gameOver || enemies.length === 0)) {
        init();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

init();
gameLoop();