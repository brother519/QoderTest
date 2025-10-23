# 坦克大战 (Battle City)

一个基于HTML5 Canvas的经典坦克大战网页游戏，使用原生JavaScript (ES6+)开发。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecmascript.org/)
[![Canvas](https://img.shields.io/badge/HTML5-Canvas-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🎮 游戏演示

```bash
# 快速启动
./start.sh
```

游戏在浏览器中运行，支持单人和双人模式！

## 功能特性

- ✅ 单人模式和双人模式
- ✅ 经典的坦克大战玩法
- ✅ 多种地图元素（砖墙、钢墙、河流、草地等）
- ✅ 敌方坦克AI系统
- ✅ 道具系统（护盾、时钟、炸弹、铁锹、生命、星星）
- ✅ 碰撞检测系统
- ✅ 关卡系统
- ✅ 得分系统
- ✅ 完整音效系统（射击、爆炸、道具等）
- ✅ 静音控制

## 技术栈

- 原生 JavaScript (ES6+)
- HTML5 Canvas
- CSS3

## 项目结构

```
QoderTest/
├── index.html          # 主HTML文件
├── style.css           # 样式文件
├── src/
│   ├── main.js         # 游戏入口
│   ├── config.js       # 游戏配置
│   ├── GameEngine.js   # 游戏引擎核心
│   ├── core/           # 核心系统
│   │   ├── InputController.js   # 输入控制器
│   │   ├── Renderer.js          # 渲染引擎
│   │   ├── SceneManager.js      # 场景管理器
│   │   └── PhysicsEngine.js     # 物理引擎
│   ├── scenes/         # 场景
│   │   ├── Scene.js            # 场景基类
│   │   ├── MenuScene.js        # 菜单场景
│   │   └── GameScene.js        # 游戏场景
│   ├── entities/       # 游戏实体
│   │   ├── Tank.js             # 坦克
│   │   ├── Bullet.js           # 子弹
│   │   └── Base.js             # 基地
│   └── game/           # 游戏逻辑
│       ├── Map.js              # 地图系统
│       ├── EnemyManager.js     # 敌人管理器
│       └── PowerUpManager.js   # 道具管理器
└── README.md
```

## 如何运行

### 方法1: 使用开发服务器（推荐）

如果安装了Node.js和npm:

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方法2: 使用Python HTTP服务器

```bash
# Python 3
python3 -m http.server 8080

# 或 Python 2
python -m SimpleHTTPServer 8080
```

然后在浏览器中访问: http://localhost:8080

### 方法3: 直接使用浏览器（需支持ES6模块）

某些浏览器可以直接打开 `index.html` 文件运行，但由于使用了ES6模块，建议使用上述方法。

## 游戏操作

### 单人模式
- **移动**: W/A/S/D 或 方向键
- **射击**: J 或 空格
- **暂停**: P 或 ESC

### 双人模式
- **玩家1**: WASD移动, J射击
- **玩家2**: 方向键移动, 1射击
- **暂停**: P 或 ESC

## 游戏元素

### 坦克类型
- **玩家坦克**: 黄色（玩家1）、绿色（玩家2）
- **敌方坦克**: 红色，包括普通、快速、重型、装甲等类型

### 地图元素
- **砖墙**: 棕色，可被子弹摧毁
- **钢墙**: 灰色，无法摧毁
- **河流**: 蓝色，坦克无法通过
- **草地**: 绿色，可通行但遮挡视线
- **基地**: 金色，需要保护

### 道具效果
- **盔（绿色）**: 临时无敌10秒
- **钟（青色）**: 冻结所有敌人8秒
- **弹（红色）**: 消灭屏幕上所有敌人
- **铲（橙色）**: 基地周围变钢墙15秒
- **命（黄色）**: 增加一条生命
- **星（紫色）**: 提升坦克等级

## 游戏规则

### 胜利条件
- 消灭所有敌方坦克（每关20辆）
- 保护基地不被摧毁

### 失败条件
- 基地被敌方子弹摧毁
- 玩家生命耗尽（双人模式需两位玩家都阵亡）

### 得分系统
- 普通坦克: 100分
- 快速坦克: 200分
- 重型坦克: 300分
- 装甲坦克: 400分
- 道具坦克: 500分
- 完成关卡: 1000分

## 开发说明

### 核心架构
游戏采用模块化设计，主要包含以下系统：

1. **游戏引擎核心**: 管理游戏主循环和时间控制
2. **场景管理器**: 控制不同场景的切换
3. **渲染引擎**: 负责Canvas绘制
4. **输入控制器**: 处理键盘输入
5. **物理引擎**: 处理碰撞检测
6. **实体系统**: 管理游戏对象
7. **AI系统**: 控制敌方坦克行为

### 性能优化
- 固定时间步长更新保证游戏稳定性
- AABB碰撞检测算法
- 对象池管理频繁创建的对象
- 简化的精灵渲染

## 未来改进

- [ ] 使用精灵图资源替代程序化绘制
- [ ] 更多预设关卡地图
- [ ] 更复杂的AI行为
- [ ] 本地存储高分记录
- [ ] 触摸屏控制支持
- [ ] 关卡编辑器

## 许可证

MIT License

## 贡献

欢迎提交问题和改进建议！
