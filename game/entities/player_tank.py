"""
玩家坦克类
"""
import pygame
from game.entities.tank import Tank
from game.entities.bullet import Bullet
from game.config import (
    Direction, TANK_SIZE, GREEN, YELLOW, WHITE,
    SHIELD_DURATION, FIRE_COOLDOWN, PLAYER_LIVES
)


class PlayerTank(Tank):
    """玩家坦克"""
    
    def __init__(self, x, y, direction=Direction.UP):
        """
        初始化玩家坦克
        
        Args:
            x: X坐标
            y: Y坐标
            direction: 初始方向
        """
        super().__init__(x, y, direction, GREEN)
        
        # 玩家特有属性
        self.lives = PLAYER_LIVES  # 剩余生命数
        self.is_shielded = True    # 是否有护盾（出生保护）
        self.shield_timer = SHIELD_DURATION  # 护盾持续时间
    
    def handle_input(self, keys):
        """
        处理键盘输入
        
        Args:
            keys: pygame.key.get_pressed() 返回的按键状态
        """
        # 方向键移动
        if keys[pygame.K_UP]:
            self.rotate(Direction.UP)
            self.move(0, -self.speed)
        elif keys[pygame.K_DOWN]:
            self.rotate(Direction.DOWN)
            self.move(0, self.speed)
        elif keys[pygame.K_LEFT]:
            self.rotate(Direction.LEFT)
            self.move(-self.speed, 0)
        elif keys[pygame.K_RIGHT]:
            self.rotate(Direction.RIGHT)
            self.move(self.speed, 0)
    
    def fire(self):
        """
        发射子弹
        
        Returns:
            子弹对象或None
        """
        if not self.can_fire():
            return None
        
        # 计算子弹初始位置（从坦克中心发射）
        bullet_x = self.x + TANK_SIZE // 2 - 4
        bullet_y = self.y + TANK_SIZE // 2 - 4
        
        # 根据方向调整子弹位置
        if self.direction == Direction.UP:
            bullet_y = self.y - 8
        elif self.direction == Direction.DOWN:
            bullet_y = self.y + TANK_SIZE
        elif self.direction == Direction.LEFT:
            bullet_x = self.x - 8
        elif self.direction == Direction.RIGHT:
            bullet_x = self.x + TANK_SIZE
        
        # 创建子弹
        bullet = Bullet(bullet_x, bullet_y, self.direction, self, YELLOW)
        self.bullet = bullet
        self.fire_cooldown = FIRE_COOLDOWN
        
        return bullet
    
    def respawn(self, x, y):
        """
        重生
        
        Args:
            x: 重生位置X
            y: 重生位置Y
        """
        self.x = x
        self.y = y
        self.rect.x = x
        self.rect.y = y
        self.health = 1
        self.is_shielded = True
        self.shield_timer = SHIELD_DURATION
        self.direction = Direction.UP
    
    def update(self):
        """更新玩家坦克状态"""
        super().update()
        
        # 更新护盾
        if self.is_shielded:
            self.shield_timer -= 1
            if self.shield_timer <= 0:
                self.is_shielded = False
                self.shield_timer = 0
    
    def draw(self, surface):
        """
        绘制玩家坦克
        
        Args:
            surface: 绘制表面
        """
        super().draw(surface)
        
        # 如果有护盾，绘制护盾效果（白色边框）
        if self.is_shielded:
            pygame.draw.rect(surface, WHITE, self.rect, 2)
