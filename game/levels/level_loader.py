"""
关卡加载器
"""
import pygame
from game.entities.wall import Wall
from game.entities.base import Base
from game.levels.level_data import get_level_1


class LevelLoader:
    """关卡加载器"""
    
    def __init__(self):
        """初始化关卡加载器"""
        self.current_level = None
        self.level_data = None
    
    def load_level(self, level_num):
        """
        加载指定关卡
        
        Args:
            level_num: 关卡编号
            
        Returns:
            包含墙壁、基地、出生点等信息的字典
        """
        # 获取关卡数据
        if level_num == 1:
            self.level_data = get_level_1()
        else:
            # 默认加载第一关
            self.level_data = get_level_1()
        
        self.current_level = level_num
        
        # 创建游戏对象
        walls = pygame.sprite.Group()
        for wall_data in self.level_data["walls"]:
            wall = Wall(wall_data["x"], wall_data["y"], wall_data["type"])
            walls.add(wall)
        
        # 创建基地
        base_data = self.level_data["base"]
        base = Base(base_data["x"], base_data["y"])
        
        return {
            "walls": walls,
            "base": base,
            "player_spawn": self.level_data["player_spawn"],
            "enemy_spawns": self.level_data["enemy_spawns"],
            "enemy_total": self.level_data["enemy_total"],
            "enemy_max_active": self.level_data["enemy_max_active"]
        }
    
    def get_next_level(self):
        """
        获取下一关编号
        
        Returns:
            下一关编号，如果没有下一关则返回None
        """
        if self.current_level is None:
            return 1
        # 目前只有一关，后续可扩展
        return None
