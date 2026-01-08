"""
墙壁/障碍物类
"""
import pygame
from game.config import WallType, GRID_SIZE, BROWN, GRAY, CYAN, GREEN


class Wall(pygame.sprite.Sprite):
    """墙壁类"""
    
    def __init__(self, x, y, wall_type):
        """
        初始化墙壁
        
        Args:
            x: X坐标
            y: Y坐标
            wall_type: 墙壁类型
        """
        super().__init__()
        
        self.x = x
        self.y = y
        self.wall_type = wall_type
        
        # 根据类型设置属性
        if wall_type == WallType.BRICK:
            self.is_destructible = True
            self.blocks_tank = True
            self.blocks_bullet = True
            color = BROWN
        elif wall_type == WallType.STEEL:
            self.is_destructible = False
            self.blocks_tank = True
            self.blocks_bullet = True
            color = GRAY
        elif wall_type == WallType.WATER:
            self.is_destructible = False
            self.blocks_tank = True
            self.blocks_bullet = False
            color = CYAN
        else:  # GRASS
            self.is_destructible = False
            self.blocks_tank = False
            self.blocks_bullet = False
            color = GREEN
        
        # 创建墙壁精灵
        self.image = pygame.Surface((GRID_SIZE, GRID_SIZE))
        self.image.fill(color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
    
    def take_damage(self):
        """
        被击中
        
        Returns:
            是否应该被销毁
        """
        if self.is_destructible:
            self.kill()
            return True
        return False
    
    def draw(self, surface):
        """
        绘制墙壁
        
        Args:
            surface: 绘制表面
        """
        surface.blit(self.image, self.rect)
