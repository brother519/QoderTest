"""
坦克基类
"""
import pygame
from game.config import Direction, TANK_SIZE, TANK_SPEED, GRID_SIZE, FIRE_COOLDOWN
from abc import ABC, abstractmethod


class Tank(pygame.sprite.Sprite, ABC):
    """坦克抽象基类"""
    
    def __init__(self, x, y, direction, color):
        """
        初始化坦克
        
        Args:
            x: X坐标
            y: Y坐标
            direction: 初始方向
            color: 坦克颜色（用于临时显示）
        """
        super().__init__()
        
        # 位置和方向
        self.x = x
        self.y = y
        self.direction = direction
        
        # 移动速度
        self.speed = TANK_SPEED
        
        # 生命值
        self.health = 1
        
        # 射击冷却
        self.fire_cooldown = 0
        self.bullet = None  # 当前存在的子弹（每次只能有一颗）
        
        # 创建临时精灵（彩色矩形）
        self.image = pygame.Surface((TANK_SIZE, TANK_SIZE))
        self.image.fill(color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        
        # 用于碰撞检测的旧位置
        self.old_x = x
        self.old_y = y
    
    def move(self, dx, dy):
        """
        移动坦克
        
        Args:
            dx: X方向位移
            dy: Y方向位移
        """
        # 保存旧位置
        self.old_x = self.x
        self.old_y = self.y
        
        # 更新位置
        self.x += dx
        self.y += dy
        self.rect.x = self.x
        self.rect.y = self.y
    
    def undo_move(self):
        """撤销移动（碰撞后恢复到旧位置）"""
        self.x = self.old_x
        self.y = self.old_y
        self.rect.x = self.x
        self.rect.y = self.y
    
    def rotate(self, new_direction):
        """
        旋转坦克
        
        Args:
            new_direction: 新方向
        """
        self.direction = new_direction
    
    def can_fire(self):
        """检查是否可以射击"""
        return self.fire_cooldown == 0 and self.bullet is None
    
    @abstractmethod
    def fire(self):
        """
        发射子弹（抽象方法，子类需实现）
        
        Returns:
            子弹对象或None
        """
        pass
    
    def take_damage(self, damage):
        """
        受到伤害
        
        Args:
            damage: 伤害值
            
        Returns:
            是否死亡
        """
        self.health -= damage
        return self.health <= 0
    
    def update(self):
        """更新坦克状态（每帧调用）"""
        # 更新射击冷却
        if self.fire_cooldown > 0:
            self.fire_cooldown -= 1
    
    def draw(self, surface):
        """
        绘制坦克
        
        Args:
            surface: 绘制表面
        """
        surface.blit(self.image, self.rect)
