import pygame
from src.constants import BRICK, STEEL
import config


class Obstacle:
    def __init__(self, x, y, obstacle_type):
        self.x = x
        self.y = y
        self.width = config.OBSTACLE_SIZE
        self.height = config.OBSTACLE_SIZE
        self.obstacle_type = obstacle_type
        
        if obstacle_type == BRICK:
            self.is_destructible = True
            self.health = 1
            self.color = config.BRICK_COLOR
        elif obstacle_type == STEEL:
            self.is_destructible = False
            self.health = 999
            self.color = config.STEEL_COLOR
    
    def take_damage(self):
        if self.is_destructible:
            self.health -= 1
    
    def draw(self, screen):
        obstacle_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        pygame.draw.rect(screen, self.color, obstacle_rect)
    
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)
