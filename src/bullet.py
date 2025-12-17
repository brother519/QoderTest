import pygame
from src.constants import UP, DOWN, LEFT, RIGHT
import config


class Bullet:
    def __init__(self, x, y, direction, owner):
        self.x = x
        self.y = y
        self.direction = direction
        self.speed = config.BULLET_SPEED
        self.owner = owner
        self.damage = 1
        self.is_active = True
        self.size = config.BULLET_SIZE
    
    def update(self):
        if self.direction == UP:
            self.y -= self.speed
        elif self.direction == DOWN:
            self.y += self.speed
        elif self.direction == LEFT:
            self.x -= self.speed
        elif self.direction == RIGHT:
            self.x += self.speed
        
        self.check_boundary()
    
    def check_boundary(self):
        if (self.x < 0 or self.x > config.SCREEN_WIDTH or 
            self.y < 0 or self.y > config.SCREEN_HEIGHT):
            self.is_active = False
    
    def draw(self, screen):
        pygame.draw.circle(screen, config.BULLET_COLOR, 
                         (int(self.x), int(self.y)), self.size)
    
    def get_rect(self):
        return pygame.Rect(self.x - self.size, self.y - self.size, 
                          self.size * 2, self.size * 2)
