# 跳一跳游戏

一个使用 HTML5 Canvas + JavaScript 实现的简约2D版跳一跳游戏。

## 游戏截图

按住屏幕蓄力，松开跳跃，挑战你的最高分！

## 功能特性

- **蓄力跳跃**: 按住屏幕蓄力，松开跳跃，蓄力越久跳得越远
- **物理系统**: 45度抛物线跳跃轨迹，真实重力模拟
- **碰撞检测**: AABB 碰撞检测，准确判断落地
- **动态难度**: 平台随机生成，难度随分数递增
- **分数系统**: 普通落点+1分，Perfect落点+3分+连击奖励
- **摄像机跟随**: 平滑跟随玩家移动
- **视觉效果**: 蓄力动画、进度条、Perfect特效、渐变阴影
- **数据持久化**: 最高分保存到 localStorage

## 项目结构

```
├── index.html              # 游戏主入口
├── styles/
│   └── main.css            # 样式文件
└── src/
    ├── main.js             # 启动入口
    ├── Game.js             # 游戏主控制器
    ├── GameLoop.js         # 游戏循环引擎
    ├── renderer/
    │   ├── Renderer.js     # 渲染引擎
    │   └── Camera.js       # 摄像机控制
    ├── entities/
    │   ├── Player.js       # 玩家角色
    │   └── Platform.js     # 平台方块
    ├── physics/
    │   ├── PhysicsEngine.js # 物理引擎
    │   └── Vector2D.js      # 二维向量工具
    ├── input/
    │   └── InputManager.js  # 输入处理
    ├── game/
    │   ├── PlatformGenerator.js # 平台生成器
    │   └── ScoreManager.js      # 分数管理
    └── utils/
        └── Config.js        # 游戏配置常量
```

## 运行方式

由于使用 ES 模块，需要通过本地服务器运行：

```bash
# 方式1: Python
python -m http.server 8080

# 方式2: Node.js
npx serve .

# 方式3: 使用 VS Code Live Server 扩展
```

然后在浏览器中访问 `http://localhost:8080`

## 操作说明

| 操作 | 说明 |
|------|------|
| 点击屏幕 | 开始游戏 |
| 按住鼠标/触摸 | 蓄力 |
| 松开 | 跳跃 |
| 游戏结束后点击 | 重新开始 |

## 技术栈

- HTML5 Canvas 2D
- 原生 JavaScript (ES6+)
- ES Modules

## 游戏参数

可在 `src/utils/Config.js` 中调整：

- 重力加速度: 2000 px/s²
- 跳跃力度范围: 400 - 1200 px/s
- 蓄力时间范围: 0.1s - 2.0s
- 平台距离范围: 120 - 280 px
- 难度递增间隔: 每5次成功跳跃