// Animation.js - 动画工具
class Animation {
    constructor() {
        this.animations = []; // 存储所有活跃的动画
    }

    // 卡片移动动画
    moveCard(card, targetX, targetY, duration = GAME_CONFIG.ANIMATION_DURATION) {
        return new Promise((resolve) => {
            const startX = card.x;
            const startY = card.y;
            const deltaX = targetX - startX;
            const deltaY = targetY - startY;
            
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用缓动函数（ease-out）
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                card.x = startX + deltaX * easeProgress;
                card.y = startY + deltaY * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    card.x = targetX;
                    card.y = targetY;
                    resolve();
                }
            };
            
            animate();
        });
    }

    // 消除动画（缩放消失）
    removeCard(card, duration = GAME_CONFIG.ANIMATION_DURATION / 2) {
        return new Promise((resolve) => {
            const startScale = 1;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 缩放到0
                const scale = 1 - progress;
                
                card.scale = scale;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    card.scale = 0;
                    resolve();
                }
            };
            
            animate();
        });
    }

    // 淡入动画
    fadeIn(element, duration = 300) {
        return new Promise((resolve) => {
            let opacity = 0;
            const interval = 16; // 约60fps
            const increment = interval / duration;
            
            const fade = () => {
                if (opacity < 1) {
                    opacity += increment;
                    element.style.opacity = opacity;
                    setTimeout(fade, interval);
                } else {
                    resolve();
                }
            };
            
            fade();
        });
    }

    // 淡出动画
    fadeOut(element, duration = 300) {
        return new Promise((resolve) => {
            let opacity = 1;
            const interval = 16; // 约60fps
            const decrement = interval / duration;
            
            const fade = () => {
                if (opacity > 0) {
                    opacity -= decrement;
                    element.style.opacity = opacity;
                    setTimeout(fade, interval);
                } else {
                    resolve();
                }
            };
            
            fade();
        });
    }

    // 添加通用动画方法
    animateProperty(startValue, endValue, duration, onUpdate, onComplete) {
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用线性插值
            const currentValue = startValue + (endValue - startValue) * progress;
            onUpdate(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                onUpdate(endValue);
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
}

// 全局动画实例
const animationManager = new Animation();