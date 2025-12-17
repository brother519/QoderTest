import pygame
import random
import math
from src.constants import UP, DOWN, LEFT, RIGHT
import config


class Tank:
    def __init__(self, x, y, color, speed):
        self.x = x
        self.y = y
        self.width = config.TANK_SIZE
        self.height = config.TANK_SIZE
        self.direction = UP
        self.speed = speed
        self.color = color
        self.health = 1
        self.fire_cooldown = config.FIRE_COOLDOWN
        self.last_fire_time = 0
        
    def can_move_to(self, new_x, new_y, obstacles):
        if new_x < 0 or new_x + self.width > config.SCREEN_WIDTH:
            return False
        if new_y < 0 or new_y + self.height > config.SCREEN_HEIGHT:
            return False
        
        temp_rect = pygame.Rect(new_x, new_y, self.width, self.height)
        for obstacle in obstacles:
            if temp_rect.colliderect(obstacle.get_rect()):
                return False
        
        return True
    
    def move(self, direction, obstacles):
        new_x, new_y = self.x, self.y
        
        if direction == UP:
            new_y -= self.speed
        elif direction == DOWN:
            new_y += self.speed
        elif direction == LEFT:
            new_x -= self.speed
        elif direction == RIGHT:
            new_x += self.speed
        
        if self.can_move_to(new_x, new_y, obstacles):
            self.x = new_x
            self.y = new_y
            self.direction = direction
    
    def fire(self):
        from src.bullet import Bullet
        current_time = pygame.time.get_ticks()
        
        if current_time - self.last_fire_time >= self.fire_cooldown:
            self.last_fire_time = current_time
            
            bullet_x = self.x + self.width // 2
            bullet_y = self.y + self.height // 2
            
            if self.direction == UP:
                bullet_y = self.y - config.BULLET_SIZE - 5
            elif self.direction == DOWN:
                bullet_y = self.y + self.height + 5
            elif self.direction == LEFT:
                bullet_x = self.x - config.BULLET_SIZE - 5
            elif self.direction == RIGHT:
                bullet_x = self.x + self.width + 5
            
            return Bullet(bullet_x, bullet_y, self.direction, self.__class__.__name__)
        
        return None
    
    def take_damage(self):
        self.health -= 1
    
    def draw(self, screen):
        tank_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        pygame.draw.rect(screen, self.color, tank_rect)
        
        barrel_width = 6
        barrel_length = 15
        
        if self.direction == UP:
            barrel_rect = pygame.Rect(
                self.x + self.width // 2 - barrel_width // 2,
                self.y - barrel_length,
                barrel_width,
                barrel_length
            )
        elif self.direction == DOWN:
            barrel_rect = pygame.Rect(
                self.x + self.width // 2 - barrel_width // 2,
                self.y + self.height,
                barrel_width,
                barrel_length
            )
        elif self.direction == LEFT:
            barrel_rect = pygame.Rect(
                self.x - barrel_length,
                self.y + self.height // 2 - barrel_width // 2,
                barrel_length,
                barrel_width
            )
        elif self.direction == RIGHT:
            barrel_rect = pygame.Rect(
                self.x + self.width,
                self.y + self.height // 2 - barrel_width // 2,
                barrel_length,
                barrel_width
            )
        
        pygame.draw.rect(screen, self.color, barrel_rect)
    
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)


class PlayerTank(Tank):
    def __init__(self, x, y):
        super().__init__(x, y, config.PLAYER_COLOR, config.PLAYER_SPEED)
    
    def handle_input(self, keys, obstacles):
        if keys[pygame.K_w]:
            self.move(UP, obstacles)
        elif keys[pygame.K_s]:
            self.move(DOWN, obstacles)
        elif keys[pygame.K_a]:
            self.move(LEFT, obstacles)
        elif keys[pygame.K_d]:
            self.move(RIGHT, obstacles)


class EnemyTank(Tank):
    def __init__(self, x, y):
        super().__init__(x, y, config.ENEMY_COLOR, config.ENEMY_SPEED)
        self.ai_timer = 0
        self.ai_change_interval = random.randint(3000, 5000)
        self.current_direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.stuck_timer = 0
        self.last_position = (x, y)
        self.last_stuck_check = 0
        self.ai_mode = 'patrol'
    
    def ai_update(self, player_pos, current_time, obstacles):
        if current_time - self.ai_timer >= self.ai_change_interval:
            self.ai_timer = current_time
            self.ai_change_interval = random.randint(3000, 5000)
            
            if player_pos:
                distance = math.sqrt((player_pos[0] - self.x) ** 2 + (player_pos[1] - self.y) ** 2)
                if distance < 200:
                    self.ai_mode = 'chase'
                else:
                    self.ai_mode = 'patrol'
            else:
                self.ai_mode = 'patrol'
        
        if self.ai_mode == 'chase' and player_pos:
            self.chase_player(player_pos, obstacles)
        else:
            self.patrol(obstacles)
        
        self.check_stuck(current_time)
    
    def patrol(self, obstacles):
        if not self.can_move_to(
            self.x + (self.speed if self.current_direction == RIGHT else -self.speed if self.current_direction == LEFT else 0),
            self.y + (self.speed if self.current_direction == DOWN else -self.speed if self.current_direction == UP else 0),
            obstacles
        ):
            self.current_direction = random.choice([UP, DOWN, LEFT, RIGHT])
        
        self.move(self.current_direction, obstacles)
    
    def chase_player(self, player_pos, obstacles):
        dx = player_pos[0] - self.x
        dy = player_pos[1] - self.y
        
        if abs(dx) > abs(dy):
            direction = RIGHT if dx > 0 else LEFT
        else:
            direction = DOWN if dy > 0 else UP
        
        self.move(direction, obstacles)
    
    def auto_fire(self, player_pos, current_time):
        if not player_pos:
            return None
        
        if random.random() < 0.02:
            dx = abs(player_pos[0] - self.x)
            dy = abs(player_pos[1] - self.y)
            
            if dx < 50 or dy < 50:
                return self.fire()
        
        if random.random() < 0.005:
            return self.fire()
        
        return None
    
    def check_stuck(self, current_time):
        if current_time - self.last_stuck_check >= 2000:
            if (abs(self.x - self.last_position[0]) < 5 and 
                abs(self.y - self.last_position[1]) < 5):
                self.current_direction = random.choice([UP, DOWN, LEFT, RIGHT])
            
            self.last_position = (self.x, self.y)
            self.last_stuck_check = current_time
