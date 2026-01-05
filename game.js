const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winnerText = document.getElementById('winner');

const GROUND_Y = 320;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

let gameRunning = false;
let gameLoop;

class Fighter {
    constructor(x, color, name, controls, facingRight) {
        this.x = x;
        this.y = GROUND_Y;
        this.width = 60;
        this.height = 100;
        this.color = color;
        this.name = name;
        this.controls = controls;
        this.facingRight = facingRight;
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isAttacking = false;
        this.attackType = null;
        this.attackFrame = 0;
        this.attackCooldown = 0;
        
        this.health = 100;
        this.energy = 0;
        this.maxEnergy = 100;
        
        this.hitStun = 0;
        this.isBlocking = false;
        
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(keys, opponent) {
        if (this.hitStun > 0) {
            this.hitStun--;
            this.velocityX *= 0.8;
        } else {
            if (keys[this.controls.left]) {
                this.velocityX = -MOVE_SPEED;
                this.facingRight = false;
            } else if (keys[this.controls.right]) {
                this.velocityX = MOVE_SPEED;
                this.facingRight = true;
            } else {
                this.velocityX *= 0.8;
            }

            if (keys[this.controls.jump] && !this.isJumping) {
                this.velocityY = JUMP_FORCE;
                this.isJumping = true;
            }

            if (this.attackCooldown > 0) {
                this.attackCooldown--;
            }

            if (!this.isAttacking && this.attackCooldown === 0) {
                if (keys[this.controls.punch]) {
                    this.startAttack('punch', 15, 10, 20);
                } else if (keys[this.controls.kick]) {
                    this.startAttack('kick', 20, 15, 25);
                } else if (keys[this.controls.special] && this.energy >= 50) {
                    this.startAttack('special', 30, 35, 40);
                    this.energy -= 50;
                }
            }
        }

        this.velocityY += GRAVITY;
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.velocityY = 0;
            this.isJumping = false;
        }

        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

        if (this.isAttacking) {
            this.attackFrame++;
            if (this.attackFrame >= this.attackDuration) {
                this.isAttacking = false;
                this.attackFrame = 0;
                this.attackCooldown = 10;
            }
        }

        this.animationTimer++;
        if (this.animationTimer >= 10) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        if (this.energy < this.maxEnergy) {
            this.energy += 0.1;
        }
    }

    startAttack(type, damage, range, duration) {
        this.isAttacking = true;
        this.attackType = type;
        this.attackDamage = damage;
        this.attackRange = range;
        this.attackDuration = duration;
        this.attackFrame = 0;
        this.hasHit = false;
    }

    getAttackHitbox() {
        if (!this.isAttacking || this.attackFrame < 5 || this.attackFrame > this.attackDuration - 5) {
            return null;
        }
        
        const hitboxWidth = this.attackRange + (this.attackType === 'special' ? 40 : 20);
        const hitboxHeight = this.attackType === 'kick' ? 30 : 40;
        const hitboxY = this.y - 60 + (this.attackType === 'kick' ? 20 : 0);
        
        if (this.facingRight) {
            return {
                x: this.x + this.width,
                y: hitboxY,
                width: hitboxWidth,
                height: hitboxHeight
            };
        } else {
            return {
                x: this.x - hitboxWidth,
                y: hitboxY,
                width: hitboxWidth,
                height: hitboxHeight
            };
        }
    }

    getHurtbox() {
        return {
            x: this.x,
            y: this.y - this.height,
            width: this.width,
            height: this.height
        };
    }

    takeDamage(damage, knockbackDir) {
        this.health -= damage;
        this.hitStun = 20;
        this.velocityX = knockbackDir * 8;
        this.velocityY = -5;
        
        if (this.health < 0) this.health = 0;
    }

    draw() {
        ctx.save();
        
        const bodyX = this.x + this.width / 2;
        const bodyY = this.y;
        
        const breathOffset = Math.sin(this.animationTimer * 0.2) * 2;
        
        if (this.hitStun > 0 && this.hitStun % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(bodyX, bodyY - 85 + breathOffset, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(bodyX, bodyY - 85 + breathOffset, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.fillRect(bodyX - 15, bodyY - 70 + breathOffset, 30, 40);

        const legOffset = Math.abs(this.velocityX) > 0.5 ? Math.sin(this.animationTimer * 0.5) * 10 : 0;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(bodyX - 12, bodyY - 30, 10, 30 + legOffset * 0.5);
        ctx.fillRect(bodyX + 2, bodyY - 30, 10, 30 - legOffset * 0.5);

        const armLength = 25;
        let leftArmAngle = -0.3;
        let rightArmAngle = 0.3;
        
        if (this.isAttacking) {
            const attackProgress = this.attackFrame / this.attackDuration;
            if (this.attackType === 'punch') {
                if (this.facingRight) {
                    rightArmAngle = -1.5 + Math.sin(attackProgress * Math.PI) * 2;
                } else {
                    leftArmAngle = 1.5 - Math.sin(attackProgress * Math.PI) * 2;
                }
            } else if (this.attackType === 'kick') {
                if (this.facingRight) {
                    ctx.fillStyle = '#333';
                    ctx.save();
                    ctx.translate(bodyX + 5, bodyY - 25);
                    ctx.rotate(Math.sin(attackProgress * Math.PI) * 1.5);
                    ctx.fillRect(0, 0, 10, 35);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#333';
                    ctx.save();
                    ctx.translate(bodyX - 5, bodyY - 25);
                    ctx.rotate(-Math.sin(attackProgress * Math.PI) * 1.5);
                    ctx.fillRect(-10, 0, 10, 35);
                    ctx.restore();
                }
            } else if (this.attackType === 'special') {
                const specialX = this.facingRight ? bodyX + 40 : bodyX - 40;
                const gradient = ctx.createRadialGradient(specialX, bodyY - 50, 5, specialX, bodyY - 50, 30);
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(0.5, this.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(specialX, bodyY - 50, 25 + Math.sin(attackProgress * Math.PI * 4) * 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(bodyX - 15, bodyY - 60 + breathOffset);
        ctx.lineTo(bodyX - 15 + Math.cos(leftArmAngle) * armLength, bodyY - 60 + breathOffset + Math.sin(leftArmAngle) * armLength);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(bodyX + 15, bodyY - 60 + breathOffset);
        ctx.lineTo(bodyX + 15 + Math.cos(rightArmAngle) * armLength, bodyY - 60 + breathOffset + Math.sin(rightArmAngle) * armLength);
        ctx.stroke();

        ctx.fillStyle = '#000';
        const eyeOffset = this.facingRight ? 3 : -3;
        ctx.fillRect(bodyX - 5 + eyeOffset, bodyY - 90 + breathOffset, 3, 3);
        ctx.fillRect(bodyX + 2 + eyeOffset, bodyY - 90 + breathOffset, 3, 3);

        ctx.restore();
    }

    drawUI(side) {
        const barWidth = 300;
        const barHeight = 25;
        const x = side === 'left' ? 20 : canvas.width - barWidth - 20;
        const y = 20;

        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const healthWidth = (this.health / 100) * (barWidth - 4);
        const healthGradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        if (this.health > 50) {
            healthGradient.addColorStop(0, '#00ff00');
            healthGradient.addColorStop(1, '#00cc00');
        } else if (this.health > 25) {
            healthGradient.addColorStop(0, '#ffff00');
            healthGradient.addColorStop(1, '#ffcc00');
        } else {
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(1, '#cc0000');
        }
        ctx.fillStyle = healthGradient;
        
        if (side === 'left') {
            ctx.fillRect(x + 2, y + 2, healthWidth, barHeight - 4);
        } else {
            ctx.fillRect(x + barWidth - 2 - healthWidth, y + 2, healthWidth, barHeight - 4);
        }

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        const energyY = y + barHeight + 5;
        const energyHeight = 10;
        ctx.fillStyle = '#222';
        ctx.fillRect(x, energyY, barWidth, energyHeight);
        
        const energyWidth = (this.energy / this.maxEnergy) * (barWidth - 4);
        ctx.fillStyle = this.energy >= 50 ? '#00ffff' : '#0088aa';
        if (side === 'left') {
            ctx.fillRect(x + 2, energyY + 2, energyWidth, energyHeight - 4);
        } else {
            ctx.fillRect(x + barWidth - 2 - energyWidth, energyY + 2, energyWidth, energyHeight - 4);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = side === 'left' ? 'left' : 'right';
        ctx.fillText(this.name, side === 'left' ? x : x + barWidth, y - 5);
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

let player1, player2;
let keys = {};

const player1Controls = {
    left: 'KeyA',
    right: 'KeyD',
    jump: 'KeyW',
    punch: 'KeyF',
    kick: 'KeyG',
    special: 'KeyH'
};

const player2Controls = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'ArrowUp',
    punch: 'KeyJ',
    kick: 'KeyK',
    special: 'KeyL'
};

function initGame() {
    player1 = new Fighter(100, '#3366ff', '玩家1', player1Controls, true);
    player2 = new Fighter(640, '#ff3333', '玩家2', player2Controls, false);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#98FB98');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#654321';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, GROUND_Y);
        ctx.lineTo(i + 25, canvas.height);
        ctx.stroke();
    }

    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(100 + i * 150, 50 + Math.sin(Date.now() / 2000 + i) * 10, 30, 0, Math.PI * 2);
        ctx.arc(120 + i * 150, 45 + Math.sin(Date.now() / 2000 + i) * 10, 25, 0, Math.PI * 2);
        ctx.arc(140 + i * 150, 50 + Math.sin(Date.now() / 2000 + i) * 10, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

let particles = [];

function createHitParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 20,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life / 20;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function gameUpdate() {
    player1.update(keys, player2);
    player2.update(keys, player1);

    const hitbox1 = player1.getAttackHitbox();
    const hitbox2 = player2.getAttackHitbox();
    const hurtbox1 = player1.getHurtbox();
    const hurtbox2 = player2.getHurtbox();

    if (hitbox1 && !player1.hasHit && checkCollision(hitbox1, hurtbox2)) {
        player2.takeDamage(player1.attackDamage, player1.facingRight ? 1 : -1);
        player1.hasHit = true;
        player1.energy = Math.min(player1.maxEnergy, player1.energy + 10);
        createHitParticles(player2.x + player2.width / 2, player2.y - player2.height / 2, '#ffff00');
    }

    if (hitbox2 && !player2.hasHit && checkCollision(hitbox2, hurtbox1)) {
        player1.takeDamage(player2.attackDamage, player2.facingRight ? 1 : -1);
        player2.hasHit = true;
        player2.energy = Math.min(player2.maxEnergy, player2.energy + 10);
        createHitParticles(player1.x + player1.width / 2, player1.y - player1.height / 2, '#ffff00');
    }

    updateParticles();

    if (player1.health <= 0 || player2.health <= 0) {
        endGame();
    }
}

function gameDraw() {
    drawBackground();
    player1.draw();
    player2.draw();
    player1.drawUI('left');
    player2.drawUI('right');
    drawParticles();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VS', canvas.width / 2, 35);
}

function mainLoop() {
    if (!gameRunning) return;
    
    gameUpdate();
    gameDraw();
    
    gameLoop = requestAnimationFrame(mainLoop);
}

function startGame() {
    initGame();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameRunning = true;
    mainLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    
    let winner;
    if (player1.health <= 0 && player2.health <= 0) {
        winner = '平局!';
    } else if (player1.health <= 0) {
        winner = '玩家2 获胜!';
    } else {
        winner = '玩家1 获胜!';
    }
    
    winnerText.textContent = winner;
    gameOverScreen.style.display = 'flex';
}

function restartGame() {
    startGame();
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

initGame();
gameDraw();
