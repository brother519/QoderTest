"""
碰撞检测系统
"""
import pygame
from game.config import SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE


class CollisionSystem:
    """碰撞检测系统"""
    
    def __init__(self):
        """初始化碰撞检测系统"""
        pass
    
    def check_tank_boundaries(self, tank):
        """
        检查坦克是否超出地图边界
        
        Args:
            tank: 坦克对象
            
        Returns:
            是否发生碰撞
        """
        if (tank.x < GRID_SIZE or tank.x + tank.rect.width > SCREEN_WIDTH - GRID_SIZE or
            tank.y < GRID_SIZE or tank.y + tank.rect.height > SCREEN_HEIGHT - GRID_SIZE):
            tank.undo_move()
            return True
        return False
    
    def check_tank_walls(self, tank, walls):
        """
        检查坦克与墙壁的碰撞
        
        Args:
            tank: 坦克对象
            walls: 墙壁精灵组
            
        Returns:
            是否发生碰撞
        """
        collided_walls = pygame.sprite.spritecollide(tank, walls, False)
        
        for wall in collided_walls:
            if wall.blocks_tank:
                tank.undo_move()
                return True
        
        return False
    
    def check_tank_tank(self, tank, other_tanks):
        """
        检查坦克与其他坦克的碰撞
        
        Args:
            tank: 坦克对象
            other_tanks: 其他坦克列表
            
        Returns:
            是否发生碰撞
        """
        for other_tank in other_tanks:
            if other_tank != tank and tank.rect.colliderect(other_tank.rect):
                tank.undo_move()
                return True
        
        return False
    
    def check_bullet_walls(self, bullets, walls):
        """
        检查子弹与墙壁的碰撞
        
        Args:
            bullets: 子弹精灵组
            walls: 墙壁精灵组
        """
        for bullet in bullets:
            collided_walls = pygame.sprite.spritecollide(bullet, walls, False)
            
            for wall in collided_walls:
                if wall.blocks_bullet:
                    # 子弹击中墙壁
                    wall.take_damage()
                    bullet.destroy()
                    break
    
    def check_bullet_tanks(self, bullets, tanks):
        """
        检查子弹与坦克的碰撞
        
        Args:
            bullets: 子弹精灵组
            tanks: 坦克列表
            
        Returns:
            被击中的坦克列表
        """
        hit_tanks = []
        
        for bullet in list(bullets):
            for tank in tanks:
                # 不能击中自己
                if bullet.owner == tank:
                    continue
                
                if bullet.rect.colliderect(tank.rect):
                    # 如果坦克有护盾，不受伤害
                    if hasattr(tank, 'is_shielded') and tank.is_shielded:
                        bullet.destroy()
                        continue
                    
                    # 坦克受伤
                    is_dead = tank.take_damage(bullet.damage)
                    if is_dead:
                        hit_tanks.append(tank)
                    
                    bullet.destroy()
                    break
        
        return hit_tanks
    
    def check_bullet_base(self, bullets, base):
        """
        检查子弹与基地的碰撞
        
        Args:
            bullets: 子弹精灵组
            base: 基地对象
            
        Returns:
            基地是否被击中
        """
        if not base.is_alive:
            return False
        
        for bullet in bullets:
            if bullet.rect.colliderect(base.rect):
                base.destroy()
                bullet.destroy()
                return True
        
        return False
