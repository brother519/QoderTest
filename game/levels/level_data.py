"""
关卡数据定义
"""
from game.config import WallType, GRID_SIZE


def get_level_1():
    """
    获取第一关数据
    
    Returns:
        关卡数据字典
    """
    level_data = {
        "level": 1,
        "player_spawn": {
            "x": 12 * GRID_SIZE,
            "y": 24 * GRID_SIZE
        },
        "enemy_spawns": [
            {"x": 0 * GRID_SIZE, "y": 0 * GRID_SIZE},
            {"x": 12 * GRID_SIZE, "y": 0 * GRID_SIZE},
            {"x": 24 * GRID_SIZE, "y": 0 * GRID_SIZE}
        ],
        "base": {
            "x": 12 * GRID_SIZE,
            "y": 25 * GRID_SIZE
        },
        "walls": [
            # 地图边框
            # 顶部边框
            *[{"x": i * GRID_SIZE, "y": 0, "type": WallType.STEEL} for i in range(26)],
            # 底部边框
            *[{"x": i * GRID_SIZE, "y": 25 * GRID_SIZE, "type": WallType.STEEL} for i in range(26) if i not in [11, 12, 13, 14]],
            # 左侧边框
            *[{"x": 0, "y": i * GRID_SIZE, "type": WallType.STEEL} for i in range(1, 25)],
            # 右侧边框
            *[{"x": 25 * GRID_SIZE, "y": i * GRID_SIZE, "type": WallType.STEEL} for i in range(1, 25)],
            
            # 基地周围的保护墙（砖墙）
            {"x": 11 * GRID_SIZE, "y": 24 * GRID_SIZE, "type": WallType.BRICK},
            {"x": 11 * GRID_SIZE, "y": 25 * GRID_SIZE, "type": WallType.BRICK},
            {"x": 14 * GRID_SIZE, "y": 24 * GRID_SIZE, "type": WallType.BRICK},
            {"x": 14 * GRID_SIZE, "y": 25 * GRID_SIZE, "type": WallType.BRICK},
            {"x": 12 * GRID_SIZE, "y": 24 * GRID_SIZE, "type": WallType.BRICK},
            {"x": 13 * GRID_SIZE, "y": 24 * GRID_SIZE, "type": WallType.BRICK},
            
            # 地图中的一些障碍物
            # 左上区域
            *[{"x": i * GRID_SIZE, "y": 5 * GRID_SIZE, "type": WallType.BRICK} for i in range(3, 7)],
            *[{"x": 5 * GRID_SIZE, "y": i * GRID_SIZE, "type": WallType.BRICK} for i in range(3, 8)],
            
            # 右上区域
            *[{"x": i * GRID_SIZE, "y": 5 * GRID_SIZE, "type": WallType.BRICK} for i in range(20, 23)],
            *[{"x": 20 * GRID_SIZE, "y": i * GRID_SIZE, "type": WallType.BRICK} for i in range(3, 8)],
            
            # 中央区域（钢墙）
            *[{"x": i * GRID_SIZE, "y": 12 * GRID_SIZE, "type": WallType.STEEL} for i in range(10, 16)],
            *[{"x": 12 * GRID_SIZE, "y": i * GRID_SIZE, "type": WallType.STEEL} for i in range(10, 15)],
            
            # 水域
            *[{"x": i * GRID_SIZE, "y": 18 * GRID_SIZE, "type": WallType.WATER} for i in range(5, 10)],
            *[{"x": i * GRID_SIZE, "y": 18 * GRID_SIZE, "type": WallType.WATER} for i in range(17, 21)],
        ],
        "enemy_total": 20,
        "enemy_max_active": 4
    }
    
    return level_data
