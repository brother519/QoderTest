"""
HUD显示（抬头显示）
"""
import pygame
from game.config import WHITE, SCREEN_WIDTH


class HUD:
    """HUD显示类"""
    
    def __init__(self):
        """初始化HUD"""
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
    
    def draw(self, surface, game_manager, player, enemy_count):
        """
        绘制HUD
        
        Args:
            surface: 绘制表面
            game_manager: 游戏管理器
            player: 玩家坦克
            enemy_count: 当前敌方坦克数量
        """
        # 绘制玩家生命数
        lives_text = self.small_font.render(f"Lives: {player.lives}", True, WHITE)
        surface.blit(lives_text, (10, 10))
        
        # 绘制剩余敌人数
        enemies_left = game_manager.enemy_total - game_manager.enemy_killed
        enemies_text = self.small_font.render(f"Enemies: {enemies_left}", True, WHITE)
        surface.blit(enemies_text, (10, 40))
        
        # 绘制关卡
        level_text = self.small_font.render(f"Level: {game_manager.current_level}", True, WHITE)
        surface.blit(level_text, (SCREEN_WIDTH - 120, 10))
        
        # 绘制分数
        score_text = self.small_font.render(f"Score: {game_manager.score}", True, WHITE)
        surface.blit(score_text, (SCREEN_WIDTH - 150, 40))
