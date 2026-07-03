# QoderTest 功能说明

> 基于 Next.js 14 App Router 构建的浏览器在线游戏中心，开箱即玩，无需安装。

## 一、项目概述

**QoderTest（游戏中心）** 是一个纯前端、客户端渲染的休闲游戏合集。它通过统一的"游戏注册表 + 标准模块结构"支持零配置扩展新游戏，并使用 localStorage 实现高分、关卡进度等本地持久化，界面采用暗色主题、渐变卡片与霓虹边框的视觉风格。

- **入口页面**：`app/page.tsx` —— 首页读取 `GAME_REGISTRY` 后自动渲染游戏卡片网格
- **游戏总数**：**31 款**（PRODUCT.md 中记载为 15 款，实际注册表已扩展至 31 款）
- **交互方式**：桌面端键盘/鼠标为主，部分游戏支持触屏

## 二、技术栈

| 层面 | 选型 |
|---|---|
| 框架 | Next.js 14.1.0（App Router） |
| 语言 | TypeScript 5，strict 模式 |
| UI | React 18 + Tailwind CSS 3 |
| 样式辅助 | class-variance-authority、clsx、tailwind-merge |
| 图标 | lucide-react |
| 渲染 | 客户端渲染（`'use client'`）+ Canvas API |
| 测试 | Jest 30 + ts-jest + Testing Library + jest-environment-jsdom |
| 代码规范 | ESLint（flat config）+ Prettier + typescript-eslint |
| 路径别名 | `@/*` → 项目根 |

## 三、核心架构

### 1. 游戏注册表模式（Registry Pattern）

所有游戏元数据集中在 `lib/registry.ts` 的 `GAME_REGISTRY: GameMeta[]` 数组中，首页读取并渲染。新增游戏只需三步：

1. 在 `app/<game-id>/meta.ts` 中导出 `GameMeta`
2. 在 `lib/registry.ts` 中导入并加入数组
3. 在 `app/<game-id>/page.tsx` 中实现路由

`GameMeta.id` 与路由路径完全一致（如 `id: 'snake'` → `/snake`），数组顺序决定首页展示顺序。

### 2. 标准游戏模块结构

```
app/<game-id>/
    meta.ts                # GameMeta 注册信息
    page.tsx               # 'use client' 路由页
    types/game.ts          # 专属类型
    constants/config.ts    # 棋盘/速度/分数等常量
    hooks/use<Game>.ts     # 核心逻辑 Hook
    components/            # 专属 UI
    utils/                 # （可选）纯函数
```

页面只负责渲染与事件转发，游戏核心状态、输入处理与游戏循环全部封装在 `use<GameName>Game` Hook 中。

### 3. 两种游戏循环策略

| 策略 | Hook | 适用场景 |
|---|---|---|
| `setInterval` | `useIntervalLoop` | 回合制、格子类游戏（贪吃蛇、俄罗斯方块、打地鼠等） |
| `requestAnimationFrame` | `useGameFrame`（归一化 dt） | 实时动作类（坦克大战、飞机大战） |

### 4. Ref 同步 & 纯函数分离

- 所有共享 Hook 与游戏 Hook 通过 `useRef` 保存最新 callback/状态，避免定时器与 RAF 回调的闭包陷阱
- 复杂棋盘规则拆分到 `utils/boardLogic.ts` 等纯函数模块，便于单元测试

### 5. localStorage 持久化

高分、扫雷最佳时间（按难度）、华容道/推箱子/点灯/汉诺塔关卡进度、扫雷胜率统计等均写入 localStorage，所有 IO 均包裹 try-catch 优雅降级。

## 四、共享库（`lib/`）

| 模块 | 位置 | 功能 |
|---|---|---|
| `useHighScore(key)` | `lib/hooks/useHighScore.ts` | localStorage 高分持久化 |
| `useKeyboard(keyMap, handlers)` | `lib/hooks/useKeyboard.ts` | 通用键盘映射，ref 防重绑 |
| `useIntervalLoop(cb, ms)` | `lib/hooks/useIntervalLoop.ts` | setInterval 循环（Dan Abramov 模式） |
| `useGameFrame(cb)` | `lib/hooks/useGameFrame.ts` | RAF 循环，dt 归一化（1.0 ≈ 60fps 一帧） |
| `formatTime(sec)` | `lib/utils/format.ts` | 秒 → `MM:SS` |
| `rectOverlap(a, b)` | `lib/utils/collision.ts` | AABB 矩形碰撞检测 |
| `GameLayout` | `lib/components/GameLayout.tsx` | 统一外壳：返回链接 + 标题 |
| `GameOverlay` | `lib/components/GameOverlay.tsx` | 暂停/结束半透明遮罩 |
| `GamePageHeader` | `lib/components/GamePageHeader.tsx` | 标题/图标/副标题 |
| `ControlHints` | `lib/components/ControlHints.tsx` | 快捷键提示 |

## 五、游戏清单（31 款）

| # | 路由 | 名称 | 类型 |
|---|---|---|---|
| 1  | `/link-match`      | 连连看        | 益智消除 |
| 2  | `/snake`           | 贪吃蛇        | 动作经典 |
| 3  | `/tetris`          | 俄罗斯方块    | 策略经典 |
| 4  | `/tank-battle`     | 坦克大战      | 射击经典 |
| 5  | `/whack-a-mole`    | 打地鼠        | 反应休闲 |
| 6  | `/minesweeper`     | 扫雷          | 益智经典 |
| 7  | `/monopoly`        | 大富翁        | 策略多人 |
| 8  | `/aircraft-battle` | 飞机大战      | 射击经典 |
| 9  | `/match-three`     | 消消乐        | 益智消除 |
| 10 | `/puzzle-2048`     | 2048          | 益智数字 |
| 11 | `/klotski`         | 华容道        | 益智策略 |
| 12 | `/hanoi`           | 汉诺塔        | 益智数学 |
| 13 | `/sokoban`         | 推箱子        | 益智策略 |
| 14 | `/lights-out`      | 点灯游戏      | 益智逻辑 |
| 15 | `/sudoku`          | 数独          | 益智逻辑 |
| 16 | `/tic-tac-toe`     | 井字棋        | 益智对弈 |
| 17 | `/sliding-puzzle`  | 滑块拼图      | 益智 |
| 18 | `/color-sort`      | 颜色分类      | 益智 |
| 19 | `/memory-card`     | 记忆翻牌      | 益智 |
| 20 | `/nonogram`        | 像素涂色      | 益智 |
| 21 | `/pipe-puzzle`     | 管道连接      | 益智 |
| 22 | `/guess-number`    | 猜数字        | 益智 |
| 23 | `/gomoku`          | 五子棋        | 策略对弈 |
| 24 | `/one-stroke`      | 一笔画        | 益智 |
| 25 | `/rubiks-cube`     | 魔方          | 益智 |
| 26 | `/maze`            | 迷宫          | 益智 |
| 27 | `/flow-free`       | 流量管道      | 益智 |
| 28 | `/hanzi-wordle`    | 汉字 Wordle   | 益智 |
| 29 | `/hanzi-riddle`    | 汉字谜语      | 益智 |
| 30 | `/tangram`         | 七巧板        | 益智 |
| 31 | `/reversi`         | 黑白棋        | 策略对弈 |

## 六、`my-test-plugin` 目录

独立的 **Qoder CLI 插件脚手架**，与游戏应用本身无关，用于演示 5 种插件扩展点：

```
my-test-plugin/
    .mcp.json                          # MCP 服务器配置（占位 URL）
    agents/docs-researcher.md          # 子代理定义
    commands/hello.md                  # Slash 命令 /my-test-plugin:hello
    hooks/hooks.json                   # SessionStart 钩子
    output-styles/concise.md           # 输出风格
    skills/demo-helper/SKILL.md        # 技能定义
```

不参与 Next.js 应用构建，仅用作 Qoder 插件开发示例。

## 七、脚本与配置

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（默认端口 3000） |
| `npm run build` | 生产构建 |
| `npm run lint` | `eslint . --quiet`（非 `next lint`） |
| `npm test` | Jest 30，`--max-old-space-size=4096` |
| `npm run test:watch` | 监听模式 |
| `npm run test:coverage` | 覆盖率（阈值：80% lines/functions/statements，70% branches） |

关键配置说明：

- **next.config.js**：`eslint.ignoreDuringBuilds: true`
- **jest.setup.ts**：mock `next/router`、`localStorage`、`requestAnimationFrame`
- **tailwind.config.ts**：扫描 `./lib/**`, `./components/**`, `./app/**`
- **ESLint 排除**：`app/monopoly/**`、`app/whack-a-mole/page.tsx`、`app/aircraft-battle/page.tsx`（待修复）
- **代码缩进**：项目级统一 **4 空格**（覆盖 User 级 2 空格设置）

## 八、测试覆盖情况

- ✅ 已覆盖：共享库 `lib/` 的核心组件、Hook、工具函数（`GameLayout`、`useHighScore`、`formatTime` 等）
- ⚠️ 未覆盖：绝大多数游戏模块的业务逻辑（仅 `link-match` 内部有 `__tests__`）

## 九、已知待优化

1. 贪吃蛇帧率优化
2. `app/link-match/utils/helpers.ts` 中 `formatTime` 已 `@deprecated`，需统一到 `lib/utils/format`
3. `useTankGame.ts` 中的 `Explosion`、`PowerUp` 未清理
4. ESLint 排除项需修复并纳入检查
5. 大部分游戏缺少单元测试
6. 移动端适配（贪吃蛇/俄罗斯方块等纯键盘游戏缺虚拟按键）
7. 大富翁仅本地轮流，未联网
8. 全项目暂无音效

## 十、目录一览

```
QoderTest/
    app/               # 31 款游戏模块 + 首页/布局/全局样式
    lib/               # 共享库：registry / hooks / components / utils / types
    tests/             # 项目级测试与占位
    my-test-plugin/    # Qoder CLI 插件脚手架
    docs/              # 文档
    coverage/          # 覆盖率输出
    public/            # 静态资源
    AGENTS.md          # AI 代理项目级指导
    AGENTS.local.md    # AI 代理本地级指导
    PRODUCT.md         # 产品说明（游戏数量已过期）
    USAGE.md           # 使用说明
```
