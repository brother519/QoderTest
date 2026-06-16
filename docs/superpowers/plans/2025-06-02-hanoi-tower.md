# 汉诺塔游戏实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个支持渐进难度、混合交互、完整统计的汉诺塔益智游戏

**Architecture:** 遵循项目游戏模块标准结构，使用 React hooks 管理游戏状态，localStorage 持久化进度和统计数据，Canvas 渲染游戏画面

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, React Hooks, Canvas API

---

## 文件结构

```
app/hanoi/
├── meta.ts              # 游戏元数据注册
├── page.tsx             # 游戏页面组件
├── types/
│   └── game.ts          # 游戏类型定义
├── constants/
│   └── config.ts        # 游戏配置常量
├── hooks/
│   └── useHanoiGame.ts  # 核心游戏逻辑 hook
└── components/
    ├── HanoiBoard.tsx   # 游戏主画布
    ├── HanoiDisk.tsx    # 圆盘组件
    ├── HanoiPeg.tsx     # 柱子组件
    ├── GameStats.tsx    # 统计面板
    └── LevelSelector.tsx # 层数选择器
```

---

## Task 1: 创建游戏类型定义

**Files:**
- Create: `app/hanoi/types/game.ts`

- [ ] **Step 1: 编写类型定义文件**

```typescript
/**
 * Hanoi Tower Game Types
 *
 * @module hanoi/types/game
 */

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed';

/** 柱子索引 (0, 1, 2) */
export type PegIndex = 0 | 1 | 2;

/** 圆盘数据 */
export interface Disk {
  /** 圆盘大小 (1 最小) */
  size: number;
  /** 圆盘颜色 */
  color: string;
}

/** 游戏状态 */
export interface HanoiState {
  /** 三根柱子的圆盘分布 */
  pegs: number[][];
  /** 当前步数 */
  moveCount: number;
  /** 游戏开始时间戳 */
  startTime: number;
  /** 游戏状态 */
  status: GameStatus;
  /** 当前选中的柱子 (点击模式) */
  selectedPeg: PegIndex | null;
  /** 当前层数 (3-8) */
  level: number;
}

/** 游戏统计 */
export interface HanoiStats {
  /** 最高解锁层数 */
  unlockedLevels: number;
  /** 每层最佳步数 */
  bestMoves: Record<number, number>;
  /** 总游戏次数 */
  totalGames: number;
  /** 总游戏时长 (秒) */
  totalTime: number;
}

/** 游戏配置 */
export interface HanoiConfig {
  /** 最小层数 */
  minLevel: number;
  /** 最大层数 */
  maxLevel: number;
  /** 圆盘颜色列表 */
  diskColors: string[];
  /** 动画持续时间 (ms) */
  animationDuration: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/types/game.ts
git commit -m "feat(hanoi): add game type definitions"
```

---

## Task 2: 创建游戏配置常量

**Files:**
- Create: `app/hanoi/constants/config.ts`

- [ ] **Step 1: 编写配置文件**

```typescript
/**
 * Hanoi Tower Game Constants
 *
 * @module hanoi/constants/config
 */

import { HanoiConfig } from '../types/game';

/** 游戏配置 */
export const HANOI_CONFIG: HanoiConfig = {
  minLevel: 3,
  maxLevel: 8,
  diskColors: [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
  ],
  animationDuration: 200,
};

/** localStorage 键名 */
export const STORAGE_KEY = 'hanoi-game-stats';

/** 画布尺寸 */
export const CANVAS = {
  width: 600,
  height: 400,
  pegWidth: 12,
  pegHeight: 200,
  diskHeight: 24,
  diskMaxWidth: 140,
  diskMinWidth: 40,
  pegSpacing: 200,
  baseHeight: 20,
};
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/constants/config.ts
git commit -m "feat(hanoi): add game constants"
```

---

## Task 3: 创建核心游戏 Hook

**Files:**
- Create: `app/hanoi/hooks/useHanoiGame.ts`

- [ ] **Step 1: 编写 useHanoiGame hook**

```typescript
/**
 * Hanoi Tower Game Logic Hook
 *
 * @module hanoi/hooks/useHanoiGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { HanoiState, HanoiStats, PegIndex, GameStatus } from '../types/game';
import { HANOI_CONFIG, STORAGE_KEY } from '../constants/config';

/** 获取初始状态 */
function getInitialState(level: number): HanoiState {
  const pegs: number[][] = [[], [], []];
  // 初始状态：所有圆盘在左边柱子 (从大到小)
  for (let i = level; i >= 1; i--) {
    pegs[0].push(i);
  }
  return {
    pegs,
    moveCount: 0,
    startTime: Date.now(),
    status: 'playing' as GameStatus,
    selectedPeg: null,
    level,
  };
}

/** 从 localStorage 加载统计 */
function loadStats(): HanoiStats {
  if (typeof window === 'undefined') {
    return { unlockedLevels: 3, bestMoves: {}, totalGames: 0, totalTime: 0 };
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return { ...JSON.parse(saved), unlockedLevels: Math.max(3, JSON.parse(saved).unlockedLevels || 3) };
  }
  return { unlockedLevels: 3, bestMoves: {}, totalGames: 0, totalTime: 0 };
}

/** 保存统计到 localStorage */
function saveStats(stats: HanoiStats): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }
}

/** 检查游戏是否完成 */
function checkComplete(pegs: number[][], level: number): boolean {
  return pegs[2].length === level;
}

/** 计算最优步数 (2^n - 1) */
export function getOptimalMoves(level: number): number {
  return Math.pow(2, level) - 1;
}

export function useHanoiGame() {
  const [state, setState] = useState<HanoiState>(() => getInitialState(3));
  const [stats, setStats] = useState<HanoiStats>(loadStats);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 计时器
  useEffect(() => {
    if (state.status === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.startTime]);

  // 保存统计
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  /** 开始新游戏 */
  const startGame = useCallback((level: number) => {
    setState(getInitialState(level));
    setElapsedTime(0);
  }, []);

  /** 重置当前游戏 */
  const resetGame = useCallback(() => {
    setState(getInitialState(state.level));
    setElapsedTime(0);
  }, [state.level]);

  /** 暂停/继续 */
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  /** 移动圆盘 */
  const moveDisk = useCallback((fromPeg: PegIndex, toPeg: PegIndex): boolean => {
    if (fromPeg === toPeg) return false;
    if (state.status !== 'playing') return false;

    const fromDisks = state.pegs[fromPeg];
    const toDisks = state.pegs[toPeg];

    if (fromDisks.length === 0) return false;

    const disk = fromDisks[fromDisks.length - 1];
    const topDisk = toDisks[toDisks.length - 1];

    // 只能把小圆盘放到大圆盘上
    if (topDisk && disk > topDisk) return false;

    const newPegs = state.pegs.map((peg, i) => {
      if (i === fromPeg) return peg.slice(0, -1);
      if (i === toPeg) return [...peg, disk];
      return peg;
    });

    const newMoveCount = state.moveCount + 1;
    const isComplete = checkComplete(newPegs, state.level);

    setState(prev => ({
      ...prev,
      pegs: newPegs as number[][],
      moveCount: newMoveCount,
      status: isComplete ? 'completed' : prev.status,
      selectedPeg: null,
    }));

    // 游戏完成时更新统计
    if (isComplete) {
      setStats(prev => {
        const newBestMoves = { ...prev.bestMoves };
        const currentBest = newBestMoves[state.level];
        if (!currentBest || newMoveCount < currentBest) {
          newBestMoves[state.level] = newMoveCount;
        }
        return {
          ...prev,
          unlockedLevels: Math.max(prev.unlockedLevels, state.level + 1),
          bestMoves: newBestMoves,
          totalGames: prev.totalGames + 1,
          totalTime: prev.totalTime + elapsedTime,
        };
      });
    }

    return true;
  }, [state.pegs, state.status, state.level, elapsedTime]);

  /** 选择柱子 (点击模式) */
  const selectPeg = useCallback((pegIndex: PegIndex) => {
    if (state.status !== 'playing') return;

    if (state.selectedPeg === null) {
      // 选择源柱子
      if (state.pegs[pegIndex].length > 0) {
        setState(prev => ({ ...prev, selectedPeg: pegIndex }));
      }
    } else if (state.selectedPeg === pegIndex) {
      // 取消选择
      setState(prev => ({ ...prev, selectedPeg: null }));
    } else {
      // 移动到目标柱子
      moveDisk(state.selectedPeg, pegIndex);
    }
  }, [state.selectedPeg, state.pegs, state.status, moveDisk]);

  return {
    state,
    stats,
    elapsedTime,
    startGame,
    resetGame,
    togglePause,
    moveDisk,
    selectPeg,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/hooks/useHanoiGame.ts
git commit -m "feat(hanoi): add useHanoiGame hook"
```

---

## Task 4: 创建游戏组件

### Task 4.1: HanoiBoard 组件

**Files:**
- Create: `app/hanoi/components/HanoiBoard.tsx`

- [ ] **Step 1: 编写 HanoiBoard 组件**

```typescript
/**
 * Hanoi Tower Game Board Component
 *
 * @module hanoi/components/HanoiBoard
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { PegIndex } from '../types/game';
import { HANOI_CONFIG, CANVAS } from '../constants/config';

interface HanoiBoardProps {
  pegs: number[][];
  selectedPeg: PegIndex | null;
  level: number;
  onPegClick: (pegIndex: PegIndex) => void;
  onDiskMove: (fromPeg: PegIndex, toPeg: PegIndex) => void;
}

export function HanoiBoard({
  pegs,
  selectedPeg,
  level,
  onPegClick,
  onDiskMove,
}: HanoiBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ fromPeg: PegIndex | null; diskSize: number }>({
    fromPeg: null,
    diskSize: 0,
  });

  // 绘制游戏画面
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // 绘制底座
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, CANVAS.height - CANVAS.baseHeight, CANVAS.width, CANVAS.baseHeight);

    // 绘制三根柱子
    const pegXPositions = [100, 300, 500];
    pegXPositions.forEach((x, index) => {
      // 柱子
      ctx.fillStyle = selectedPeg === index ? '#3b82f6' : '#6b7280';
      ctx.fillRect(
        x - CANVAS.pegWidth / 2,
        CANVAS.height - CANVAS.baseHeight - CANVAS.pegHeight,
        CANVAS.pegWidth,
        CANVAS.pegHeight
      );

      // 绘制该柱子上的圆盘
      const disks = pegs[index];
      disks.forEach((diskSize, diskIndex) => {
        const diskWidth =
          CANVAS.diskMinWidth +
          (diskSize - 1) * ((CANVAS.diskMaxWidth - CANVAS.diskMinWidth) / (level - 1 || 1));
        const diskY =
          CANVAS.height -
          CANVAS.baseHeight -
          (diskIndex + 1) * (CANVAS.diskHeight + 4);

        // 圆盘颜色
        ctx.fillStyle = HANOI_CONFIG.diskColors[diskSize - 1] || '#9ca3af';

        // 圆盘圆角矩形
        const radius = 8;
        ctx.beginPath();
        ctx.roundRect(x - diskWidth / 2, diskY, diskWidth, CANVAS.diskHeight, radius);
        ctx.fill();

        // 圆盘高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x - diskWidth / 2 + 4, diskY + 4, diskWidth - 8, 6, 4);
        ctx.fill();
      });
    });
  }, [pegs, selectedPeg, level]);

  // 处理点击
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scaleX = canvas.width / rect.width;
      const canvasX = x * scaleX;

      // 判断点击了哪根柱子
      const pegXPositions = [100, 300, 500];
      for (let i = 0; i < 3; i++) {
        if (Math.abs(canvasX - pegXPositions[i]) < 80) {
          onPegClick(i as PegIndex);
          break;
        }
      }
    },
    [onPegClick]
  );

  // 处理拖拽开始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      // 判断点击了哪根柱子的哪个圆盘
      const pegXPositions = [100, 300, 500];
      for (let i = 0; i < 3; i++) {
        if (Math.abs(canvasX - pegXPositions[i]) < 80) {
          const disks = pegs[i];
          if (disks.length > 0) {
            // 检查是否点击了最上面的圆盘
            const topDiskY =
              CANVAS.height -
              CANVAS.baseHeight -
              disks.length * (CANVAS.diskHeight + 4);
            if (canvasY >= topDiskY && canvasY <= topDiskY + CANVAS.diskHeight) {
              dragRef.current = { fromPeg: i as PegIndex, diskSize: disks[disks.length - 1] };
              return;
            }
          }
          break;
        }
      }
    },
    [pegs]
  );

  // 处理拖拽结束
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragRef.current.fromPeg === null) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scaleX = canvas.width / rect.width;
      const canvasX = x * scaleX;

      // 判断释放到了哪根柱子
      const pegXPositions = [100, 300, 500];
      for (let i = 0; i < 3; i++) {
        if (Math.abs(canvasX - pegXPositions[i]) < 80) {
          if (i !== dragRef.current.fromPeg) {
            onDiskMove(dragRef.current.fromPeg, i as PegIndex);
          }
          break;
        }
      }

      dragRef.current = { fromPeg: null, diskSize: 0 };
    },
    [onDiskMove]
  );

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS.width}
      height={CANVAS.height}
      className="w-full max-w-2xl cursor-pointer rounded-lg bg-slate-800 shadow-lg"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/components/HanoiBoard.tsx
git commit -m "feat(hanoi): add HanoiBoard component"
```

### Task 4.2: GameStats 组件

**Files:**
- Create: `app/hanoi/components/GameStats.tsx`

- [ ] **Step 1: 编写 GameStats 组件**

```typescript
/**
 * Hanoi Tower Game Statistics Component
 *
 * @module hanoi/components/GameStats
 */

'use client';

import { HanoiStats } from '../types/game';
import { getOptimalMoves } from '../hooks/useHanoiGame';

interface GameStatsProps {
  stats: HanoiStats;
  currentLevel: number;
  currentMoves: number;
  elapsedTime: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameStats({
  stats,
  currentLevel,
  currentMoves,
  elapsedTime,
}: GameStatsProps) {
  const bestMoves = stats.bestMoves[currentLevel];
  const optimalMoves = getOptimalMoves(currentLevel);

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-800 p-4 text-sm md:grid-cols-4">
      <div className="text-center">
        <div className="text-slate-400">当前步数</div>
        <div className="text-2xl font-bold text-white">{currentMoves}</div>
      </div>
      <div className="text-center">
        <div className="text-slate-400">最优步数</div>
        <div className="text-2xl font-bold text-emerald-400">{optimalMoves}</div>
      </div>
      <div className="text-center">
        <div className="text-slate-400">用时</div>
        <div className="text-2xl font-bold text-blue-400">{formatTime(elapsedTime)}</div>
      </div>
      <div className="text-center">
        <div className="text-slate-400">本层最佳</div>
        <div className="text-2xl font-bold text-amber-400">
          {bestMoves || '-'}
        </div>
      </div>
      <div className="col-span-2 text-center md:col-span-2">
        <div className="text-slate-400">总游戏次数</div>
        <div className="text-lg font-semibold text-white">{stats.totalGames}</div>
      </div>
      <div className="col-span-2 text-center md:col-span-2">
        <div className="text-slate-400">总游戏时长</div>
        <div className="text-lg font-semibold text-white">
          {formatTime(stats.totalTime)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/components/GameStats.tsx
git commit -m "feat(hanoi): add GameStats component"
```

### Task 4.3: LevelSelector 组件

**Files:**
- Create: `app/hanoi/components/LevelSelector.tsx`

- [ ] **Step 1: 编写 LevelSelector 组件**

```typescript
/**
 * Hanoi Tower Level Selector Component
 *
 * @module hanoi/components/LevelSelector
 */

'use client';

import { HANOI_CONFIG } from '../constants/config';
import { getOptimalMoves } from '../hooks/useHanoiGame';

interface LevelSelectorProps {
  unlockedLevels: number;
  currentLevel: number;
  onSelectLevel: (level: number) => void;
}

export function LevelSelector({
  unlockedLevels,
  currentLevel,
  onSelectLevel,
}: LevelSelectorProps) {
  const levels = Array.from(
    { length: HANOI_CONFIG.maxLevel - HANOI_CONFIG.minLevel + 1 },
    (_, i) => i + HANOI_CONFIG.minLevel
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {levels.map(level => {
        const isUnlocked = level <= unlockedLevels;
        const isActive = level === currentLevel;

        return (
          <button
            key={level}
            onClick={() => isUnlocked && onSelectLevel(level)}
            disabled={!isUnlocked}
            className={`
              relative rounded-lg px-4 py-2 font-semibold transition-all
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : isUnlocked
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }
            `}
          >
            <div className="text-lg">{level}层</div>
            <div className="text-xs opacity-70">最优: {getOptimalMoves(level)}步</div>
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/components/LevelSelector.tsx
git commit -m "feat(hanoi): add LevelSelector component"
```

---

## Task 5: 创建游戏元数据

**Files:**
- Create: `app/hanoi/meta.ts`

- [ ] **Step 1: 编写元数据文件**

```typescript
/**
 * 汉诺塔游戏元数据
 *
 * @module hanoi/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const hanoiMeta: GameMeta = {
  id: 'hanoi',
  name: '汉诺塔',
  description:
    '经典递归益智游戏。将所有圆盘从左边柱子移动到右边柱子，每次只能移动一个圆盘，且大圆盘不能放在小圆盘上。',
  icon: '🗼',
  tags: ['益智', '经典', '数学'],
  gradient: 'from-indigo-600 via-purple-600 to-pink-600',
  iconBg: 'from-indigo-500/20 to-purple-500/20',
  glowColor: 'hover:shadow-purple-500/20',
};
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/meta.ts
git commit -m "feat(hanoi): add game metadata"
```

---

## Task 6: 创建游戏页面

**Files:**
- Create: `app/hanoi/page.tsx`

- [ ] **Step 1: 编写页面组件**

```typescript
/**
 * Hanoi Tower Game Page
 *
 * @module hanoi/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { useHanoiGame, getOptimalMoves } from './hooks/useHanoiGame';
import { HanoiBoard } from './components/HanoiBoard';
import { GameStats } from './components/GameStats';
import { LevelSelector } from './components/LevelSelector';

export default function HanoiPage() {
  const {
    state,
    stats,
    elapsedTime,
    startGame,
    resetGame,
    togglePause,
    moveDisk,
    selectPeg,
  } = useHanoiGame();

  return (
    <GameLayout title="汉诺塔" backHref="/">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
        {/* 层数选择器 */}
        <LevelSelector
          unlockedLevels={stats.unlockedLevels}
          currentLevel={state.level}
          onSelectLevel={startGame}
        />

        {/* 统计面板 */}
        <GameStats
          stats={stats}
          currentLevel={state.level}
          currentMoves={state.moveCount}
          elapsedTime={elapsedTime}
        />

        {/* 游戏画布 */}
        <div className="relative">
          <HanoiBoard
            pegs={state.pegs}
            selectedPeg={state.selectedPeg}
            level={state.level}
            onPegClick={selectPeg}
            onDiskMove={moveDisk}
          />

          {/* 暂停遮罩 */}
          {state.status === 'paused' && (
            <GameOverlay
              title="游戏暂停"
              actionText="继续游戏"
              onAction={togglePause}
            />
          )}

          {/* 完成遮罩 */}
          {state.status === 'completed' && (
            <GameOverlay
              title="🎉 恭喜通关！"
              message={`你用 ${state.moveCount} 步完成了 ${state.level} 层汉诺塔！\n最优步数是 ${getOptimalMoves(state.level)} 步。`}
              actionText="下一关"
              onAction={() => startGame(state.level + 1)}
              secondaryActionText="重玩本关"
              onSecondaryAction={resetGame}
            />
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={togglePause}
            disabled={state.status === 'completed'}
            className="rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.status === 'paused' ? '继续' : '暂停'}
          </button>
          <button
            onClick={resetGame}
            className="rounded-lg bg-slate-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-slate-700"
          >
            重置
          </button>
        </div>

        {/* 操作说明 */}
        <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
          <h3 className="mb-2 font-semibold text-white">操作说明</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>点击模式：先点击源柱子，再点击目标柱子移动圆盘</li>
            <li>拖拽模式：按住最上面的圆盘拖拽到目标柱子</li>
            <li>规则：每次只能移动一个圆盘，大圆盘不能放在小圆盘上</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hanoi/page.tsx
git commit -m "feat(hanoi): add game page"
```

---

## Task 7: 注册游戏到系统

**Files:**
- Modify: `lib/registry.ts`

- [ ] **Step 1: 导入并注册汉诺塔游戏**

在 `lib/registry.ts` 中添加：

```typescript
// 在文件顶部添加导入
import { hanoiMeta } from '@/app/hanoi/meta';

// 在 GAME_REGISTRY 数组中添加
export const GAME_REGISTRY: GameMeta[] = [
  // ... 其他游戏
  hanoiMeta,  // 添加到数组末尾或合适位置
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/registry.ts
git commit -m "feat(hanoi): register game in registry"
```

---

## Task 8: 验证和测试

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 2: 运行 ESLint 检查**

```bash
npm run lint
```

Expected: 无 lint 错误

- [ ] **Step 3: 启动开发服务器验证**

```bash
npm run dev
```

打开 http://localhost:3000/hanoi 验证：
- 游戏页面正常加载
- 层数选择器显示正确
- 点击/拖拽操作正常
- 游戏完成检测正确
- 统计信息保存正确

- [ ] **Step 4: 最终 Commit**

```bash
git add .
git commit -m "feat(hanoi): complete hanoi tower game implementation"
```

---

## Spec Coverage Check

| 需求 | 实现任务 |
|------|----------|
| 渐进难度 (3-8层) | Task 3 (useHanoiGame), Task 4.3 (LevelSelector) |
| 混合交互 (点击+拖拽) | Task 4.1 (HanoiBoard) |
| 完整统计 | Task 3 (useHanoiGame), Task 4.2 (GameStats) |
| 遵循项目结构 | 所有任务 |
| 注册到系统 | Task 7 |

---

## Placeholder Scan

- [x] 无 "TBD", "TODO", "implement later"
- [x] 无模糊的 "添加错误处理"
- [x] 所有代码步骤包含完整代码
- [x] 类型名称一致
