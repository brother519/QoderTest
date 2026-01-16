import { Constants, DirectionVectors } from '../utils/Constants.js';

// AI控制器
export class AIController {
    constructor() {
        this.decisionTimers = new Map();
    }
    
    decide(enemy, playerTank, base, map, deltaTime) {
        // 获取或创建敌人的决策计时器
        if (!this.decisionTimers.has(enemy)) {
            this.decisionTimers.set(enemy, {
                moveTimer: 0,
                currentDirection: enemy.direction,
                stuckTimer: 0,
                lastX: enemy.x,
                lastY: enemy.y
            });
        }
        
        const state = this.decisionTimers.get(enemy);
        state.moveTimer += deltaTime;
        
        const action = {
            move: true,
            direction: state.currentDirection,
            fire: false
        };
        
        // 检测是否卡住
        const moved = Math.abs(enemy.x - state.lastX) > 0.1 || 
                      Math.abs(enemy.y - state.lastY) > 0.1;
        
        if (!moved) {
            state.stuckTimer += deltaTime;
        } else {
            state.stuckTimer = 0;
        }
        
        state.lastX = enemy.x;
        state.lastY = enemy.y;
        
        // 定期重新决策或卡住时
        if (state.moveTimer >= Constants.AI_DECISION_INTERVAL || state.stuckTimer > 0.5) {
            state.moveTimer = 0;
            state.stuckTimer = 0;
            
            // 决定新方向
            state.currentDirection = this.chooseDirection(enemy, playerTank, base, map);
            action.direction = state.currentDirection;
        }
        
        // 决定是否射击
        action.fire = this.shouldFire(enemy, playerTank, base, map);
        
        return action;
    }
    
    chooseDirection(enemy, playerTank, base, map) {
        const directions = [
            Constants.DIRECTION.UP,
            Constants.DIRECTION.DOWN,
            Constants.DIRECTION.LEFT,
            Constants.DIRECTION.RIGHT
        ];
        
        // 计算目标方向
        let targetDirection = this.getTargetDirection(enemy, playerTank, base);
        
        // 70%概率朝向目标，30%概率随机
        if (Math.random() < 0.7) {
            // 检查目标方向是否可行
            if (this.canMoveInDirection(enemy, targetDirection, map)) {
                return targetDirection;
            }
        }
        
        // 随机选择一个可行的方向
        const validDirections = directions.filter(dir => 
            this.canMoveInDirection(enemy, dir, map)
        );
        
        if (validDirections.length > 0) {
            return validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        // 如果没有可行方向，保持当前方向
        return enemy.direction;
    }
    
    getTargetDirection(enemy, playerTank, base) {
        // 50%概率追踪玩家，50%概率朝向基地
        const target = Math.random() < 0.5 && playerTank && playerTank.isAlive
            ? { x: playerTank.x, y: playerTank.y }
            : { x: base.x, y: base.y };
        
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        
        // 选择距离更远的轴方向
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? Constants.DIRECTION.RIGHT : Constants.DIRECTION.LEFT;
        } else {
            return dy > 0 ? Constants.DIRECTION.DOWN : Constants.DIRECTION.UP;
        }
    }
    
    canMoveInDirection(enemy, direction, map) {
        const vector = DirectionVectors[direction];
        const testDistance = Constants.TILE_SIZE;
        const newX = enemy.x + vector.x * testDistance;
        const newY = enemy.y + vector.y * testDistance;
        
        // 检查边界
        if (newX < 0 || newX + enemy.size > Constants.CANVAS_WIDTH ||
            newY < 0 || newY + enemy.size > Constants.CANVAS_HEIGHT) {
            return false;
        }
        
        // 检查地图碰撞
        return map.isAreaPassable(newX, newY, enemy.size, enemy.size);
    }
    
    shouldFire(enemy, playerTank, base, map) {
        // 基础射击概率
        const baseFireChance = 0.02;
        
        // 检查是否有目标在射击线上
        const hasTarget = this.hasTargetInLine(enemy, playerTank, base, map);
        
        if (hasTarget) {
            return Math.random() < 0.3; // 30%概率射击
        }
        
        return Math.random() < baseFireChance;
    }
    
    hasTargetInLine(enemy, playerTank, base, map) {
        const vector = DirectionVectors[enemy.direction];
        const enemyCenter = enemy.getCenter();
        
        // 射线检测
        let checkX = enemyCenter.x;
        let checkY = enemyCenter.y;
        const step = Constants.TILE_SIZE;
        const maxDistance = Constants.CANVAS_WIDTH;
        
        for (let dist = 0; dist < maxDistance; dist += step) {
            checkX += vector.x * step;
            checkY += vector.y * step;
            
            // 超出边界
            if (checkX < 0 || checkX > Constants.CANVAS_WIDTH ||
                checkY < 0 || checkY > Constants.CANVAS_HEIGHT) {
                break;
            }
            
            // 检查是否有墙阻挡
            const tile = map.getTileAtWorld(checkX, checkY);
            if (tile && !tile.isPassable) {
                break;
            }
            
            // 检查玩家
            if (playerTank && playerTank.isAlive) {
                const playerBounds = playerTank.getBounds();
                if (checkX >= playerBounds.x && checkX <= playerBounds.x + playerBounds.width &&
                    checkY >= playerBounds.y && checkY <= playerBounds.y + playerBounds.height) {
                    return true;
                }
            }
            
            // 检查基地
            if (base && !base.isDestroyed) {
                const baseBounds = base.getBounds();
                if (checkX >= baseBounds.x && checkX <= baseBounds.x + baseBounds.width &&
                    checkY >= baseBounds.y && checkY <= baseBounds.y + baseBounds.height) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 清理已销毁敌人的状态
    cleanup(enemy) {
        this.decisionTimers.delete(enemy);
    }
}
