# 坦克大战

一个基于 Python + Pygame 的经典坦克大战游戏。

## 功能特性

- 单人模式：玩家对抗 AI 敌人
- WASD 移动，空格射击
- 障碍物系统：砖墙（可摧毁）和钢墙（不可摧毁）
- 敌人 AI：巡逻和追击模式
- 完整的游戏流程：菜单、游戏、暂停、胜利/失败

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行游戏

```bash
python main.py
```

## 操作说明

- **WASD**: 移动坦克
- **空格**: 射击
- **P**: 暂停/继续
- **R**: 重新开始（游戏结束后）
- **ESC**: 退出游戏
- **ENTER**: 开始游戏（主菜单）

## 游戏规则

- 消灭所有敌人坦克即可获胜
- 玩家有 3 条生命
- 生命耗尽则游戏失败
- 砖墙可以被子弹摧毁，钢墙不可摧毁

## 项目结构

```
QoderTest/
├── README.md          # 项目说明
├── requirements.txt   # 依赖包
├── config.py         # 游戏配置
├── main.py           # 游戏入口
└── src/
    ├── game.py       # 游戏主控制器
    ├── tank.py       # 坦克类
    ├── bullet.py     # 子弹类
    ├── obstacle.py   # 障碍物类
    ├── constants.py  # 常量定义
    └── utils.py      # 工具函数
```
