"""
基地类
"""
import pygame
from game.config import GRID_SIZE, RED, DARK_GRAY


class Base(pygame.sprite.Sprite):
    """基地类"""
    
    def __init__(self, x, y):
        """
        初始化基地
        
        Args:
            x: X坐标
            y: Y坐标
        """
        super().__init__()
        
        self.x = x
        self.y = y
        self.is_alive = True
        
        # 创建基地精灵（使用红色表示）
        self.image = pygame.Surface((GRID_SIZE, GRID_SIZE))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
    
    def destroy(self):
        """摧毁基地"""
        self.is_alive = False
        # 改变颜色表示被摧毁
        self.image.fill(DARK_GRAY)
    
    def draw(self, surface):
        """
        绘制基地
        
        Args:
            surface: 绘制表面
        """
        surface.blit(self.image, self.rect)
