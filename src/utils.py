def check_collision(rect1, rect2):
    return rect1.colliderect(rect2)


def check_tank_obstacle_collision(tank, obstacles):
    tank_rect = tank.get_rect()
    for obstacle in obstacles:
        if check_collision(tank_rect, obstacle.get_rect()):
            return True
    return False


def check_bullet_collision(bullet, tanks, obstacles):
    bullet_rect = bullet.get_rect()
    
    for tank in tanks:
        if bullet.owner != tank.__class__.__name__:
            if check_collision(bullet_rect, tank.get_rect()):
                return 'tank', tank
    
    for obstacle in obstacles:
        if check_collision(bullet_rect, obstacle.get_rect()):
            return 'obstacle', obstacle
    
    return None, None
