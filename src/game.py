import pygame
import random
from src.constants import MENU, RUNNING, PAUSED, GAME_OVER, WIN, BRICK, STEEL
from src.tank import PlayerTank, EnemyTank
from src.obstacle import Obstacle
from src.utils import check_bullet_collision
import config


class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        pygame.display.set_caption(config.WINDOW_TITLE)
        self.clock = pygame.time.Clock()
        self.game_state = MENU
        self.running = True
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        
        self.player = None
        self.enemies = []
        self.bullets = []
        self.obstacles = []
        self.score = 0
        self.lives = config.PLAYER_LIVES
        
    def setup_level(self):
        player_x = config.SCREEN_WIDTH // 2 - config.TANK_SIZE // 2
        player_y = config.SCREEN_HEIGHT - config.TANK_SIZE - 20
        self.player = PlayerTank(player_x, player_y)
        
        obstacle_size = config.OBSTACLE_SIZE
        
        for x in range(0, config.SCREEN_WIDTH, obstacle_size * 3):
            self.obstacles.append(Obstacle(x, 200, BRICK))
        
        for x in range(100, config.SCREEN_WIDTH - 100, obstacle_size * 4):
            self.obstacles.append(Obstacle(x, 350, STEEL))
        
        self.obstacles.append(Obstacle(config.SCREEN_WIDTH // 2 - obstacle_size, 450, BRICK))
        self.obstacles.append(Obstacle(config.SCREEN_WIDTH // 2, 450, BRICK))
        
        enemy_positions = [
            (50, 50),
            (config.SCREEN_WIDTH - 80, 50),
            (config.SCREEN_WIDTH // 2, 100),
            (150, 100),
            (config.SCREEN_WIDTH - 180, 100)
        ]
        
        for i in range(min(config.ENEMY_COUNT, len(enemy_positions))):
            x, y = enemy_positions[i]
            self.enemies.append(EnemyTank(x, y))
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_RETURN:
                    if self.game_state == MENU:
                        self.game_state = RUNNING
                        self.setup_level()
                elif event.key == pygame.K_r:
                    if self.game_state in [GAME_OVER, WIN]:
                        self.game_state = RUNNING
                        self.score = 0
                        self.lives = config.PLAYER_LIVES
                        self.bullets = []
                        self.setup_level()
                elif event.key == pygame.K_p:
                    if self.game_state == RUNNING:
                        self.game_state = PAUSED
                    elif self.game_state == PAUSED:
                        self.game_state = RUNNING
                elif event.key == pygame.K_SPACE:
                    if self.game_state == RUNNING and self.player:
                        bullet = self.player.fire()
                        if bullet:
                            self.bullets.append(bullet)
    
    def update(self):
        if self.game_state == RUNNING:
            keys = pygame.key.get_pressed()
            if self.player:
                self.player.handle_input(keys, self.obstacles)
            
            current_time = pygame.time.get_ticks()
            player_pos = (self.player.x, self.player.y) if self.player else None
            
            for enemy in self.enemies[:]:
                enemy.ai_update(player_pos, current_time, self.obstacles)
                bullet = enemy.auto_fire(player_pos, current_time)
                if bullet:
                    self.bullets.append(bullet)
            
            for bullet in self.bullets[:]:
                bullet.update()
                if not bullet.is_active:
                    self.bullets.remove(bullet)
    
    def render(self):
        self.screen.fill(config.BACKGROUND_COLOR)
        
        if self.game_state == MENU:
            title_text = self.font.render("坦克大战", True, (255, 255, 255))
            start_text = self.small_font.render("按 ENTER 开始游戏", True, (200, 200, 200))
            quit_text = self.small_font.render("按 ESC 退出", True, (200, 200, 200))
            
            self.screen.blit(title_text, 
                           (config.SCREEN_WIDTH // 2 - title_text.get_width() // 2, 200))
            self.screen.blit(start_text, 
                           (config.SCREEN_WIDTH // 2 - start_text.get_width() // 2, 300))
            self.screen.blit(quit_text, 
                           (config.SCREEN_WIDTH // 2 - quit_text.get_width() // 2, 340))
        
        elif self.game_state == PAUSED:
            for obstacle in self.obstacles:
                obstacle.draw(self.screen)
            if self.player:
                self.player.draw(self.screen)
            for enemy in self.enemies:
                enemy.draw(self.screen)
            for bullet in self.bullets:
                bullet.draw(self.screen)
            
            pause_text = self.font.render("暂停", True, (255, 255, 0))
            continue_text = self.small_font.render("按 P 继续", True, (255, 255, 255))
            self.screen.blit(pause_text, 
                           (config.SCREEN_WIDTH // 2 - pause_text.get_width() // 2, 250))
            self.screen.blit(continue_text, 
                           (config.SCREEN_WIDTH // 2 - continue_text.get_width() // 2, 300))
        
        elif self.game_state == GAME_OVER:
            game_over_text = self.font.render("游戏结束", True, (255, 0, 0))
            score_text = self.small_font.render(f"得分: {self.score}", True, (255, 255, 255))
            restart_text = self.small_font.render("按 R 重新开始", True, (200, 200, 200))
            
            self.screen.blit(game_over_text, 
                           (config.SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 200))
            self.screen.blit(score_text, 
                           (config.SCREEN_WIDTH // 2 - score_text.get_width() // 2, 260))
            self.screen.blit(restart_text, 
                           (config.SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 320))
        
        elif self.game_state == WIN:
            win_text = self.font.render("胜利!", True, (0, 255, 0))
            score_text = self.small_font.render(f"得分: {self.score}", True, (255, 255, 255))
            restart_text = self.small_font.render("按 R 重新开始", True, (200, 200, 200))
            
            self.screen.blit(win_text, 
                           (config.SCREEN_WIDTH // 2 - win_text.get_width() // 2, 200))
            self.screen.blit(score_text, 
                           (config.SCREEN_WIDTH // 2 - score_text.get_width() // 2, 260))
            self.screen.blit(restart_text, 
                           (config.SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 320))
        
        elif self.game_state == RUNNING:
            for obstacle in self.obstacles:
                obstacle.draw(self.screen)
            if self.player:
                self.player.draw(self.screen)
            for enemy in self.enemies:
                enemy.draw(self.screen)
            for bullet in self.bullets:
                bullet.draw(self.screen)
            
            score_text = self.small_font.render(f"得分: {self.score}", True, (255, 255, 255))
            lives_text = self.small_font.render(f"生命: {self.lives}", True, (255, 255, 255))
            enemies_text = self.small_font.render(f"敌人: {len(self.enemies)}", True, (255, 255, 255))
            
            self.screen.blit(score_text, (10, 10))
            self.screen.blit(lives_text, (10, 35))
            self.screen.blit(enemies_text, (10, 60))
        
        pygame.display.flip()
    
    def check_collisions(self):
        all_tanks = []
        if self.player and self.player.health > 0:
            all_tanks.append(self.player)
        all_tanks.extend(self.enemies)
        
        for bullet in self.bullets[:]:
            collision_type, target = check_bullet_collision(bullet, all_tanks, self.obstacles)
            
            if collision_type == 'tank':
                target.take_damage()
                bullet.is_active = False
                if bullet in self.bullets:
                    self.bullets.remove(bullet)
                
                if target.health <= 0:
                    if target == self.player:
                        self.lives -= 1
                        if self.lives > 0:
                            player_x = config.SCREEN_WIDTH // 2 - config.TANK_SIZE // 2
                            player_y = config.SCREEN_HEIGHT - config.TANK_SIZE - 20
                            self.player = PlayerTank(player_x, player_y)
                    elif target in self.enemies:
                        self.enemies.remove(target)
                        self.score += 100
            
            elif collision_type == 'obstacle':
                target.take_damage()
                bullet.is_active = False
                if bullet in self.bullets:
                    self.bullets.remove(bullet)
                
                if target.health <= 0 and target in self.obstacles:
                    self.obstacles.remove(target)
    
    def check_win_lose(self):
        if self.game_state == RUNNING:
            if len(self.enemies) == 0:
                self.game_state = WIN
            elif self.lives <= 0:
                self.game_state = GAME_OVER
    
    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.check_collisions()
            self.check_win_lose()
            self.render()
            self.clock.tick(config.FPS)
        
        pygame.quit()