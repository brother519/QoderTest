// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// 游戏状态
let gameRunning = true;
let score = 0;
let lives = 3;
let animationId;

// 背景星星效果
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1
    });
}

// 爆炸效果数组
let explosions = [];

// 玩家飞机
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5,
    color: '#00BFFF'
};

// 子弹数组
let bullets = [];

// 敌机数组
let enemies = [];

// 键盘状态
const keys = {};

// 事件监听
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 鼠标控制
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // 限制飞机在画布范围内
    player.x = Math.max(0, Math.min(mouseX - player.width / 2, canvas.width - player.width));
});

// 触屏控制
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    
    // 限制飞机在画布范围内
    player.x = Math.max(0, Math.min(touchX - player.width / 2, canvas.width - player.width));
}, { passive: false });

// 创建爆炸效果
function createExplosion(x, y, color) {
    const particles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 2,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color,
            life: 30
        });
    }
    
    explosions.push({
        particles: particles,
        duration: 30
    });
}

// 发射子弹
function shoot() {
    // 限制子弹发射频率
    if (typeof lastShotTime === 'undefined' || Date.now() - lastShotTime > 200) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            color: '#FFD700'
        });
        lastShotTime = Date.now();
    }
}

// 生成敌机
function spawnEnemy() {
    if (!gameRunning) return;
    
    // 随机选择敌机类型
    const enemyType = Math.floor(Math.random() * 3);
    let enemySize, enemySpeed, enemyColor, enemyPoints;
    
    switch(enemyType) {
        case 0: // 小型敌机
            enemySize = 30;
            enemySpeed = Math.random() * 2 + 2;
            enemyColor = '#FF4500';
            enemyPoints = 10;
            break;
        case 1: // 中型敌机
            enemySize = 40;
            enemySpeed = Math.random() * 1.5 + 1;
            enemyColor = '#DC143C';
            enemyPoints = 20;
            break;
        case 2: // 大型敌机
            enemySize = 50;
            enemySpeed = Math.random() * 1 + 0.5;
            enemyColor = '#B22222';
            enemyPoints = 30;
            break;
    }
    
    enemies.push({
        x: Math.random() * (canvas.width - enemySize),
        y: -enemySize,
        width: enemySize,
        height: enemySize,
        speed: enemySpeed,
        color: enemyColor,
        points: enemyPoints // 击毁该敌机获得的分数
    });
    
    // 随机时间后再次生成敌机，随着分数增加，敌机生成频率提高
    let spawnInterval = Math.max(300, 1000 - Math.floor(score / 10));
    setTimeout(spawnEnemy, Math.random() * spawnInterval + 300);
}

// 碰撞检测
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 更新游戏状态
function update() {
    if (!gameRunning) return;
    
    // 更新星星位置（创建移动效果）
    stars.forEach(star => {
        star.y += star.speed * 0.2; // 星星缓慢向下移动
        
        // 如果星星移出屏幕底部，重新设置到顶部
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
    
    // 更新爆炸效果
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        for (let j = explosion.particles.length - 1; j >= 0; j--) {
            const particle = explosion.particles[j];
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life--;
            
            // 减少粒子大小以模拟消散效果
            particle.size *= 0.95;
        }
        
        // 移除生命值为0的粒子
        explosion.particles = explosion.particles.filter(particle => particle.life > 0);
        
        // 如果爆炸中没有粒子了，移除整个爆炸
        if (explosion.particles.length === 0) {
            explosions.splice(i, 1);
        }
    }
    
    // 移动玩家飞机（键盘控制）
    if (keys['ArrowLeft'] || keys['a']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    
    // 发射子弹（空格键）
    if (keys[' '] || keys['Spacebar']) {
        if (!keys.spacePressed) {
            shoot();
            keys.spacePressed = true;
        }
    } else {
        keys.spacePressed = false;
    }
    
    // 更新子弹位置
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // 移除超出屏幕的子弹
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // 检查子弹与敌机的碰撞
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // 碰撞发生，创建爆炸效果
                createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, enemies[j].color);
                
                // 移除子弹和敌机
                bullets.splice(i, 1);
                score += enemies[j].points; // 使用敌机特定的分数
                scoreElement.textContent = score;
                
                enemies.splice(j, 1);
                break;
            }
        }
    }
    
    // 更新敌机位置
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // 检查敌机是否超出屏幕底部
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            livesElement.textContent = lives;
            
            if (lives <= 0) {
                gameOver();
            }
            continue;
        }
        
        // 检查敌机与玩家的碰撞
        if (checkCollision(player, enemies[i])) {
            // 碰撞时也创建爆炸效果
            createExplosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, enemies[i].color);
            
            enemies.splice(i, 1);
            lives--;
            livesElement.textContent = lives;
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

// 绘制游戏对象
function draw() {
    // 绘制星空背景
    ctx.fillStyle = '#00111f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星星
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制玩家飞机（更详细的飞机形状）
    ctx.fillStyle = player.color;
    // 主体
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // 机翼
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(player.x + 5, player.y + player.height - 10, 15, 5);
    ctx.fillRect(player.x + player.width - 20, player.y + player.height - 10, 15, 5);
    
    // 驾驶舱
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制子弹（添加更美观的子弹效果）
    bullets.forEach(bullet => {
        // 子弹主体
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 子弹尾焰效果
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(bullet.x + bullet.width/2, bullet.y + bullet.height);
        ctx.lineTo(bullet.x, bullet.y + bullet.height + 5);
        ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height + 5);
        ctx.closePath();
        ctx.fill();
    });
    
    // 绘制敌机（更详细的敌机形状）
    enemies.forEach(enemy => {
        // 敌机主体
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fill();
        
        // 敌机机翼
        ctx.fillStyle = '#B22222';
        ctx.fillRect(enemy.x + 5, enemy.y + 10, 10, 15);
        ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + 10, 10, 15);
        
        // 敌机中心
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width/2, enemy.y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制爆炸效果
    explosions.forEach(explosion => {
        explosion.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 30; // 根据生命值调整透明度
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1; // 重置透明度
        });
    });
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameRunning = true;
    score = 0;
    lives = 3;
    
    // 重置玩家位置
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    
    // 清空子弹和敌机数组
    bullets = [];
    enemies = [];
    
    // 更新UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // 隐藏游戏结束界面
    gameOverElement.style.display = 'none';
    
    // 重新开始游戏循环
    gameLoop();
}

// 启动游戏
function startGame() {
    // 开始生成敌机
    spawnEnemy();
    
    // 开始游戏循环
    gameLoop();
}

// 启动游戏
startGame();