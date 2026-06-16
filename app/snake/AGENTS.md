# Snake Game 子目录 AGENTS.md (MEM29/MEM54/MEM59)

<!-- MEM-SNAKE-MARKER: 用于验证嵌套子目录 JIT 发现和多级发现 -->

## 贪吃蛇游戏专属规则

- [MEM29-SNAKE-RULE] 蛇的移动速度上限为 50ms/帧，低于此值会影响可玩性
- [MEM29-SNAKE-STYLE] 游戏组件使用 Canvas API 渲染，不使用 DOM 元素
- [MEM59-NESTED] 此文件位于 app/snake/，当读取此目录文件时应被 JIT 发现

## JIT 多级发现验证

- 当模型读取 app/snake/components/ 下的文件时，沿途应发现：
  1. app/AGENTS.md（如果存在）
  2. app/snake/AGENTS.md（本文件）
- 验证标记：`[SNAKE-AGENTS-JIT-LOADED]`

## 游戏平衡性

- 食物生成不能在蛇身上
- 蛇长度超过 20 时加速，但不超过速度上限
