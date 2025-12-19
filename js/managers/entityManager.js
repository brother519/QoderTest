export class EntityManager {
    constructor() {
        this.entities = [];
        this.bullets = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    removeDeadEntities() {
        this.entities = this.entities.filter(e => e.alive);
        this.bullets = this.bullets.filter(b => b.alive);
    }

    update(dt) {
        this.entities.forEach(entity => entity.update(dt));
        this.bullets.forEach(bullet => bullet.update(dt));
        this.removeDeadEntities();
    }

    render(renderer) {
        this.entities.forEach(entity => entity.render(renderer));
        this.bullets.forEach(bullet => bullet.render(renderer));
    }

    getEntitiesByType(Type) {
        return this.entities.filter(e => e instanceof Type);
    }

    clear() {
        this.entities = [];
        this.bullets = [];
    }
}
