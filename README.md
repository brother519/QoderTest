# 飞机大战游戏

一个使用 Phaser 3 和 TypeScript 开发的 2D 飞机射击游戏。

## 游戏特性

- 经典的飞机射击玩法
- 多种敌机类型（基础、快速、BOSS）
- 道具系统（生命恢复、武器升级）
- 关卡系统（难度递增）
- 分数和排行榜系统
- 音效和视觉效果
- 响应式UI界面

## 技术栈

- **游戏引擎**: Phaser 3
- **编程语言**: TypeScript
- **构建工具**: Vite
- **物理引擎**: Phaser Arcade Physics

## 项目结构

```
src/
├── main.ts                 # 游戏入口
├── config.ts              # Phaser配置
├── scenes/                # 游戏场景
│   ├── PreloadScene.ts    # 资源预加载
│   ├── MenuScene.ts       # 主菜单
│   ├── GameScene.ts       # 游戏主场景
│   ├── PauseScene.ts      # 暂停界面
│   └── GameOverScene.ts   # 游戏结束
├── objects/               # 游戏对象
│   ├── Player.ts          # 玩家飞机
│   ├── enemies/           # 敌机类
│   ├── weapons/           # 武器系统
│   ├── powerups/          # 道具系统
│   └── effects/           # 视觉效果
├── managers/              # 管理器
│   ├── EnemySpawner.ts    # 敌机生成
│   ├── ScoreManager.ts    # 分数管理
│   ├── LevelManager.ts    # 关卡管理
│   └── AudioManager.ts    # 音频管理
├── ui/                    # UI组件
│   ├── HUD.ts             # 游戏内UI
│   ├── Button.ts          # 按钮组件
│   └── Leaderboard.ts     # 排行榜
├── utils/                 # 工具函数
│   ├── Constants.ts       # 常量定义
│   ├── Types.ts           # 类型定义
│   └── Helpers.ts         # 辅助函数
└── data/                  # 游戏数据
    └── GameData.ts        # 关卡和配置数据
```

## 游戏玩法

### 控制方式
- **移动**: WASD 或 方向键
- **射击**: 空格键
- **暂停**: ESC 键

### 游戏机制
- 击毁敌机获得分数
- 收集绿色心形道具恢复生命值
- 收集金色星形道具升级武器
- 每1000分升一级，敌机生成速度和移动速度增加
- 玩家初始3点生命值，被敌机碰撞或被子弹击中会损失生命值

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中访问 `http://localhost:3000`

## 构建

构建生产版本：
```bash
npm run build
```

## 已实现功能

- [x] 玩家飞机移动和射击
- [x] 多种敌机类型
- [x] 碰撞检测系统
- [x] 道具系统
- [x] 分数和排行榜
- [x] 关卡系统
- [x] 音效和视觉效果
- [x] 完整的UI界面
- [x] 暂停和游戏结束逻辑

## 资源文件

游戏使用以下类型的资源文件：
- SVG格式的矢量图像（位于 `public/assets/images/`）
- 音频文件（位于 `public/assets/audio/`，当前为占位符）

## 扩展建议

未来可以添加的功能：
- 更多敌机类型和BOSS战
- 粒子效果系统
- 更丰富的音效
- 移动端触屏支持
- 存档系统
- 成就系统