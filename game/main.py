"""
坦克大战游戏主循环
"""
import pygame
import sys
import random
from game.config import (
    SCREEN_WIDTH, SCREEN_HEIGHT, FPS, BLACK, 
    Direction, GameState
)
from game.entities.player_tank import PlayerTank
from game.entities.enemy_tank import EnemyTank
from game.systems.input_handler import InputHandler
from game.systems.collision import CollisionSystem
from game.levels.level_loader import LevelLoader
from game.game_manager import GameManager
from game.ui.hud import HUD
from game.ui.menu import Menu


class Game:
    """游戏主类"""
    
    def __init__(self):
        """初始化游戏"""
        pygame.init()
        
        # 创建窗口
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("坦克大战")
        
        # 创建时钟对象（控制帧率）
        self.clock = pygame.time.Clock()
        
        # 游戏运行标志
        self.running = True
        
        # 创建游戏系统
        self.game_manager = GameManager()
        self.collision_system = CollisionSystem()
        self.level_loader = LevelLoader()
        self.hud = HUD()
        self.menu = Menu()
        
        # 初始化游戏
        self.init_game()
    
    def init_game(self):
        """初始化游戏"""
        # 创建精灵组
        self.all_sprites = pygame.sprite.Group()
        self.bullets = pygame.sprite.Group()
        self.enemy_tanks = []
        
        # 加载关卡
        level_data = self.level_loader.load_level(1)
        self.walls = level_data["walls"]
        self.base = level_data["base"]
        self.enemy_spawns = level_data["enemy_spawns"]
        
        # 初始化游戏管理器
        self.game_manager.init_level(level_data)
        
        # 创建玩家坦克
        player_spawn = level_data["player_spawn"]
        self.player = PlayerTank(player_spawn["x"], player_spawn["y"], Direction.UP)
        self.all_sprites.add(self.player)
        
        # 创建输入处理器
        self.input_handler = InputHandler(self.player)
        
        # 将墙壁和基地添加到精灵组
        self.all_sprites.add(self.walls)
        self.all_sprites.add(self.base)
        
        # 生成初始敌方坦克
        self.enemy_spawn_timer = 0
    
    def spawn_enemy(self):
        """生成敌方坦克"""
        if not self.game_manager.should_spawn_enemy(len(self.enemy_tanks)):
            return
        
        # 选择随机出生点
        spawn = random.choice(self.enemy_spawns)
        enemy_type = self.game_manager.get_random_enemy_type()
        
        # 创建敌方坦克
        enemy = EnemyTank(spawn["x"], spawn["y"], enemy_type, Direction.DOWN)
        self.enemy_tanks.append(enemy)
        self.all_sprites.add(enemy)
    
    def handle_events(self):
        """处理事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_SPACE:
                    if self.game_manager.is_game_over():
                        # 重新开始游戏
                        self.game_manager.reset()
                        self.init_game()
                    else:
                        # 游戏中射击
                        bullet = self.input_handler.handle_keydown(event)
                        if bullet:
                            self.bullets.add(bullet)
                            self.all_sprites.add(bullet)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                # 处理鼠标点击
                if not self.game_manager.is_game_over():
                    bullet = self.input_handler.handle_mouse_button(event)
                    if bullet:
                        self.bullets.add(bullet)
                        self.all_sprites.add(bullet)
        
        # 处理持续按键（移动）
        if not self.game_manager.is_game_over():
            self.input_handler.handle_input()
    
    def update(self):
        """更新游戏状态"""
        if self.game_manager.is_game_over():
            return
        
        # 生成敌方坦克
        self.enemy_spawn_timer += 1
        if self.enemy_spawn_timer >= 120:  # 每2秒尝试生成
            self.spawn_enemy()
            self.enemy_spawn_timer = 0
        
        # 更新玩家坦克
        self.player.update()
        
        # 检查玩家坦克碰撞
        self.collision_system.check_tank_boundaries(self.player)
        self.collision_system.check_tank_walls(self.player, self.walls)
        self.collision_system.check_tank_tank(self.player, self.enemy_tanks)
        
        # 更新敌方坦克
        for enemy in list(self.enemy_tanks):
            enemy.update_ai(self.walls, self.enemy_tanks, self.base)
            enemy.update()
            
            # 检查敌方坦克碰撞
            self.collision_system.check_tank_boundaries(enemy)
            self.collision_system.check_tank_walls(enemy, self.walls)
            
            # 尝试射击
            bullet = enemy.try_shoot()
            if bullet:
                self.bullets.add(bullet)
                self.all_sprites.add(bullet)
        
        # 更新子弹
        self.bullets.update()
        
        # 碰撞检测
        self.collision_system.check_bullet_walls(self.bullets, self.walls)
        
        # 子弹击中玩家坦克
        hit_players = self.collision_system.check_bullet_tanks(
            self.bullets, [self.player]
        )
        if hit_players:
            # 玩家被击中
            self.game_manager.player_died(self.player)
            if self.player.lives > 0:
                # 重生
                player_spawn = self.level_loader.level_data["player_spawn"]
                self.player.respawn(player_spawn["x"], player_spawn["y"])
        
        # 子弹击中敌方坦克
        hit_enemies = self.collision_system.check_bullet_tanks(
            self.bullets, self.enemy_tanks
        )
        for enemy in hit_enemies:
            enemy.kill()
            self.enemy_tanks.remove(enemy)
            self.game_manager.enemy_destroyed()
        
        # 子弹击中基地
        if self.collision_system.check_bullet_base(self.bullets, self.base):
            self.game_manager.base_destroyed()
    
    def render(self):
        """渲染游戏画面"""
        # 清空屏幕
        self.screen.fill(BLACK)
        
        # 绘制所有精灵
        self.all_sprites.draw(self.screen)
        
        # 绘制HUD
        if not self.game_manager.is_game_over():
            self.hud.draw(self.screen, self.game_manager, self.player, len(self.enemy_tanks))
        
        # 绘制游戏结束界面
        if self.game_manager.state == GameState.GAME_OVER:
            self.menu.draw_game_over(self.screen)
        elif self.game_manager.state == GameState.WIN:
            self.menu.draw_win(self.screen, self.game_manager.score)
        
        # 更新显示
        pygame.display.flip()
    
    def run(self):
        """运行游戏主循环"""
        while self.running:
            # 处理事件
            self.handle_events()
            
            # 更新游戏状态
            self.update()
            
            # 渲染画面
            self.render()
            
            # 控制帧率
            self.clock.tick(FPS)
        
        # 退出游戏
        pygame.quit()
        sys.exit()


def main():
    """主函数"""
    game = Game()
    game.run()


if __name__ == "__main__":
    main()