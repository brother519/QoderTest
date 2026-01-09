# 超级坦克大战

一个经典FC红白机风格的坦克大战游戏，使用纯HTML5 Canvas + JavaScript实现。

![游戏截图](https://img.shields.io/badge/Game-Tank%20Battle-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## 游戏简介

这是一款复刻经典FC游戏《坦克大战》的项目，采用纯前端技术栈开发，无需任何外部依赖。玩家需要控制坦克消灭所有敌人，同时保护基地不被摧毁。

## 游戏特性

- **经典玩法**: 忠实还原FC版坦克大战的核心玩法
- **像素风格**: 使用Canvas实现的复古像素画风
- **智能AI**: 敌方坦克具有随机移动和射击的AI逻辑
- **流畅体验**: 60FPS的游戏循环，固定时间步长更新
- **完整系统**: 包含关卡系统、分数统计、生命管理等完整功能

## 技术栈

- HTML5 Canvas - 游戏渲染
- 原生JavaScript (ES6+) - 游戏逻辑
- CSS3 - 界面样式
- LocalStorage - 最高分保存

## 项目结构

```
QoderTest/
├── index.html              # 游戏主页面
├── README.md               # 项目文档
├── styles/
│   └── style.css          # 页面样式
└── src/
    ├── main.js            # 游戏入口
    ├── core/              # 核心引擎
    │   ├── Game.js        # 游戏主循环控制器
    │   ├── Renderer.js    # Canvas渲染引擎
    │   ├── InputManager.js        # 键盘输入管理
    │   └── CollisionDetector.js   # 碰撞检测系统
    ├── entities/          # 游戏实体
    │   ├── Entity.js      # 实体基类
    │   ├── Tank.js        # 坦克基类
    │   ├── PlayerTank.js  # 玩家坦克
    │   ├── EnemyTank.js   # 敌方坦克
    │   ├── Bullet.js      # 子弹
    │   └── Base.js        # 基地
    ├── map/               # 地图系统
    │   ├── Map.js         # 地图管理器
    │   ├── Tile.js        # 地图块
    │   └── MapData.js     # 关卡数据
    ├── ai/                # AI系统
    │   └── EnemyAI.js     # 敌方AI逻辑
    ├── managers/          # 游戏管理器
    │   ├── GameStateManager.js    # 游戏状态管理
    │   ├── SpawnManager.js        # 敌人生成管理
    │   └── ScoreManager.js        # 分数管理
    ├── ui/                # 用户界面
    │   ├── HUD.js         # 游戏内UI
    │   └── MenuScreen.js  # 菜单界面
    └── utils/             # 工具函数
        ├── Constants.js   # 游戏常量
        └── Helpers.js     # 辅助函数
```

## 如何开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd QoderTest
```

### 2. 启动游戏

由于使用了ES6模块和Canvas，需要通过HTTP服务器运行：

**方法一：使用Python（推荐）**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**方法二：使用Node.js**
```bash
npx http-server -p 8000
```

**方法三：使用其他HTTP服务器**
- 使用VS Code的Live Server插件
- 使用Nginx或Apache

### 3. 打开浏览器

访问 `http://localhost:8000` 即可开始游戏。

## 游戏操作

| 按键 | 功能 |
|------|------|
| ↑ / W | 向上移动 |
| ↓ / S | 向下移动 |
| ← / A | 向左移动 |
| → / D | 向右移动 |
| 空格 | 射击 |
| Enter | 开始游戏/暂停/继续 |

## 游戏规则

### 目标
- 消灭每关的20个敌方坦克
- 保护基地（老鹰）不被摧毁

### 失败条件
- 基地被敌方子弹击中
- 玩家生命值耗尽（初始3条命）

### 胜利条件
- 消灭当前关卡的所有敌方坦克

### 地图元素

- **砖墙（棕色）**: 可被子弹摧毁，阻挡坦克和子弹
- **钢墙（灰色）**: 不可摧毁，阻挡坦克和子弹
- **水域（蓝色）**: 坦克无法通过，子弹可以飞越
- **草地（绿色）**: 可隐藏坦克，不阻挡移动和子弹

### 敌方坦克类型

- **普通坦克（灰色）**: 基础速度和生命值，100分
- **快速坦克（白色）**: 移动速度快，200分
- **装甲坦克（绿色）**: 需要多次击中，300分
- **奖励坦克（红色）**: 击毁后可获得500分

## 核心技术实现

### 游戏循环
- 使用 `requestAnimationFrame` 实现60FPS游戏循环
- 固定时间步长（Fixed Timestep）确保游戏逻辑稳定

### 碰撞检测
- AABB（轴对齐包围盒）算法
- 网格化空间划分优化性能
- 支持坦克、子弹、地图块的多层碰撞检测

### 渲染系统
- 禁用图像平滑实现像素风格
- 分层渲染：地图 → 实体 → 草地遮挡 → UI
- 使用整数坐标避免亚像素渲染

### AI系统
- 随机移动策略（每帧5%概率改变方向）
- 障碍物检测与随机转向
- 随机射击（1-3秒间隔）
- 卡住检测与脱困机制

### 状态管理
- 游戏状态机：菜单、游戏中、暂停、游戏结束、胜利
- 关卡进度管理
- 分数和最高分（LocalStorage持久化）

## 游戏配置

可以在 `src/utils/Constants.js` 中修改游戏参数：

```javascript
// 游戏难度相关
PLAYER_LIVES: 3,              // 玩家生命数
ENEMIES_PER_LEVEL: 20,        // 每关敌人数量
MAX_ENEMIES_ON_SCREEN: 4,     // 场上最多敌人数
ENEMY_SPAWN_COOLDOWN: 3000,   // 敌人生成冷却时间（毫秒）

// 坦克速度
TANK_SPEED: 2,                // 坦克移动速度
BULLET_SPEED: 4,              // 子弹速度
FIRE_COOLDOWN: 500,           // 射击冷却时间（毫秒）
```

## 开发说明

### 代码规范
- 使用ES6类和模块化设计
- 遵循单一职责原则
- 清晰的注释和文档

### 架构设计
- **实体-组件模式**: 所有游戏对象继承自Entity基类
- **状态机模式**: GameStateManager管理游戏状态
- **单例模式**: InputManager等全局管理器
- **对象池模式**: 可选的性能优化

### 扩展功能建议
- 添加音效和背景音乐
- 实现道具系统（加速、护盾、炸弹等）
- 支持双人对战模式
- 添加更多关卡和地图编辑器
- 实现网络对战功能

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

建议使用最新版本的现代浏览器以获得最佳体验。

## 已知问题

- 暂无

## 更新日志

### v1.0.0 (2026-01-09)
- 完成游戏核心功能
- 实现经典坦克大战玩法
- 支持关卡系统和分数统计
- 完整的游戏状态管理
- 敌方AI系统

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 致谢

感谢经典FC游戏《坦克大战》带来的童年回忆。

---

**享受游戏！Good luck and have fun!** 🎮