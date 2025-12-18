export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }
    
    emit(x, y, options = {}) {
        const {
            count = 10,
            speed = 50,
            size = 3,
            color = '#fff',
            lifetime = 500,
            gravity = 0,
            spread = Math.PI * 2
        } = options;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * spread - spread / 2;
            const velocity = speed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: size * (0.5 + Math.random() * 0.5),
                color,
                lifetime,
                age: 0,
                gravity
            });
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.age += deltaTime;
            p.x += p.vx * (deltaTime / 1000);
            p.y += p.vy * (deltaTime / 1000);
            p.vy += p.gravity * (deltaTime / 1000);
            
            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const p of this.particles) {
            const alpha = 1 - (p.age / p.lifetime);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    clear() {
        this.particles = [];
    }
}
