# 产品说明文档

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 整体架构说明](#2-整体架构说明)
- [3. 游戏注册机制详解](#3-游戏注册机制详解)
- [4. 游戏详细介绍](#4-游戏详细介绍)
- [5. 共享组件和工具库说明](#5-共享组件和工具库说明)
- [6. 开发环境搭建与运行指南](#6-开发环境搭建与运行指南)
- [7. 代码注释汇总](#7-代码注释汇总)
- [8. 技术亮点和设计模式](#8-技术亮点和设计模式)
- [9. 待优化事项](#9-待优化事项)

---

## 1. 项目概述

### 项目名称

**游戏中心**（Qoder Test）

### 项目定位

一款基于浏览器的在线休闲游戏中心，集成了 15 款经典益智与动作小游戏。用户打开网页即可即开即玩，所有游戏均通过键盘或鼠标操控，无需下载安装。

### 技术栈

| 层面         | 技术选型                                    |
| ------------ | ------------------------------------------- |
| 框架         | Next.js 14（App Router）                    |
| 语言         | TypeScript 5                                |
| 样式         | Tailwind CSS 3                              |
| UI 辅助      | class-variance-authority、clsx、tailwind-merge |
| 图标         | lucide-react                                |
| 渲染         | 客户端渲染（`'use client'`）               |
| 测试         | Jest 30 + Testing Library                   |
| 代码规范     | ESLint（flat config） + Prettier             |
| 运行时       | React 18                                    |
| 开发环境     | Node.js v24（macOS Apple Silicon）          |

---

## 2. 整体架构说明

### 目录结构

```
QoderTest/
  app/                        # Next.js App Router 页面
    page.tsx                  # 首页（游戏中心入口）
    layout.tsx                # 根布局（HTML 文档结构）
    globals.css               # 全局样式（Tailwind + 自定义动画）
    link-match/               # 连连看游戏模块
    snake/                    # 贪吃蛇游戏模块
    tetris/                   # 俄罗斯方块游戏模块
    tank-battle/              # 坦克大战游戏模块
    whack-a-mole/             # 打地鼠游戏模块
    minesweeper/              # 扫雷游戏模块
    monopoly/                 # 大富翁游戏模块
    aircraft-battle/          # 飞机大战游戏模块
    match-three/              # 消消乐游戏模块
    puzzle-2048/              # 2048 游戏模块
    klotski/                  # 华容道游戏模块
    hanoi/                    # 汉诺塔游戏模块
    sokoban/                  # 推箱子游戏模块
    lights-out/               # 点灯游戏模块
    sudoku/                   # 数独游戏模块
  lib/                        # 共享库
    registry.ts               # 游戏注册表（集中管理所有游戏元数据）
    types/
      game.ts                 # 跨游戏共享的基础类型
      registry.ts             # GameMeta 接口定义
    components/
      GameLayout.tsx          # 游戏页面统一外壳（返回按钮 + 标题）
      GameOverlay.tsx         # 可复用遮罩层（暂停/结束/等待）
      GamePageHeader.tsx      # 游戏页面标题组件
      ControlHints.tsx        # 操作提示组件
    hooks/
      useHighScore.ts         # localStorage 高分持久化
      useKeyboard.ts          # 通用键盘输入映射
      useIntervalLoop.ts      # setInterval 循环 Hook
      useGameFrame.ts         # requestAnimationFrame 游戏循环 Hook
      index.ts                # barrel exports
    utils/
      format.ts               # 时间格式化工具
      collision.ts            # AABB 矩形碰撞检测
      index.ts                # barrel exports
  agents.md                   # AI 代理项目级指导文件
  agents.local.md             # AI 代理本地级指导文件
  package.json
  tsconfig.json
  tailwind.config.ts
  eslint.config.js
  jest.config.js
  postcss.config.js
  next.config.js
```

### 核心模块关系

```
首页 (app/page.tsx)
  |
  +-- 读取 GAME_REGISTRY (lib/registry.ts)
        |
        +-- 各游戏 meta.ts 导出的 GameMeta 对象
              |
              +-- 点击卡片 -> 路由到 /<game-id>/page.tsx
                    |
                    +-- 使用 GameLayout (lib/components/)
                    +-- 调用游戏 Hook (hooks/useXxxGame.ts)
                    +-- 引用游戏常量 (constants/config.ts)
                    +-- 渲染游戏组件 (components/)
                    +-- 使用共享 Hooks (lib/hooks/)
```

### 游戏模块内部结构

每个游戏遵循统一的目录约定：

```
app/<game-id>/
  meta.ts              # 游戏元数据（名称、图标、描述、标签、样式）
  page.tsx             # 路由页面组件（'use client'）
  types/game.ts        # 游戏专属类型定义
  constants/config.ts  # 游戏常量（棋盘大小、速度、分数规则等）
  hooks/               # 核心游戏逻辑 Hook
  components/          # 游戏专属 UI 组件
  utils/               # （可选）游戏专属纯函数工具
```

---

## 3. 游戏注册机制详解

### 注册流程

游戏注册采用**集中式注册表模式**（Registry Pattern），核心文件为 `lib/registry.ts`。

1. **定义元数据**：每个游戏在 `app/<game-id>/meta.ts` 中导出一个 `GameMeta` 对象。
2. **导入注册**：在 `lib/registry.ts` 中导入该元数据，并加入 `GAME_REGISTRY` 数组。
3. **自动展示**：首页 `app/page.tsx` 读取 `GAME_REGISTRY` 渲染游戏卡片，路由由 `GameMeta.id` 决定。

### GameMeta 接口

```typescript
interface GameMeta {
  id: string;          // 唯一标识，与路由路径对应（如 'snake' -> /snake）
  name: string;        // 游戏名称
  description: string; // 游戏描述
  icon: string;        // 展示图标（emoji）
  tags: string[];      // 标签（如 ['益智', '消除']）
  gradient: string;    // 卡片主题色（Tailwind 渐变 class）
  iconBg: string;      // 图标背景色
  glowColor: string;   // 悬停光晕色
}
```

### 当前注册顺序

`GAME_REGISTRY` 数组的顺序决定首页游戏卡片的展示顺序：

1. 连连看 (link-match)
2. 贪吃蛇 (snake)
3. 俄罗斯方块 (tetris)
4. 坦克大战 (tank-battle)
5. 打地鼠 (whack-a-mole)
6. 扫雷 (minesweeper)
7. 大富翁 (monopoly)
8. 飞机大战 (aircraft-battle)
9. 消消乐 (match-three)
10. 2048 (puzzle-2048)
11. 华容道 (klotski)
12. 汉诺塔 (hanoi)
13. 推箱子 (sokoban)
14. 点灯游戏 (lights-out)
15. 数独 (sudoku)

---

## 4. 游戏详细介绍

### 4.1 连连看

| 属性     | 值                                    |
| -------- | ------------------------------------- |
| 路由     | `/link-match`                         |
| 类型     | 益智消除                              |
| 标签     | 益智、消除                            |
| 难度     | 简单 / 中等 / 困难（3 级关卡选择）   |
| 技术方案 | DOM 渲染 + SVG 连接线动画             |

**玩法说明**：找出棋盘上相同的图案，用最多 2 次转弯的路径将它们连接消除。支持提示功能（有限次数，使用扣分）、连击系统（连续消除加分）和死局自动重排。

**核心功能**：
- 路径查找算法：支持直线（0 转弯）、L 形（1 转弯）、Z/U 形（2 转弯）三种连接方式
- 三个难度等级：简单 4x4、中等 6x6、困难 8x8
- 连击系统：3 秒内连续消除获得额外加分
- 提示系统：3 次提示机会，高亮可消除的卡牌对
- 死局检测与自动重排
- 连接线 SVG 动画

**文件结构**：3 个 Hook（useGameLogic、useGameState、useHintManager）、7 个组件、1 个工具模块（boardLogic.ts 纯函数）、测试文件。

### 4.2 贪吃蛇

| 属性     | 值                          |
| -------- | --------------------------- |
| 路由     | `/snake`                    |
| 类型     | 动作经典                    |
| 标签     | 动作、经典                  |
| 难度     | 随分数递增自动加速          |
| 技术方案 | Canvas API 渲染 + setInterval 循环 |

**玩法说明**：控制蛇在 20x20 的场地中移动吃掉食物不断变长，避开墙壁和自身。每吃 50 分加速一次，最高速度不超过 50ms/帧。

**核心功能**：
- 方向键 / WASD 双控制方案
- 自动防掉头（不允许直接反向）
- 速度递增机制（基础 150ms，每 50 分减少 10ms，最低 50ms）
- Canvas 绘制蛇身和食物
- 最高分 localStorage 持久化
- 暂停/继续/重新开始

### 4.3 俄罗斯方块

| 属性     | 值                                       |
| -------- | ---------------------------------------- |
| 路由     | `/tetris`                                |
| 类型     | 策略经典                                 |
| 标签     | 策略、经典                               |
| 难度     | 12 级速度等级，每消除 10 行升级          |
| 技术方案 | Canvas API 渲染 + setInterval 游戏循环   |

**玩法说明**：旋转并放置不断下落的七种经典方块（I/O/T/S/Z/J/L），填满整行进行消除得分。支持软降、硬降，速度随等级递增。

**核心功能**：
- 7 种经典方块，每种 4 个旋转状态
- 软降（加速一格）和硬降（直接到底）
- 12 级速度（800ms 到 60ms）
- 计分规则：1 行 100 分、2 行 300 分、3 行 500 分、4 行 800 分（乘以当前等级）
- 下一个方块预览
- 信息面板（分数、等级、行数、最高分）
- 中英双语注释

### 4.4 坦克大战

| 属性     | 值                                         |
| -------- | ------------------------------------------ |
| 路由     | `/tank-battle`                             |
| 类型     | 射击经典                                   |
| 标签     | 射击、经典                                 |
| 难度     | 固定难度，敌人数量 20 个                   |
| 技术方案 | Canvas API 渲染 + requestAnimationFrame 主循环 |

**玩法说明**：操控坦克在经典地图中消灭所有敌军坦克，保护基地不被摧毁。地图包含砖墙（可摧毁）、钢墙（不可摧毁）、水域（不可通行）、树丛和基地。

**核心功能**：
- 26x26 格子经典地图
- 敌人 AI（随机方向移动 + 自动射击）
- 子弹碰撞检测（地图/坦克）
- 道具系统：星星、护盾（3 秒无敌）、额外生命
- 敌人击杀 20% 概率掉落道具
- 玩家 3 条命，重生后短暂无敌
- 爆炸动画效果
- 胜利/失败判定

### 4.5 打地鼠

| 属性     | 值                                     |
| -------- | -------------------------------------- |
| 路由     | `/whack-a-mole`                        |
| 类型     | 反应休闲                               |
| 标签     | 反应、休闲                             |
| 难度     | 随时间递增（出现间隔和停留时间缩短）   |
| 技术方案 | DOM 渲染 + CSS 动画 + setTimeout 定时器链 |

**玩法说明**：3x3 的地鼠洞网格，地鼠随机出现，60 秒内尽可能多地敲击。三种地鼠类型：普通（+10 分）、金色（+25 分）、炸弹（-15 分）。连击 3 次以上获得额外奖励。

**核心功能**：
- 三种地鼠类型与概率配置
- 地鼠生命周期：升起 -> 停留 -> 落下/被击中
- 连击系统（3 连击起获得奖励加成）
- 难度递增（每 10 秒加速一次）
- 游戏统计（击中、未中、逃跑、最高连击）
- 分数弹出动画
- 最大同时活跃地鼠数限制（4 只）

### 4.6 扫雷

| 属性     | 值                                    |
| -------- | ------------------------------------- |
| 路由     | `/minesweeper`                        |
| 类型     | 益智经典                              |
| 标签     | 益智、经典                            |
| 难度     | 初级 9x9/10 雷、中级 16x16/40 雷、高级 16x30/99 雷 |
| 技术方案 | DOM 渲染 + BFS 展开算法              |

**玩法说明**：在首次安全点击后生成地雷分布，利用数字线索标记地雷并层层展开安全区域。支持左键揭开、右键/长按插旗、双击快速展开（chord）。

**核心功能**：
- 首次点击安全保护（点击位置及周围 8 格保证无雷）
- BFS 自动展开空白区域
- 右键/长按插旗（移动端适配）
- 双击数字格快速展开（chord 操作）
- 三级难度切换
- 最佳时间记录（localStorage 持久化）
- 游戏统计（场次、胜率、总时长）
- 自动标记确定地雷

### 4.7 大富翁

| 属性     | 值                              |
| -------- | ------------------------------- |
| 路由     | `/monopoly`                     |
| 类型     | 策略多人经典                    |
| 标签     | 策略、多人、经典                |
| 难度     | 无难度分级                      |
| 技术方案 | DOM 渲染 + 状态机              |

**玩法说明**：2-4 人本地轮流对战的经典策略棋盘游戏。掷骰子移动、购买地产、收租金、建房子、抽机会/命运卡，目标是让其他玩家破产。

**核心功能**：
- 28 格环形棋盘（底/左/顶/右四边）
- 2-4 人本地对战
- 回合阶段状态机（waiting -> rolled -> buying/paying/chance/jailed -> waiting）
- 10 张机会卡 + 7 张命运卡
- 地产购买与升级（3 级房屋）
- 监狱系统（保释金 / 最大 3 回合）
- 经过起点领取 $200 工资
- 破产判定与胜利者检测

### 4.8 飞机大战

| 属性     | 值                                          |
| -------- | ------------------------------------------- |
| 路由     | `/aircraft-battle`                          |
| 类型     | 射击经典                                    |
| 标签     | 射击、经典                                  |
| 难度     | 随分数递增（每 1000 分提升一级，每 5000 分出现 Boss） |
| 技术方案 | Canvas API 渲染 + requestAnimationFrame 循环 + Ref 状态管理 |

**玩法说明**：经典纵版射击游戏。驾驶战机在 400x600 画布中移动，自动射击消灭四种敌机（小/中/大/Boss），收集道具升级武器。

**核心功能**：
- 四种敌机类型（不同血量、速度、射击频率、分值）
- 敌机移动模式（直线、正弦、巡航）
- 道具系统：生命、射速提升、散射、炸弹（清屏）
- 武器升级系统（normal -> spread -> laser）
- 难度递增（速度倍率和生成间隔随分数调整）
- Boss 出现机制（每 5000 分触发）
- 背景星空滚动效果
- 无敌帧保护
- 爆炸动画

### 4.9 消消乐

| 属性     | 值                                    |
| -------- | ------------------------------------- |
| 路由     | `/match-three`                        |
| 类型     | 益智消除休闲                          |
| 标签     | 益智、消除、休闲                      |
| 难度     | 简单 / 中等 / 困难（3 级关卡选择）   |
| 技术方案 | DOM 渲染 + CSS 动画 + 消除循环算法    |

**玩法说明**：交换相邻宝石，三个或更多同色宝石连线即可消除，触发连锁反应获得高分。限定步数内达到目标分数即可获胜。

**核心功能**：
- 三档关卡配置（不同棋盘大小、宝石种类数、步数和目标分数）
- 消除循环：匹配 -> 消除 -> 重力下落 -> 填充 -> 再次匹配（连锁）
- 连锁倍率加分（cascadeMultiplier: 1.5）
- 死局检测与自动重排
- 步数限制与目标分数
- 动画时序管理（交换/消除/下落动画）

### 4.10 2048

| 属性     | 值                                     |
| -------- | -------------------------------------- |
| 路由     | `/puzzle-2048`                         |
| 类型     | 益智数字                               |
| 标签     | 益智、数字                             |
| 难度     | 无难度分级                             |
| 技术方案 | DOM 渲染 + CSS 过渡动画 + 双指针合并算法 |

**玩法说明**：在 4x4 棋盘上通过方向键滑动，相同数字的方块碰撞合并翻倍，目标是合成 2048。达成后可选择继续挑战更高数字。

**核心功能**：
- 双指针挤压 + 单次合并算法
- 稳定 Tile ID 实现跨帧 CSS 过渡动画
- 出现/合并关键帧动画
- 胜利后可继续游戏
- 最高分 localStorage 持久化
- 数值对应不同 Tailwind 颜色样式（2~8192+）
- 触摸滑动支持

### 4.11 华容道

| 属性     | 值                              |
| -------- | ------------------------------- |
| 路由     | `/klotski`                      |
| 类型     | 益智策略                        |
| 标签     | 益智、策略、三国                |
| 难度     | 多关卡（内置经典布局）          |
| 技术方案 | DOM 渲染 + CSS 过渡动画         |

**玩法说明**：经典三国主题滑块益智游戏。在 4x5 的棋盘上滑动方块，帮助曹操（2x2 方块）从出口突围。步数越少越厉害。

**核心功能**：
- 4 种方块类型：曹操(2x2)、关羽(2x1)、武将(1x2)、士兵(1x1)
- 多关卡选择（横刀立马、指挥若定、兵临城下等经典布局）
- 占位网格碰撞检测
- 撤销功能（历史记录栈）
- 最佳步数 localStorage 持久化
- 滑动动画

### 4.12 汉诺塔

| 属性     | 值                              |
| -------- | ------------------------------- |
| 路由     | `/hanoi`                        |
| 类型     | 益智经典数学                    |
| 标签     | 益智、经典、数学                |
| 难度     | 3-8 层可选                      |
| 技术方案 | DOM 渲染 + 动画                 |

**玩法说明**：将所有圆盘从左边柱子移动到右边柱子，每次只能移动一个圆盘，且大圆盘不能放在小圆盘上面。最优步数为 2^n - 1。

**核心功能**：
- 3-8 层可调
- 点击选择柱子进行移动
- 最优步数参考显示
- 关卡解锁系统（完成当前层解锁下一层）
- 统计数据持久化（最佳步数、总游戏次数、总时长）
- 圆盘彩色渲染

### 4.13 推箱子

| 属性     | 值                                     |
| -------- | -------------------------------------- |
| 路由     | `/sokoban`                             |
| 类型     | 益智策略                               |
| 标签     | 益智、策略                             |
| 难度     | 12 个关卡，难度递增                   |
| 技术方案 | DOM 渲染 + 字符地图解析                |

**玩法说明**：经典推箱子益智游戏。在网格地图中推动箱子到目标位置即可过关，需要小心规划路线避免把自己堵死。

**核心功能**：
- 字符地图格式关卡数据（# 墙、. 目标、$ 箱子、@ 玩家、+ 玩家站在目标上、* 箱子在目标上）
- 12 个精心设计的关卡
- 撤销功能（MoveSnapshot 快照栈）
- 步数和推箱次数统计
- 最佳记录 localStorage 持久化
- 方向键 / WASD 控制

### 4.14 点灯游戏

| 属性     | 值                                |
| -------- | --------------------------------- |
| 路由     | `/lights-out`                     |
| 类型     | 益智逻辑                          |
| 标签     | 益智、逻辑                        |
| 难度     | 10 个关卡，3x3 到 5x5 递进       |
| 技术方案 | DOM 渲染 + 模拟点击生成可解关卡  |

**玩法说明**：点击格子会切换它和上下左右相邻格子的灯光状态，目标是把所有灯都熄灭。从全灭状态通过模拟点击生成初始状态，保证 100% 可解。

**核心功能**：
- 10 个关卡（从 3x3 到 5x5）
- 可解性保证（从全灭状态反向模拟点击生成）
- 步数统计与亮灯计数
- 最佳步数 localStorage 持久化
- 关卡选择界面

### 4.15 数独

| 属性     | 值                                     |
| -------- | -------------------------------------- |
| 路由     | `/sudoku`                              |
| 类型     | 益智逻辑数字                           |
| 标签     | 益智、逻辑、数字                       |
| 难度     | 简单 / 中等 / 困难                     |
| 技术方案 | DOM 渲染 + 回溯法生成器 + 冲突检测     |

**玩法说明**：在 9x9 网格中填入 1-9，使每行、每列和每个 3x3 宫格都包含全部数字。支持笔记模式和三级难度。

**核心功能**：
- 回溯法数独生成器（保证唯一解）
- 三级难度（移除 36/45/52 个格子）
- 笔记模式（标记候选数字）
- 实时冲突检测（行/列/宫格高亮）
- 最大错误次数限制（3 次）
- 撤销功能（历史记录栈）
- 计时器
- 数字键盘输入 + 键盘输入

---

## 5. 共享组件和工具库说明

### 5.1 共享组件 (`lib/components/`)

| 组件               | 功能说明                                                     |
| ------------------ | ------------------------------------------------------------ |
| `GameLayout`       | 游戏页面统一外壳。提供左上角返回首页链接、屏幕阅读器标题和子内容容器。 |
| `GameOverlay`      | 可复用半透明遮罩层。用于暂停、游戏结束、等待开始等场景，覆盖在游戏画布上。 |
| `GamePageHeader`   | 游戏页面标题组件。支持图标、副标题和自定义颜色。             |
| `ControlHints`     | 操作提示组件。将快捷键说明以分隔符连接的文本展示。           |

### 5.2 共享 Hooks (`lib/hooks/`)

| Hook               | 功能说明                                                     |
| ------------------ | ------------------------------------------------------------ |
| `useHighScore`     | localStorage 高分持久化。接受 storageKey 参数，返回 [highScore, updateHighScore]，仅在新分数超过记录时写入。 |
| `useKeyboard`      | 通用键盘输入映射。将"按键 -> 动作字符串"映射与事件绑定样板代码集中管理，内部使用 ref 避免频繁重绑 listener。支持 enabled/preventDefault 选项。 |
| `useIntervalLoop`  | 基于 setInterval 的循环 Hook。参考 Dan Abramov 的 useInterval 模式，callback 用 ref 持有避免重复创建定时器。 |
| `useGameFrame`     | 基于 requestAnimationFrame 的游戏循环 Hook。回调收到归一化 deltaTime（1.0 约等于 60fps 一帧），首帧自动跳过，适用于需要精确物理计算的实时游戏。 |

### 5.3 共享工具函数 (`lib/utils/`)

| 函数               | 功能说明                                                     |
| ------------------ | ------------------------------------------------------------ |
| `formatTime`       | 将秒数格式化为 MM:SS 格式，负数输入会被处理为 0。            |
| `rectOverlap`      | AABB 矩形碰撞检测。判断两个矩形是否存在重叠（相切视为不重叠），支持负坐标。 |

### 5.4 共享类型 (`lib/types/`)

| 类型                    | 说明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `GameStatus`            | 游戏状态超集：`'idle' | 'playing' | 'paused' | 'over' | 'won' | 'lost'` |
| `Position`              | 二维坐标 { x, y }                                        |
| `GridPosition`          | 棋盘坐标 { row, col }                                    |
| `Rect`                  | 矩形 { x, y, width, height }                             |
| `BaseGameHookReturn`    | 游戏 Hook 返回值基础接口（status, score, highScore, start, restart, togglePause） |
| `GameMeta`              | 游戏元数据接口（id, name, description, icon, tags, gradient, iconBg, glowColor） |

---

## 6. 开发环境搭建与运行指南

### 环境要求

- **Node.js**：v24（可使用最新 ES 特性）
- **包管理器**：npm
- **操作系统**：macOS / Linux / Windows 均可

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行 ESLint 检查（quiet 模式，仅显示 error 和 warning）
npm run lint

# 运行测试
npm test

# 测试监听模式
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 代码规范

- **Prettier**：单引号、trailing comma（es5）、100 字符宽度、2 空格缩进、LF 换行
- **ESLint**：
  - 放松部分 React Hooks 规则（`react-hooks/refs`、`react-hooks/set-state-in-effect`、`react-hooks/immutability` 关闭），以适应游戏状态管理中 ref 模式的需要
  - `no-console` 设为 warn（允许 `console.warn` 和 `console.error`）
  - TypeScript `no-explicit-any` 设为 warn
- **测试覆盖率门槛**：lines/functions/statements 80%，branches 70%

### 添加新游戏的步骤

1. 在 `app/<game-id>/` 下创建标准游戏模块结构
2. 创建 `app/<game-id>/meta.ts`，导出 `GameMeta` 对象
3. 在 `lib/registry.ts` 中导入并加入 `GAME_REGISTRY` 数组
4. 首页会自动渲染新游戏卡片

---

## 7. 代码注释汇总

### 7.1 项目配置层注释

| 文件                       | 关键注释                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `postcss.config.js`        | 中文注释说明 Tailwind CSS 插件和 Autoprefixer 插件的作用     |
| `next.config.js`           | JSDoc 类型注释 `@type {import('next').NextConfig}`           |
| `jest.config.js`           | 中文注释说明 Jest 30+ 使用 testMatch 而非 testPathPatterns   |
| `eslint.config.js`         | 注释说明游戏开发中放松 Hooks 规则的原因："Game development often requires patterns that violate strict hooks rules" |

### 7.2 共享库注释

| 文件                           | 关键注释                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `lib/types/game.ts`            | JSDoc 详细说明 GameStatus 超集用法，演示 `Extract` 挑选子集模式 |
| `lib/types/registry.ts`       | 每个字段有 JSDoc 注释说明用途                                |
| `lib/registry.ts`              | 模块级 JSDoc 说明注册表用法和添加新游戏的方法                |
| `lib/components/GameLayout.tsx` | 说明组件提供"统一外壳"的三大要素：返回链接、标题、子内容容器 |
| `lib/components/GameOverlay.tsx` | 说明"统一了 tetris 和 snake 中重复的遮罩 UI"                |
| `lib/hooks/useHighScore.ts`    | JSDoc 说明参数和返回值含义                                   |
| `lib/hooks/useKeyboard.ts`     | 详细 JSDoc + @example 代码示例；说明内部使用 ref 避免频繁重绑 |
| `lib/hooks/useIntervalLoop.ts` | 引用 Dan Abramov 的 useInterval 模式作为实现参考             |
| `lib/hooks/useGameFrame.ts`    | 说明归一化 deltaTime 的含义（1.0 约等于 60fps 一帧）和首帧跳过策略 |
| `lib/utils/format.ts`         | 说明负数输入会被处理为 0 的边界行为                          |
| `lib/utils/collision.ts`      | 说明"相切视为不重叠"及支持负坐标                             |

### 7.3 首页注释

| 文件             | 关键注释                                                     |
| ---------------- | ------------------------------------------------------------ |
| `app/page.tsx`   | 模块级 JSDoc 说明游戏列表来源和添加方式；行内注释标注背景装饰、主内容、标题区域、游戏卡片、进入按钮、底部装饰等结构 |
| `app/layout.tsx` | JSDoc 说明作为"所有页面的最外层包裹"的角色                   |
| `app/globals.css` | 中文注释分组说明自定义动画：float（漂浮光球）、gradient-shift、pulse-glow、title-shimmer、slide-up；卡片 3D 悬停效果和霓虹边框动画 |

### 7.4 各游戏关键注释

**连连看**：
- `useGameLogic.ts`：详细注释 5 步卡牌选择逻辑（忽略已消除 -> 首次选中 -> 取消选中 -> 匹配消除 -> 不匹配）；自动死局检测注释
- `useGameState.ts`：模块级注释区分"游戏运营层面"和"游戏规则层面"的分工
- `useHintManager.ts`：注释说明 3 秒自动清除提示和计时器生命周期管理
- `boardLogic.ts`：路径查找算法注释说明三种连接方式（直线/L 形/Z-U 形）；Fisher-Yates 洗牌算法注释
- `config.ts`：图标按类别分组注释（水果/花草/符号/动物）；动画/分数/全局配置每项均有行内注释
- `types/game.ts`：每个接口和字段都有完整 JSDoc，包括 @property 标注

**贪吃蛇**：
- `useSnakeGame.ts`：方向向量映射和反方向映射注释；食物生成确保不在蛇身上
- `config.ts`：默认配置每项有行内注释（网格尺寸、速度参数）

**俄罗斯方块**：
- 全项目最详尽的中英双语注释（每个类型/接口/函数都有中英文 JSDoc）
- `config.ts`：7 种方块定义均有旋转顺序注释（0 -> 90 -> 180 -> 270 顺时针）；计分规则注释说明实际得分计算公式
- `types/game.ts`：所有字段标注中英文注释

**坦克大战**：
- `useTankGame.ts`：每个内部函数有 JSDoc（创建玩家/敌人、方向增量映射、矩形碰撞、地图碰撞、坦克间碰撞）；游戏主循环分阶段注释（玩家移动 -> 射击 -> 敌人 AI -> 生成敌人 -> 子弹碰撞 -> 道具拾取 -> 护盾倒计时 -> 爆炸动画 -> 胜负判定）
- `config.ts`：地图构建函数中砖墙/钢墙/水域/树丛/基地分段注释

**打地鼠**：
- `useWhackAMoleGame.ts`：每个辅助函数有完整 JSDoc（createInitialHoles、getEmptyHoles、getActiveMoleCount、pickMoleType、calcMoleScore）；主 Hook 分区块注释（游戏状态 / Ref 引用 / 定时器引用）；whack 函数的详细判定逻辑注释
- `config.ts`：每个常量有行内中文注释

**扫雷**：
- `useMinesweeperGame.ts`：首次点击安全区域保护注释（点击位置及周围 8 格无雷）；BFS 展开算法注释；chordCell 双击自动标记逻辑注释
- `config.ts`：存储键名和难度配置注释

**大富翁**：
- `types/game.ts`：GamePhase 状态机每个阶段的中文注释
- `config.ts`：棋盘 28 格按四边分段注释（底边 0-6、左边 7-13、顶边 14-20、右边 21-27）

**飞机大战**：
- `useAircraftGame.ts`：模块级注释说明 Ref 状态管理模式；AABB 碰撞检测 JSDoc
- `config.ts`：配置按类别分组注释（画布/玩家/子弹/敌机/难度/道具）

**消消乐**：
- `boardLogic.ts`：纯函数模块注释"所有函数均为纯函数，不修改传入的 board"
- `config.ts`：动画时序配置注释

**2048**：
- `use2048Game.ts`：算法要点注释（双指针挤压 + 单次合并）；Tile ID 稳定性对 CSS 过渡动画的重要性说明

**华容道**：
- `useKlotskiGame.ts`：占位网格碰撞检测、胜利条件检测注释

**推箱子**：
- `levels.ts`：字符地图格式说明注释（# 墙、. 目标、$ 箱子、@ 玩家、+ 和 * 组合状态）
- `useSokobanGame.ts`：parseLevel 函数逐字符解析注释

**点灯游戏**：
- `levels.ts`：可解性保证策略注释"从全灭状态模拟点击生成可解关卡"

**数独**：
- `generator.ts`：回溯法生成器注释
- `config.ts`：难度配置注释（通过移除单元格数量控制难度）

### 7.5 特殊注释

| 文件                          | 注释内容                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `app/link-match/utils/helpers.ts` | `@deprecated` 标记：建议使用 `@/lib/utils/format` 中的 `formatTime` 代替 |
| `app/tank-battle/hooks/useTankGame.ts` | `// Explosion, // 未使用的类型` 和 `// PowerUp, // 未使用的类型` |
| `app/tetris/`                 | 全项目唯一采用中英双语注释的模块                             |

---

## 8. 技术亮点和设计模式

### 8.1 游戏注册表模式（Registry Pattern）

所有游戏通过 `lib/registry.ts` 集中注册，首页和其他需要遍历游戏列表的地方统一读取。新增游戏只需添加 meta.ts 并在注册表中追加一条记录，零配置即可在首页展示。

### 8.2 Hook 驱动的游戏逻辑封装

每个游戏的核心逻辑封装在自定义 Hook 中（如 `useSnakeGame`、`useTetrisGame`），管理状态、输入和游戏循环。页面组件只负责渲染和事件转发，实现了逻辑与视图的清晰分离。

部分游戏进一步将 Hook 拆分为多层：
- **连连看**：`useGameLogic`（棋盘规则）+ `useGameState`（运营管理）+ `useHintManager`（提示 UI）
- **消消乐**：`useMatchThreeGame`（棋盘逻辑）+ `useGameState`（分数/步数）

### 8.3 Ref 同步模式避免闭包陷阱

游戏开发中常见"定时器回调需要最新状态"的场景。项目大量使用 `useRef` 保存最新状态引用，避免 `setInterval`/`setTimeout`/`requestAnimationFrame` 回调中的闭包陷阱：

- `useIntervalLoop` 和 `useGameFrame`：callback 用 ref 持有，不随渲染重建
- `useKeyboard`：keyMap 和 handlers 用 ref 持有，不随渲染重绑 listener
- 各游戏 Hook 中 `snakeRef`、`boardRef`、`scoreRef` 等同步更新

### 8.4 两种游戏循环策略

- **setInterval 模式**（`useIntervalLoop`）：适用于回合制/格子游戏（贪吃蛇、俄罗斯方块、打地鼠），帧率固定
- **requestAnimationFrame 模式**（`useGameFrame` 或手写 RAF）：适用于实时游戏（坦克大战、飞机大战），回调收到归一化 deltaTime

### 8.5 纯函数逻辑层与 React 状态层分离

连连看和消消乐等棋盘类游戏将纯逻辑函数独立到 `utils/boardLogic.ts`，不依赖 React，可独立单元测试。Hook 层只负责 React 状态管理和调用纯函数。

### 8.6 SSR/Hydration 安全

连连看和消消乐的棋盘初始化使用了 `useEffect` + `isInitialized` 模式，避免服务端和客户端随机结果不一致导致的 hydration 错误。

### 8.7 localStorage 持久化策略

- **高分记录**：通过 `useHighScore` Hook 统一管理，各游戏使用不同 key
- **最佳时间**：扫雷游戏按难度分组存储
- **关卡进度**：华容道、推箱子、点灯游戏、汉诺塔分别存储各关卡最佳记录
- **游戏统计**：扫雷的场次/胜率/时长统计

所有 localStorage 操作均包裹在 try-catch 中，优雅降级处理不可用场景。

### 8.8 视觉体验

- 首页暗色渐变背景 + 浮动光球装饰 + 网格纹理叠加
- 卡片 3D 悬停效果（translateY + scale + box-shadow）
- 霓虹边框动画（CSS mask-composite 技术）
- 标题渐变文字 + shimmer 动画
- 卡片交错入场动画（slide-up-delay）
- 各游戏独立配色方案（gradient/iconBg/glowColor）

---

## 9. 待优化事项

### 从代码 TODO 和注释中提取

| 来源                    | 待优化内容                                                   |
| ----------------------- | ------------------------------------------------------------ |
| `agents.local.md`       | TODO: 待优化 snake 游戏的帧率                                |
| `helpers.ts`            | `@deprecated`：`app/link-match/utils/helpers.ts` 中的 `formatTime` 已标记废弃，建议统一使用 `@/lib/utils/format` 中的版本 |
| `useTankGame.ts`        | 未使用的类型 `Explosion` 和 `PowerUp` 被注释掉但未清理      |
| `eslint.config.js`      | `app/monopoly/**`、`app/whack-a-mole/page.tsx`、`app/aircraft-battle/page.tsx` 被排除在 ESLint 检查之外，后续应修复并纳入检查 |

### 潜在优化方向

- **测试覆盖**：目前仅连连看和共享库有单元测试，其他游戏模块缺少测试
- **帧率优化**：贪吃蛇等使用 setInterval 的游戏在高帧率场景下可考虑迁移到 requestAnimationFrame
- **移动端适配**：部分游戏已有触摸/长按支持（扫雷），但键盘操控类游戏（如贪吃蛇、俄罗斯方块）需要虚拟按键或手势支持
- **多人联网**：大富翁目前仅支持本地轮流，可考虑联网对战
- **音效**：当前所有游戏均无音效支持
