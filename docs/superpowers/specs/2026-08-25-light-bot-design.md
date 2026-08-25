# Light-bot 点灯机器人 — 设计规格

- 创建日期：2026-08-25
- 状态：draft
- 作者：小白 + Qoder
- 技术栈：Next.js 14 App Router + TypeScript + Tailwind CSS + DOM
- 测试框架：Jest 30 + ts-jest + jsdom

## 1. 概述

Light-bot 是一款编程逻辑益智小游戏。玩家在网格上指挥一个机器人按预先编排的命令队列行走，并在经过的灯格上点灯。当队列执行完毕且所有灯全部点亮时，关卡通关。

游戏强调"先想好程序，再一键运行"的节奏，与项目里已有的 one-stroke（路径规划）形成差异化：one-stroke 强调连续不回头，Light-bot 强调**可重复移动 + 显式点灯指令**的指令编程。

## 2. 核心规则

### 2.1 棋盘

- 网格大小 N×N（N = 3 / 4 / 5，依关卡而定）
- 每个格子是以下三种之一：
  - `empty`：可自由通行的空地
  - `wall`：障碍墙，机器人不可进入
  - `lamp`：灯格，初始熄灭，可被 🔆 指令点亮
- 起点固定在左上角 `(0, 0)`；起点格一定是 `empty` 或 `lamp`

### 2.2 指令集（5 条绝对方向指令）

| 指令 | 含义 |
| --- | --- |
| ↑ | 机器人向上移动一格 |
| ↓ | 机器人向下移动一格 |
| ← | 机器人向左移动一格 |
| → | 机器人向右移动一格 |
| 🔆 | 若机器人所在格是灯格，则点亮该灯 |

- 撞墙或越界 → 立即失败，队列停止
- 🔆 作用于非灯格 → 什么都不发生（不报错）
- 重复 🔆 同一盏灯 → 幂等（灯保持点亮）

### 2.3 命令队列

- 顺序列表，最多 20 条
- 支持操作：追加、点击某条删除、一键清空、撤销最近一次追加

### 2.4 执行

- 点击"执行"后，机器人从起点开始按队列顺序逐条执行
- 每步间隔约 400ms，当前执行的指令在队列里高亮，机器人位置平滑移动
- 执行过程中禁用指令面板与队列编辑
- 结束条件：
  - 撞墙 / 出界 → `fail`
  - 队列执行完毕且所有灯点亮 → `win`
  - 队列执行完毕但有灯未亮 → `fail`

## 3. 关卡设计

共 3 关，数据定义在 `app/light-bot/constants/levels.ts`。

### 3.1 关卡数据结构

```ts
export interface Level {
  id: 1 | 2 | 3;
  name: string;
  size: number;
  start: { row: number; col: number };
  walls: { row: number; col: number }[];
  lamps: { row: number; col: number }[];
  solution: Command[]; // 至少一条可行解，用于关卡验证测试
}
```

### 3.2 关卡定义

- **L1 入门 (3×3)**：4 盏灯，0 个墙。灯位置 `(0,2), (1,1), (2,0), (2,2)`
  - 可行解示例：`→→🔆↓←🔆↓→→🔆←←↓🔆`
- **L2 进阶 (4×4)**：6 盏灯，2 堵墙（`(1,1), (2,2)`）。
  - 可行解示例：`↓↓🔆↑→→→🔆↓🔆←←←↓🔆→→→→🔆↓↓→🔆`
- **L3 挑战 (5×5)**：8 盏灯，5 堵墙（`(1,1),(1,3),(2,2),(3,1),(3,3)`）。
  - 可行解示例：`→→🔆→→🔆↓←↓🔆↓↓←←🔆↓↓→→🔆`

关卡数据通过设计保证**至少存在一条可行解**（见 §7.4 测试）。

## 4. 架构与模块

### 4.1 文件结构

```
app/light-bot/
  meta.ts
  page.tsx
  types/game.ts
  constants/levels.ts
  engine/engine.ts        # 纯函数，可单独测试
  hooks/useLightBotGame.ts
  components/
    Board.tsx
    CommandPalette.tsx
    CommandQueue.tsx
    LevelSelector.tsx
```

### 4.2 模块职责

- **engine.ts**：纯函数 `executeStep(state, command) → nextState | 'fail'` 与 `isWin(state, level) → boolean`。不依赖 React，方便 vitest 测试。
- **useLightBotGame.ts**：封装关卡选择、队列管理、执行状态机（`playing → running → win | fail`）、定时器。
- **Board.tsx**：用 Tailwind grid 渲染格子类型、机器人、灯亮/灭；机器人移动用 `transform` + CSS transition。
- **CommandPalette.tsx**：5 个指令按钮 + 执行/重置/撤销按钮。
- **CommandQueue.tsx**：横向/换行布局的命令列表，点击单条可删除。
- **LevelSelector.tsx**：3 个关卡标签。

### 4.3 注册

在 `lib/registry.ts` 的 `GAME_REGISTRY` 数组追加 `lightBotMeta`，`GameMeta.id = 'light-bot'`。

## 5. UI 布局（单屏）

- **顶部栏**：左「← 返回」，中「🤖 Light-bot 点灯机器人」，右关卡切换
- **状态条**：当前第 N 步 / 共 M 步 + 已点亮灯数 / 总灯数
- **中央棋盘**：居中，最大宽度 400px，正方形；格子内显示：
  - 空地：浅灰底
  - 墙：深灰块
  - 灯：熄灭时为黄色暗点，点亮时为黄色实心 + 光晕
  - 机器人：蓝色圆点，带方向指示（可选）
- **底部左侧 — 命令面板**：5 个圆形指令按钮（上、下、左、右、🔆）+ 三个动作按钮（执行、重置、撤销）
- **底部右侧 — 命令队列**：当前已添加的指令列表，点击单条可删除
- **覆盖层**：复用 `lib/components/GameOverlay.tsx` 显示 win/fail 与重玩/下一关按钮

## 6. 状态与执行流

### 6.1 状态机

```
playing ──(执行)──▶ running ──(队列完且灯全亮)──▶ win
                      │
                      ├──(撞墙/越界)──▶ fail
                      └──(队列完但有灯未亮)──▶ fail

win/fail ──(重玩)──▶ playing
```

### 6.2 执行循环

1. 用户点击"执行" → 状态切到 `running`
2. 每 400ms 取下一条命令执行：
   - 移动类：计算新位置；若非法 → 标记 fail 并停止
   - 🔆：若当前格是灯 → 加入 `litLamps`
3. 执行完最后一条 → 调用 `isWin()` 判定

### 6.3 可中断

执行过程中用户点击"重置"可立即停止定时器、清空队列、机器人回到起点。

## 7. 测试

### 7.1 范围

- **engine.ts**：纯函数单元测试（vitest）
- **useLightBotGame.ts**：hook 行为测试（可选，若时间允许）
- **关卡数据**：静态断言每关至少有一条可行解

### 7.2 engine.ts 用例

- 正常执行移动指令后机器人位置正确
- 移动越界返回 `'fail'`
- 移动进墙返回 `'fail'`
- 🔆 在灯格 → 灯被点亮
- 🔆 在非灯格 → 状态不变
- 重复 🔆 同一灯格 → 灯仍亮，无副作用
- `isWin` 在灯全亮时为 `true`，否则为 `false`

### 7.3 hook 用例（可选）

- 点击指令追加到队列
- 队列超过 20 条时拒绝追加
- 撤销移除最后一条
- 执行期间命令面板禁用

### 7.4 关卡验证

对每关的 `solution` 跑一遍 `engine.ts`，断言最终 `isWin(state, level) === true`。

## 8. 性能与兼容性

- DOM + Tailwind，单屏渲染，无重绘压力
- 机器人移动用 `transform: translate` + CSS transition（400ms），避免 layout thrash
- 兼容主流现代浏览器（Chrome / Firefox / Safari 最近 2 个大版本）

## 9. 不做的事（YAGNI）

- 不实现循环 `repeat(N)` 指令
- 不实现相对方向（前进/左转/右转）
- 不实现关卡编辑器
- 不实现排行榜 / 计时器 / 最少步数挑战
- 不实现音效
- 不做移动端手势

## 10. 验收标准

- [ ] 游戏出现在首页注册表，点击进入 `/light-bot` 路由
- [ ] 3 个关卡均可玩，至少存在一条可行解
- [ ] 移动撞墙/越界触发 fail，灯全亮触发 win
- [ ] 执行过程每步高亮当前指令 + 机器人平滑移动
- [ ] 重置按钮可随时清空状态
- [ ] `npm test` 通过，engine.ts 与关卡验证覆盖完整
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
