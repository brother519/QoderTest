#!/usr/bin/env python3
"""
贪吃蛇游戏 - 终端版本
使用方向键控制蛇的移动，吃到食物后蛇会变长，撞到墙壁或自己则游戏结束
"""

import curses
import random
import time
from collections import deque

class SnakeGame:
    def __init__(self, width=40, height=20):
        self.width = width
        self.height = height
        self.snake = deque([(height // 2, width // 2)])
        self.direction = (0, 1)  # 初始方向向右 (行, 列)
        self.food = self.generate_food()
        self.score = 0
        self.game_over = False
        
    def generate_food(self):
        """生成食物位置"""
        while True:
            food = (random.randint(1, self.height - 2), 
                   random.randint(1, self.width - 2))
            if food not in self.snake:
                return food
    
    def change_direction(self, new_direction):
        """改变蛇的移动方向（不能反向移动）"""
        if (new_direction[0] * -1, new_direction[1] * -1) != self.direction:
            self.direction = new_direction
    
    def move(self):
        """移动蛇"""
        if self.game_over:
            return
        
        # 计算新的头部位置
        head = self.snake[0]
        new_head = (head[0] + self.direction[0], head[1] + self.direction[1])
        
        # 检查是否撞墙
        if (new_head[0] <= 0 or new_head[0] >= self.height - 1 or
            new_head[1] <= 0 or new_head[1] >= self.width - 1):
            self.game_over = True
            return
        
        # 检查是否撞到自己
        if new_head in self.snake:
            self.game_over = True
            return
        
        # 添加新头部
        self.snake.appendleft(new_head)
        
        # 检查是否吃到食物
        if new_head == self.food:
            self.score += 10
            self.food = self.generate_food()
        else:
            # 没吃到食物，移除尾部
            self.snake.pop()
    
    def draw(self, stdscr):
        """绘制游戏画面"""
        stdscr.clear()
        
        # 绘制边框
        for i in range(self.height):
            for j in range(self.width):
                if i == 0 or i == self.height - 1 or j == 0 or j == self.width - 1:
                    stdscr.addstr(i, j, '#')
        
        # 绘制蛇
        for idx, segment in enumerate(self.snake):
            if idx == 0:
                stdscr.addstr(segment[0], segment[1], '@')  # 蛇头
            else:
                stdscr.addstr(segment[0], segment[1], 'o')  # 蛇身
        
        # 绘制食物
        stdscr.addstr(self.food[0], self.food[1], '*')
        
        # 显示分数
        score_text = f"Score: {self.score}"
        stdscr.addstr(self.height + 1, 0, score_text)
        
        # 显示操作提示
        help_text = "Use Arrow Keys to move | Q to quit"
        stdscr.addstr(self.height + 2, 0, help_text)
        
        # 游戏结束提示
        if self.game_over:
            game_over_text = "GAME OVER! Press R to restart or Q to quit"
            stdscr.addstr(self.height // 2, (self.width - len(game_over_text)) // 2, 
                         game_over_text, curses.A_BOLD)
        
        stdscr.refresh()


def main(stdscr):
    """主游戏循环"""
    # 设置curses
    curses.curs_set(0)  # 隐藏光标
    stdscr.nodelay(1)   # 非阻塞输入
    stdscr.timeout(100) # 设置超时时间（毫秒）
    
    game = SnakeGame()
    
    # 方向键映射
    key_direction = {
        curses.KEY_UP: (-1, 0),
        curses.KEY_DOWN: (1, 0),
        curses.KEY_LEFT: (0, -1),
        curses.KEY_RIGHT: (0, 1)
    }
    
    while True:
        game.draw(stdscr)
        
        # 获取用户输入
        key = stdscr.getch()
        
        if key == ord('q') or key == ord('Q'):
            break
        
        if game.game_over:
            if key == ord('r') or key == ord('R'):
                game = SnakeGame()  # 重新开始游戏
            continue
        
        if key in key_direction:
            game.change_direction(key_direction[key])
        
        game.move()
        time.sleep(0.05)  # 控制游戏速度


if __name__ == "__main__":
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        print("\n游戏已退出")
