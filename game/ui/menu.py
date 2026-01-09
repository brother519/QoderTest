"""
菜单界面
"""
import pygame
from game.config import WHITE, YELLOW, SCREEN_WIDTH, SCREEN_HEIGHT, GameState


class Menu:
    """菜单类"""
    
    def __init__(self):
        """初始化菜单"""
        self.title_font = pygame.font.Font(None, 72)
        self.font = pygame.font.Font(None, 48)
        self.small_font = pygame.font.Font(None, 32)
    
    def draw_game_over(self, surface):
        """
        绘制游戏结束界面
        
        Args:
            surface: 绘制表面
        """
        # 绘制标题
        title_text = self.title_font.render("GAME OVER", True, WHITE)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        surface.blit(title_text, title_rect)
        
        # 绘制提示
        hint_text = self.small_font.render("Press SPACE to restart or ESC to quit", True, YELLOW)
        hint_rect = hint_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
        surface.blit(hint_text, hint_rect)
    
    def draw_win(self, surface, score):
        """
        绘制胜利界面
        
        Args:
            surface: 绘制表面
            score: 得分
        """
        # 绘制标题
        title_text = self.title_font.render("YOU WIN!", True, YELLOW)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 80))
        surface.blit(title_text, title_rect)
        
        # 绘制分数
        score_text = self.font.render(f"Score: {score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        surface.blit(score_text, score_rect)
        
        # 绘制提示
        hint_text = self.small_font.render("Press SPACE to restart or ESC to quit", True, YELLOW)
        hint_rect = hint_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 80))
        surface.blit(hint_text, hint_rect)
    
    def draw_paused(self, surface):
        """
        绘制暂停界面
        
        Args:
            surface: 绘制表面
        """
        title_text = self.title_font.render("PAUSED", True, YELLOW)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        surface.blit(title_text, title_rect)
