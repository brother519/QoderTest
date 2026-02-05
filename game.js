// 坦克大战游戏
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('score-board');

// 游戏常量
const TILE_SIZE = 26;
const GRID_SIZE = 20;
const TANK_SIZE = 24;
const BULLET_SIZE = 4;
const BULLET_SPEED = 6;
const PLAYER_SPEED = 2;
const ENEMY_SPEED = 1.5;

// 方向常量
const DIR = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 地图块类型
const TILE = {
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    WATER: 3,
    GRASS: 4,
    BASE: 5
};

// 游戏状态
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isGameOver: false,
    isVictory: false,
    enemiesLeft: 0,
    maxEnemies: 4
};

// 地图数据
let map = [];

// 游戏对象
let player = null;
let enemies = [];
let bullets = [];
let explosions = [];

// 按键状态
const keys = {};

// 初始化地图
function initMap() {
    // 基础地图 (20x20)
    const mapTemplate = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,1,1,0,2,2,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
        [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0],
        [2,2,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,2,2],
        [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [2,2,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,2,2],
        [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,5,5,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,5,5,1,0,0,0,0,0,0,0,0]
    ];
    
    map = mapTemplate.map(row => [...row]);
}

// 坦克类
class Tank {
    constructor(x, y, direction, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isPlayer = isPlayer;
        this.speed = isPlayer ? PLAYER_SPEED : ENEMY_SPEED;
        this.canShoot = true;
        this.shootCooldown = isPlayer ? 300 : 1000;
        this.lastShot = 0;
        this.color = isPlayer ? '#4ade80' : '#ef4444';
        this.isDestroyed = false;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + TANK_SIZE/2, this.y + TANK_SIZE/2);
        ctx.rotate(this.direction * Math.PI / 2);
        
        // 坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(-TANK_SIZE/2, -TANK_SIZE/2, TANK_SIZE, TANK_SIZE);
        
        // 坦克履带
        ctx.fillStyle = this.isPlayer ? '#166534' : '#991b1b';
        ctx.fillRect(-TANK_SIZE/2, -TANK_SIZE/2, 5, TANK_SIZE);
        ctx.fillRect(TANK_SIZE/2 - 5, -TANK_SIZE/2, 5, TANK_SIZE);
        
        // 炮管
        ctx.fillStyle = this.isPlayer ? '#22c55e' : '#dc2626';
        ctx.fillRect(-3, -TANK_SIZE/2 - 8, 6, TANK_SIZE/2 + 4);
        
        // 炮塔
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.isPlayer ? '#86efac' : '#fca5a5';
        ctx.fill();
        
        ctx.restore();
    }
    
    move(direction) {
        const oldX = this.x;
        const oldY = this.y;
        
        this.direction = direction;
        
        switch(direction) {
            case DIR.UP:
                this.y -= this.speed;
                break;
            case DIR.DOWN:
                this.y += this.speed;
                break;
            case DIR.LEFT:
                this.x -= this.speed;
                break;
            case DIR.RIGHT:
                this.x += this.speed;
                break;
        }
        
        // 边界检测
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > canvas.width - TANK_SIZE) this.x = canvas.width - TANK_SIZE;
        if (this.y > canvas.height - TANK_SIZE) this.y = canvas.height - TANK_SIZE;
        
        // 墙壁碰撞检测
        if (this.checkWallCollision()) {
            this.x = oldX;
            this.y = oldY;
        }
        
        // 坦克间碰撞检测
        if (this.checkTankCollision()) {
            this.x = oldX;
            this.y = oldY;
        }
    }
    
    checkWallCollision() {
        const tileX1 = Math.floor(this.x / TILE_SIZE);
        const tileY1 = Math.floor(this.y / TILE_SIZE);
        const tileX2 = Math.floor((this.x + TANK_SIZE - 1) / TILE_SIZE);
        const tileY2 = Math.floor((this.y + TANK_SIZE - 1) / TILE_SIZE);
        
        for (let y = tileY1; y <= tileY2; y++) {
            for (let x = tileX1; x <= tileX2; x++) {
                if (y >= 0 && y < GRID_SIZE && x >= 0 && x < GRID_SIZE) {
                    const tile = map[y][x];
                    if (tile === TILE.BRICK || tile === TILE.STEEL || 
                        tile === TILE.WATER || tile === TILE.BASE) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    checkTankCollision() {
        const tanks = this.isPlayer ? enemies : [player, ...enemies.filter(e => e !== this)];
        
        for (const tank of tanks) {
            if (tank && !tank.isDestroyed && tank !== this) {
                if (this.x < tank.x + TANK_SIZE &&
                    this.x + TANK_SIZE > tank.x &&
                    this.y < tank.y + TANK_SIZE &&
                    this.y + TANK_SIZE > tank.y) {
                    return true;
                }
            }
        }
        return false;
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shootCooldown) return;
        
        this.lastShot = now;
        
        let bulletX = this.x + TANK_SIZE/2 - BULLET_SIZE/2;
        let bulletY = this.y + TANK_SIZE/2 - BULLET_SIZE/2;
        
        switch(this.direction) {
            case DIR.UP:
                bulletY = this.y - BULLET_SIZE;
                break;
            case DIR.DOWN:
                bulletY = this.y + TANK_SIZE;
                break;
            case DIR.LEFT:
                bulletX = this.x - BULLET_SIZE;
                break;
            case DIR.RIGHT:
                bulletX = this.x + TANK_SIZE;
                break;
        }
        
        bullets.push(new Bullet(bulletX, bulletY, this.direction, this.isPlayer));
    }
}

// 子弹类
class Bullet {
    constructor(x, y, direction, isPlayerBullet) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isPlayerBullet = isPlayerBullet;
        this.isDestroyed = false;
    }
    
    draw() {
        ctx.fillStyle = this.isPlayerBullet ? '#fbbf24' : '#f87171';
        ctx.beginPath();
        ctx.arc(this.x + BULLET_SIZE/2, this.y + BULLET_SIZE/2, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
    
    update() {
        switch(this.direction) {
            case DIR.UP:
                this.y -= BULLET_SPEED;
                break;
            case DIR.DOWN:
                this.y += BULLET_SPEED;
                break;
            case DIR.LEFT:
                this.x -= BULLET_SPEED;
                break;
            case DIR.RIGHT:
                this.x += BULLET_SPEED;
                break;
        }
        
        // 边界检测
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height) {
            this.isDestroyed = true;
            return;
        }
        
        // 墙壁碰撞
        this.checkWallCollision();
        
        // 坦克碰撞
        this.checkTankCollision();
    }
    
    checkWallCollision() {
        const tileX = Math.floor(this.x / TILE_SIZE);
        const tileY = Math.floor(this.y / TILE_SIZE);
        
        if (tileY >= 0 && tileY < GRID_SIZE && tileX >= 0 && tileX < GRID_SIZE) {
            const tile = map[tileY][tileX];
            
            if (tile === TILE.BRICK) {
                map[tileY][tileX] = TILE.EMPTY;
                this.isDestroyed = true;
                createExplosion(tileX * TILE_SIZE + TILE_SIZE/2, tileY * TILE_SIZE + TILE_SIZE/2, 15);
            } else if (tile === TILE.STEEL) {
                this.isDestroyed = true;
                createExplosion(this.x, this.y, 10);
            } else if (tile === TILE.BASE) {
                this.isDestroyed = true;
                gameState.isGameOver = true;
                createExplosion(tileX * TILE_SIZE + TILE_SIZE/2, tileY * TILE_SIZE + TILE_SIZE/2, 30);
            }
        }
    }
    
    checkTankCollision() {
        if (this.isPlayerBullet) {
            // 玩家子弹打敌人
            for (const enemy of enemies) {
                if (!enemy.isDestroyed && this.hitsTank(enemy)) {
                    enemy.isDestroyed = true;
                    this.isDestroyed = true;
                    gameState.score += 100;
                    gameState.enemiesLeft--;
                    createExplosion(enemy.x + TANK_SIZE/2, enemy.y + TANK_SIZE/2, 25);
                    
                    if (gameState.enemiesLeft <= 0) {
                        gameState.isVictory = true;
                    }
                    return;
                }
            }
        } else {
            // 敌人子弹打玩家
            if (player && !player.isDestroyed && this.hitsTank(player)) {
                this.isDestroyed = true;
                gameState.lives--;
                createExplosion(player.x + TANK_SIZE/2, player.y + TANK_SIZE/2, 25);
                
                if (gameState.lives <= 0) {
                    player.isDestroyed = true;
                    gameState.isGameOver = true;
                } else {
                    // 重生玩家
                    player.x = canvas.width/2 - TANK_SIZE/2;
                    player.y = canvas.height - TANK_SIZE - 30;
                    player.direction = DIR.UP;
                }
                return;
            }
        }
    }
    
    hitsTank(tank) {
        return this.x < tank.x + TANK_SIZE &&
               this.x + BULLET_SIZE > tank.x &&
               this.y < tank.y + TANK_SIZE &&
               this.y + BULLET_SIZE > tank.y;
    }
}

// 爆炸效果
class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxSize = size;
        this.alpha = 1;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // 外圈
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 内圈
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 中心
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    update() {
        this.alpha -= 0.05;
        this.size += 1;
    }
    
    isFinished() {
        return this.alpha <= 0;
    }
}

function createExplosion(x, y, size) {
    explosions.push(new Explosion(x, y, size));
}

// 绘制地图
function drawMap() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = map[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;
            
            switch(tile) {
                case TILE.BRICK:
                    ctx.fillStyle = '#b45309';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    // 砖块纹理
                    ctx.strokeStyle = '#92400e';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, TILE_SIZE/2, TILE_SIZE/2);
                    ctx.strokeRect(px + TILE_SIZE/2, py, TILE_SIZE/2, TILE_SIZE/2);
                    ctx.strokeRect(px, py + TILE_SIZE/2, TILE_SIZE/2, TILE_SIZE/2);
                    ctx.strokeRect(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/2, TILE_SIZE/2);
                    break;
                    
                case TILE.STEEL:
                    ctx.fillStyle = '#6b7280';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#9ca3af';
                    ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    ctx.fillStyle = '#4b5563';
                    ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                    break;
                    
                case TILE.WATER:
                    ctx.fillStyle = '#0ea5e9';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#38bdf8';
                    for (let i = 0; i < 3; i++) {
                        ctx.fillRect(px + 2 + i * 8, py + 4, 6, 2);
                        ctx.fillRect(px + 6 + i * 8, py + 12, 6, 2);
                        ctx.fillRect(px + 2 + i * 8, py + 20, 6, 2);
                    }
                    break;
                    
                case TILE.GRASS:
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case TILE.BASE:
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('★', px + TILE_SIZE/2, py + TILE_SIZE/2);
                    break;
            }
        }
    }
}

// 敌人AI
function updateEnemyAI(enemy) {
    if (enemy.isDestroyed) return;
    
    // 随机改变方向
    if (Math.random() < 0.02) {
        enemy.direction = Math.floor(Math.random() * 4);
    }
    
    // 尝试移动
    const oldX = enemy.x;
    const oldY = enemy.y;
    enemy.move(enemy.direction);
    
    // 如果无法移动，改变方向
    if (enemy.x === oldX && enemy.y === oldY) {
        enemy.direction = Math.floor(Math.random() * 4);
    }
    
    // 随机射击
    if (Math.random() < 0.03) {
        enemy.shoot();
    }
}

// 生成敌人
function spawnEnemy() {
    const aliveEnemies = enemies.filter(e => !e.isDestroyed).length;
    if (aliveEnemies >= gameState.maxEnemies || gameState.enemiesLeft <= 0) return;
    
    const spawnPoints = [
        { x: TILE_SIZE, y: TILE_SIZE },
        { x: canvas.width / 2 - TANK_SIZE / 2, y: TILE_SIZE },
        { x: canvas.width - TANK_SIZE - TILE_SIZE, y: TILE_SIZE }
    ];
    
    const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    
    // 检查生成点是否被占用
    const isOccupied = enemies.some(e => 
        !e.isDestroyed &&
        Math.abs(e.x - spawn.x) < TANK_SIZE * 2 &&
        Math.abs(e.y - spawn.y) < TANK_SIZE * 2
    );
    
    if (!isOccupied) {
        enemies.push(new Tank(spawn.x, spawn.y, DIR.DOWN, false));
    }
}

// 处理玩家输入
function handleInput() {
    if (!player || player.isDestroyed) return;
    
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.move(DIR.UP);
    } else if (keys['ArrowDown'] || keys['KeyS']) {
        player.move(DIR.DOWN);
    } else if (keys['ArrowLeft'] || keys['KeyA']) {
        player.move(DIR.LEFT);
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.move(DIR.RIGHT);
    }
    
    if (keys['Space'] || keys['KeyJ']) {
        player.shoot();
    }
}

// 更新游戏状态
function update() {
    if (gameState.isGameOver || gameState.isVictory) return;
    
    handleInput();
    
    // 更新子弹
    for (const bullet of bullets) {
        bullet.update();
    }
    bullets = bullets.filter(b => !b.isDestroyed);
    
    // 更新敌人AI
    for (const enemy of enemies) {
        updateEnemyAI(enemy);
    }
    enemies = enemies.filter(e => !e.isDestroyed);
    
    // 更新爆炸效果
    for (const explosion of explosions) {
        explosion.update();
    }
    explosions = explosions.filter(e => !e.isFinished());
    
    // 生成敌人
    spawnEnemy();
    
    // 更新计分板
    scoreBoard.textContent = `得分: ${gameState.score} | 生命: ${gameState.lives} | 敌人: ${gameState.enemiesLeft}`;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地图
    drawMap();
    
    // 绘制玩家
    if (player && !player.isDestroyed) {
        player.draw();
    }
    
    // 绘制敌人
    for (const enemy of enemies) {
        if (!enemy.isDestroyed) {
            enemy.draw();
        }
    }
    
    // 绘制子弹
    for (const bullet of bullets) {
        bullet.draw();
    }
    
    // 绘制爆炸
    for (const explosion of explosions) {
        explosion.draw();
    }
    
    // 游戏结束画面
    if (gameState.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 30);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`最终得分: ${gameState.score}`, canvas.width/2, canvas.height/2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('按 R 键重新开始', canvas.width/2, canvas.height/2 + 60);
    }
    
    // 胜利画面
    if (gameState.isVictory) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('胜利!', canvas.width/2, canvas.height/2 - 30);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`最终得分: ${gameState.score}`, canvas.width/2, canvas.height/2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('按 R 键重新开始', canvas.width/2, canvas.height/2 + 60);
    }
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
function initGame() {
    initMap();
    
    // 创建玩家
    player = new Tank(
        canvas.width/2 - TANK_SIZE/2,
        canvas.height - TANK_SIZE - 30,
        DIR.UP,
        true
    );
    
    // 重置游戏状态
    enemies = [];
    bullets = [];
    explosions = [];
    
    gameState = {
        score: 0,
        lives: 3,
        level: 1,
        isGameOver: false,
        isVictory: false,
        enemiesLeft: 10,
        maxEnemies: 4
    };
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'KeyR') {
        initGame();
    }
    
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 启动游戏
initGame();
gameLoop();
