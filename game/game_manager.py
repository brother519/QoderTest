"""
游戏状态管理器
"""
import random
from game.config import GameState, EnemyType


class GameManager:
    """游戏状态管理器"""
    
    def __init__(self):
        """初始化游戏管理器"""
        self.state = GameState.PLAYING
        self.current_level = 1
        self.score = 0
        
        # 敌方坦克管理
        self.enemy_total = 0
        self.enemy_remaining = 0
        self.enemy_max_active = 4
        self.enemy_killed = 0
    
    def init_level(self, level_data):
        """
        初始化关卡
        
        Args:
            level_data: 关卡数据
        """
        self.enemy_total = level_data["enemy_total"]
        self.enemy_remaining = self.enemy_total
        self.enemy_max_active = level_data["enemy_max_active"]
        self.enemy_killed = 0
    
    def should_spawn_enemy(self, current_enemy_count):
        """
        检查是否应该生成新的敌方坦克
        
        Args:
            current_enemy_count: 当前存活的敌方坦克数量
            
        Returns:
            是否应该生成
        """
        return (current_enemy_count < self.enemy_max_active and
                self.enemy_killed < self.enemy_total)
    
    def get_random_enemy_type(self):
        """
        随机获取敌方坦克类型
        
        Returns:
            敌方坦克类型
        """
        rand = random.random()
        if rand < 0.6:
            return EnemyType.NORMAL
        elif rand < 0.85:
            return EnemyType.FAST
        else:
            return EnemyType.ARMOR
    
    def enemy_destroyed(self):
        """敌方坦克被摧毁"""
        self.enemy_killed += 1
        self.score += 100
        
        # 检查是否胜利
        if self.enemy_killed >= self.enemy_total:
            self.state = GameState.WIN
    
    def base_destroyed(self):
        """基地被摧毁"""
        self.state = GameState.GAME_OVER
    
    def player_died(self, player):
        """
        玩家坦克被摧毁
        
        Args:
            player: 玩家坦克对象
        """
        player.lives -= 1
        
        if player.lives <= 0:
            self.state = GameState.GAME_OVER
    
    def is_game_over(self):
        """
        检查游戏是否结束
        
        Returns:
            是否结束
        """
        return self.state in [GameState.GAME_OVER, GameState.WIN]
    
    def reset(self):
        """重置游戏状态"""
        self.state = GameState.PLAYING
        self.score = 0
        self.enemy_killed = 0
