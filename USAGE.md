# 游戏中心 - 使用说明

## 项目简介

本项目是一个基于 **Next.js 14 (App Router)** 构建的浏览器游戏中心，包含 **15 款经典休闲小游戏**。所有游戏均使用 TypeScript 开发，Tailwind CSS 负责样式，游戏逻辑封装在客户端 React Hook 中，即开即玩、无需后端。

项目采用统一的**游戏注册表模式**（`lib/registry.ts`），添加新游戏只需创建游戏目录并在注册表中注册，首页会自动渲染对应的游戏卡片。

---

## 环境要求

| 依赖       | 版本要求               |
| ---------- | ---------------------- |
| Node.js    | >= 18（推荐 v24）      |
| npm        | >= 9                   |
| 操作系统   | macOS / Linux / Windows|

---

## 安装步骤

```bash
# 1. 克隆项目
git clone <仓库地址>
cd QoderTest

# 2. 安装依赖
npm install
```

---

## 启动开发服务器

```bash
npm run dev
```

启动后在浏览器中访问 [http://localhost:3000](http://localhost:3000) 即可进入游戏中心首页。

---

## 可用游戏列表

游戏中心目前包含以下 15 款游戏，点击首页对应卡片即可进入：

| #  | 游戏名称     | 路由路径          | 标签                 | 简要说明                                                                 |
| -- | ------------ | ----------------- | -------------------- | ------------------------------------------------------------------------ |
| 1  | 连连看       | `/link-match`     | 益智、消除           | 找出相同图案并用最少转弯路径连接它们，考验观察力和空间思维               |
| 2  | 贪吃蛇       | `/snake`          | 动作、经典           | 控制蛇吃食物不断变长，避开墙壁和自身                                     |
| 3  | 俄罗斯方块   | `/tetris`         | 策略、经典           | 旋转并放置下落的方块，填满整行进行消除得分                               |
| 4  | 坦克大战     | `/tank-battle`    | 射击、经典           | 操控坦克消灭敌军，保护基地，收集道具增强实力                             |
| 5  | 打地鼠       | `/whack-a-mole`   | 反应、休闲           | 快速点击从洞中钻出的地鼠，躲避炸弹，连击获得额外奖励                     |
| 6  | 扫雷         | `/minesweeper`    | 益智、经典           | 利用数字线索标记地雷，在最短时间内清空全部安全格子                       |
| 7  | 大富翁       | `/monopoly`       | 策略、多人、经典     | 经典棋盘游戏，买地产、收租金、建房子，支持 2-4 人本地对战               |
| 8  | 飞机大战     | `/aircraft-battle`| 射击、经典           | 经典纵版射击游戏，驾驶战机消灭敌军，收集道具升级武器                     |
| 9  | 消消乐       | `/match-three`    | 益智、消除、休闲     | 交换相邻宝石，三个连线即可消除，触发连锁反应获得高分                     |
| 10 | 2048         | `/puzzle-2048`    | 益智、数字           | 使用方向键合并相同数字，最终合成 2048                                    |
| 11 | 华容道       | `/klotski`        | 益智、策略、三国     | 滑动方块帮助曹操突围，步数越少越厉害                                     |
| 12 | 汉诺塔       | `/hanoi`          | 益智、经典、数学     | 将所有圆盘从一根柱子移动到另一根，大圆盘不能放在小圆盘上                 |
| 13 | 推箱子       | `/sokoban`        | 益智、策略           | 把箱子推到目标位置即可过关，含 12 个精心设计的关卡                       |
| 14 | 点灯游戏     | `/lights-out`     | 益智、逻辑           | 点击格子切换自身及相邻格子的灯光状态，目标是全部熄灭，含 10 个关卡       |
| 15 | 数独         | `/sudoku`         | 益智、逻辑、数字     | 在 9x9 网格中填入 1-9，使每行、每列和每个 3x3 宫格包含全部数字          |

---

## 构建和测试命令

| 命令                   | 说明                                       |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | 启动开发服务器（热更新）                   |
| `npm run build`        | 构建生产版本                               |
| `npm run start`        | 启动生产服务器（需先执行 build）           |
| `npm run lint`         | 运行 ESLint 代码检查（quiet 模式）         |
| `npm test`             | 运行 Jest 测试                             |
| `npm run test:watch`   | 以监听模式运行测试（文件变更自动重跑）     |
| `npm run test:coverage`| 运行测试并生成覆盖率报告                   |

> 测试覆盖率阈值要求：Lines / Functions / Statements >= 80%，Branches >= 70%。

---

## 项目结构概览

```
QoderTest/
├── app/                          # Next.js App Router 页面
│   ├── page.tsx                  # 首页 - 游戏中心入口
│   ├── layout.tsx                # 全局布局
│   ├── globals.css               # 全局样式
│   │
│   ├── link-match/               # 连连看
│   ├── snake/                    # 贪吃蛇
│   ├── tetris/                   # 俄罗斯方块
│   ├── tank-battle/              # 坦克大战
│   ├── whack-a-mole/             # 打地鼠
│   ├── minesweeper/              # 扫雷
│   ├── monopoly/                 # 大富翁
│   ├── aircraft-battle/          # 飞机大战
│   ├── match-three/              # 消消乐
│   ├── puzzle-2048/              # 2048
│   ├── klotski/                  # 华容道
│   ├── hanoi/                    # 汉诺塔
│   ├── sokoban/                  # 推箱子
│   ├── lights-out/               # 点灯游戏
│   └── sudoku/                   # 数独
│
├── lib/                          # 共享库
│   ├── registry.ts               # 游戏注册表（所有游戏元数据集中注册）
│   ├── types/
│   │   ├── game.ts               # 基础游戏类型（GameStatus, Position 等）
│   │   └── registry.ts           # GameMeta 接口定义
│   ├── components/
│   │   ├── GameLayout.tsx        # 统一游戏页面布局（含返回首页导航）
│   │   ├── GameOverlay.tsx       # 通用遮罩层（暂停 / 结束等状态）
│   │   ├── GamePageHeader.tsx    # 游戏页面标题组件
│   │   └── ControlHints.tsx      # 键盘操作提示组件
│   ├── hooks/
│   │   ├── useHighScore.ts       # 高分管理（localStorage 持久化）
│   │   ├── useKeyboard.ts        # 通用键盘输入处理
│   │   ├── useGameFrame.ts       # 基于 requestAnimationFrame 的游戏循环
│   │   └── useIntervalLoop.ts    # 基于 setInterval 的定时器循环
│   └── utils/
│       ├── format.ts             # 格式化工具（如时间格式化）
│       └── collision.ts          # 碰撞检测工具（AABB 矩形碰撞）
│
├── agents.md                     # AI 代理协作指南
├── agents.local.md               # 本地开发环境备注
├── package.json                  # 项目依赖和脚本配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind CSS 配置
└── next.config.js                # Next.js 配置
```

### 单个游戏模块的标准结构

每个游戏位于 `app/<game-id>/` 目录下，遵循统一的文件组织：

```
app/<game-id>/
├── meta.ts              # 游戏元数据（名称、描述、图标、标签等）
├── page.tsx             # 路由页面组件（'use client'）
├── types/game.ts        # 游戏专属类型定义
├── constants/config.ts  # 游戏常量（棋盘尺寸、速度等）
├── hooks/use<Game>.ts   # 核心游戏逻辑 Hook
└── components/          # 游戏 UI 组件（画布、控制面板等）
```

---

## 如何添加新游戏

1. 在 `app/` 下创建新游戏目录，如 `app/my-game/`，按照上述标准结构编写代码
2. 创建 `app/my-game/meta.ts`，导出符合 `GameMeta` 接口的元数据对象
3. 在 `lib/registry.ts` 中导入该元数据并添加到 `GAME_REGISTRY` 数组
4. 启动开发服务器，首页将自动显示新游戏卡片

---

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React + Emoji
- **测试**: Jest 30 + Testing Library
- **代码规范**: ESLint + Prettier
