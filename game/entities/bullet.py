"""
子弹类
"""
import pygame
from game.config import Direction, BULLET_SIZE, BULLET_SPEED, SCREEN_WIDTH, SCREEN_HEIGHT


class Bullet(pygame.sprite.Sprite):
    """子弹类"""
    
    def __init__(self, x, y, direction, owner, color):
        """
        初始化子弹
        
        Args:
            x: X坐标
            y: Y坐标
            direction: 飞行方向
            owner: 发射者（坦克对象）
            color: 子弹颜色
        """
        super().__init__()
        
        self.x = x
        self.y = y
        self.direction = direction
        self.owner = owner
        self.speed = BULLET_SPEED
        self.damage = 1
        
        # 创建子弹精灵
        self.image = pygame.Surface((BULLET_SIZE, BULLET_SIZE))
        self.image.fill(color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
    
    def move(self):
        """移动子弹"""
        if self.direction == Direction.UP:
            self.y -= self.speed
        elif self.direction == Direction.DOWN:
            self.y += self.speed
        elif self.direction == Direction.LEFT:
            self.x -= self.speed
        elif self.direction == Direction.RIGHT:
            self.x += self.speed
        
        self.rect.x = self.x
        self.rect.y = self.y
    
    def is_out_of_bounds(self):
        """
        检查子弹是否超出地图边界
        
        Returns:
            是否超出边界
        """
        return (self.x < 0 or self.x > SCREEN_WIDTH or
                self.y < 0 or self.y > SCREEN_HEIGHT)
    
    def update(self):
        """更新子弹状态"""
        self.move()
        
        # 如果超出边界，通知所有者并标记为销毁
        if self.is_out_of_bounds():
            if self.owner:
                self.owner.bullet = None
            self.kill()
    
    def destroy(self):
        """销毁子弹"""
        if self.owner:
            self.owner.bullet = None
        self.kill()
    
    def draw(self, surface):
        """
        绘制子弹
        
        Args:
            surface: 绘制表面
        """
        surface.blit(self.image, self.rect)
