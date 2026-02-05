"""
游戏配置常量
"""
from enum import Enum

# 屏幕设置
SCREEN_WIDTH = 832
SCREEN_HEIGHT = 832
GRID_SIZE = 32
FPS = 60

# 颜色常量（RGB）
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
GRAY = (128, 128, 128)
DARK_GRAY = (64, 64, 64)
ORANGE = (255, 165, 0)
BROWN = (139, 69, 19)
CYAN = (0, 255, 255)

# 方向枚举
class Direction(Enum):
    UP = 0
    DOWN = 1
    LEFT = 2
    RIGHT = 3

# 游戏状态枚举
class GameState(Enum):
    MENU = 0
    PLAYING = 1
    PAUSED = 2
    GAME_OVER = 3
    WIN = 4

# 墙壁类型枚举
class WallType(Enum):
    BRICK = 0      # 砖墙（可摧毁）
    STEEL = 1      # 钢墙（不可摧毁）
    WATER = 2      # 水域（坦克无法通过）
    GRASS = 3      # 草地（视觉遮挡）

# 敌方坦克类型枚举
class EnemyType(Enum):
    NORMAL = 0     # 普通坦克（1血）
    FAST = 1       # 快速坦克（1血，速度快）
    ARMOR = 2      # 装甲坦克（3血）

# 坦克设置
TANK_SIZE = 32
TANK_SPEED = 2
TANK_FAST_SPEED = 3
PLAYER_LIVES = 3
ENEMY_MAX_ACTIVE = 4  # 同时最多存在的敌方坦克数
ENEMY_TOTAL = 20      # 每关敌方坦克总数

# 子弹设置
BULLET_SIZE = 8
BULLET_SPEED = 6
FIRE_COOLDOWN = 30    # 射击冷却时间（帧数）

# 护盾设置
SHIELD_DURATION = 180  # 重生护盾持续时间（帧数，3秒）
