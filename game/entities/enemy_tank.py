"""
敌方坦克类
"""
import random
import pygame
from game.entities.tank import Tank
from game.entities.bullet import Bullet
from game.config import (
    Direction, EnemyType, TANK_SIZE, TANK_SPEED, TANK_FAST_SPEED,
    RED, ORANGE, BLUE, FIRE_COOLDOWN, WHITE
)


class EnemyTank(Tank):
    """敌方坦克"""
    
    def __init__(self, x, y, enemy_type=EnemyType.NORMAL, direction=Direction.DOWN):
        """
        初始化敌方坦克
        
        Args:
            x: X坐标
            y: Y坐标
            enemy_type: 敌方坦克类型
            direction: 初始方向
        """
        # 根据类型设置颜色
        if enemy_type == EnemyType.FAST:
            color = ORANGE
        elif enemy_type == EnemyType.ARMOR:
            color = BLUE
        else:
            color = RED
        
        super().__init__(x, y, direction, color)
        
        self.enemy_type = enemy_type
        
        # 根据类型设置属性
        if enemy_type == EnemyType.FAST:
            self.speed = TANK_FAST_SPEED
            self.health = 1
        elif enemy_type == EnemyType.ARMOR:
            self.speed = TANK_SPEED
            self.health = 3
        else:  # NORMAL
            self.speed = TANK_SPEED
            self.health = 1
        
        # AI相关属性
        self.ai_timer = 0
        self.ai_change_direction_interval = random.randint(60, 180)  # 1-3秒
        self.shoot_probability = 0.02  # 每帧2%的概率射击
    
    def update_ai(self, walls, tanks, base):
        """
        更新AI行为
        
        Args:
            walls: 墙壁精灵组
            tanks: 其他坦克列表
            base: 基地对象
        """
        self.ai_timer += 1
        
        # 随机换方向
        if self.ai_timer >= self.ai_change_direction_interval:
            self.choose_random_direction()
            self.ai_timer = 0
            self.ai_change_direction_interval = random.randint(60, 180)
        
        # 根据方向移动
        if self.direction == Direction.UP:
            self.move(0, -self.speed)
        elif self.direction == Direction.DOWN:
            self.move(0, self.speed)
        elif self.direction == Direction.LEFT:
            self.move(-self.speed, 0)
        elif self.direction == Direction.RIGHT:
            self.move(self.speed, 0)
    
    def choose_random_direction(self):
        """随机选择移动方向"""
        directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT]
        self.direction = random.choice(directions)
    
    def try_shoot(self):
        """
        尝试射击
        
        Returns:
            子弹对象或None
        """
        if not self.can_fire():
            return None
        
        # 随机射击
        if random.random() < self.shoot_probability:
            return self.fire()
        
        return None
    
    def fire(self):
        """
        发射子弹
        
        Returns:
            子弹对象或None
        """
        if not self.can_fire():
            return None
        
        # 计算子弹初始位置
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
        bullet = Bullet(bullet_x, bullet_y, self.direction, self, WHITE)
        self.bullet = bullet
        self.fire_cooldown = FIRE_COOLDOWN
        
        return bullet
    
    def update(self):
        """更新敌方坦克状态"""
        super().update()
