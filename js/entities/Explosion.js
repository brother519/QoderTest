import { Entity } from './Entity.js';

export class Explosion extends Entity {
    constructor(game, x, y, size = 'small') {
        const explosionSize = size === 'large' ? 40 : 20;
        super(x - explosionSize / 2, y - explosionSize / 2, explosionSize, explosionSize);
        
        this.game = game;
        this.size = size;
        this.maxRadius = explosionSize / 2;
        this.currentRadius = 0;
        this.duration = size === 'large' ? 500 : 300;
        this.elapsed = 0;
        this.particles = this.createParticles();
    }
    
    createParticles() {
        const particles = [];
        const count = this.size === 'large' ? 12 : 6;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * (40 + Math.random() * 20),
                vy: Math.sin(angle) * (40 + Math.random() * 20),
                life: 1
            });
        }
        
        return particles;
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        const progress = this.elapsed / this.duration;
        
        if (progress < 0.3) {
            this.currentRadius = this.maxRadius * (progress / 0.3);
        } else {
            this.currentRadius = this.maxRadius * (1 - (progress - 0.3) / 0.7);
        }
        
        this.particles.forEach(p => {
            p.x += p.vx * (deltaTime / 1000);
            p.y += p.vy * (deltaTime / 1000);
            p.life -= deltaTime / this.duration;
        });
        
        if (this.elapsed >= this.duration) {
            this.isAlive = false;
        }
    }
    
    render(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const progress = this.elapsed / this.duration;
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.currentRadius
        );
        
        const alpha = 1 - progress;
        gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 200, 50, ${alpha})`);
        gradient.addColorStop(0.6, `rgba(255, 100, 0, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        this.particles.forEach(p => {
            if (p.life > 0) {
                ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${p.life})`;
                ctx.beginPath();
                ctx.arc(centerX + p.x, centerY + p.y, 2 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}
