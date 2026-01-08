"""
输入处理系统
"""
import pygame


class InputHandler:
    """输入处理器"""
    
    def __init__(self, player_tank):
        """
        初始化输入处理器
        
        Args:
            player_tank: 玩家坦克对象
        """
        self.player_tank = player_tank
    
    def handle_input(self):
        """处理键盘输入"""
        keys = pygame.key.get_pressed()
        
        # 处理坦克移动
        self.player_tank.handle_input(keys)
    
    def handle_keydown(self, event):
        """
        处理按键按下事件
        
        Args:
            event: pygame事件对象
        """
        if event.key == pygame.K_SPACE:
            # 射击
            return self.player_tank.fire()
        
        return None