# 超级坦克大战 (Super Tank Battle)

基于 HTML5 Canvas 和原生 JavaScript 实现的经典坦克大战游戏。

## 游戏特性

- 单人模式：玩家对战 AI 敌人
- 3 个精心设计的关卡，难度递增
- 多种敌人类型：普通坦克、快速坦克、装甲坦克
- 可破坏的砖墙和不可破坏的钢墙
- 水域障碍和草丛掩护
- 玩家基地保护机制
- 复活无敌时间
- 智能敌人 AI

## 操作方式

| 操作 | 按键 |
|------|------|
| 上移 | W / ↑ |
| 下移 | S / ↓ |
| 左移 | A / ← |
| 右移 | D / → |
| 射击 | 空格键 / 鼠标左键 |
| 暂停 | P |

## 项目结构

```
QoderTest/
├── index.html              # 游戏入口页面
├── css/
│   └── style.css           # 游戏样式
└── js/
    ├── main.js             # 程序入口
    ├── core/
    │   ├── Game.js         # 游戏主控制器
    │   ├── InputHandler.js # 输入处理
    │   ├── Renderer.js     # 渲染引擎
    │   └── CollisionDetector.js # 碰撞检测
    ├── entities/
    │   ├── Tank.js         # 坦克基类
    │   ├── PlayerTank.js   # 玩家坦克
    │   ├── EnemyTank.js    # 敌人坦克
    │   ├── Bullet.js       # 子弹
    │   └── Base.js         # 玩家基地
    ├── map/
    │   ├── Tile.js         # 地图瓦片
    │   └── Map.js          # 地图管理
    ├── levels/
    │   ├── levelData.js    # 关卡数据
    │   └── LevelManager.js # 关卡管理
    ├── ai/
    │   └── AIController.js # 敌人AI控制
    └── utils/
        └── Constants.js    # 游戏常量
```

## 运行方式

由于使用了 ES6 模块，需要通过 HTTP 服务器运行：

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8080`

## 游戏目标

- 消灭所有敌人坦克
- 保护位于地图底部的基地
- 通过全部 3 个关卡即可获胜

## 技术实现

- HTML5 Canvas 2D 渲染
- ES6 模块化架构
- 面向对象设计
- requestAnimationFrame 游戏循环
- AABB 碰撞检测
- 有限状态机管理游戏状态