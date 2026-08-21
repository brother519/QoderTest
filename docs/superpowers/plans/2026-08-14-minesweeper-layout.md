# Minesweeper One-Screen Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-AGENT SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Minesweeper page layout so the game board and essential info fit on a single screen without scrolling the main page.

**Architecture:** Convert the vertically-stacked page into a constrained `h-screen flex flex-col` layout. Compact the header, controls, and stats into horizontal bars, and make the board container fill the remaining space with internal scrolling if needed.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS.

---

### Task 1: Compact the page wrapper and header

**Files:**
- Modify: `app/minesweeper/page.tsx`

- [ ] **Step 1: Update GameLayout and outer container**

Change the `GameLayout` call so the page is constrained to the viewport and uses flex column layout. Replace the decorative blur and top padding.

```tsx
<GameLayout
  title="扫雷"
  className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_38%),linear-gradient(180deg,#03131b_0%,#08111f_45%,#111827_100%)] h-screen flex flex-col py-4 px-3"
>
  <div className="relative max-w-7xl mx-auto w-full flex flex-col min-h-0">
```

- [ ] **Step 2: Compact the header**

Replace the existing centered header block with a compact inline header.

Old:
```tsx
<div className="text-center space-y-3">
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100/70 text-sm">
    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
    经典逻辑游戏 · 首击安全 · 长按插旗
  </div>
  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.16)]">
    💣 扫雷
  </h1>
  <p className="max-w-2xl mx-auto text-cyan-50/70 leading-relaxed text-sm md:text-base">
    左键揭开格子，右键或长按标记地雷。首次点击与周围 8 格绝对安全，尽可能用最短时间完成整局排雷。
  </p>
</div>
```

New:
```tsx
<div className="flex items-center justify-center gap-3 mb-3 shrink-0">
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100/70 text-xs">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
    经典逻辑 · 首击安全 · 长按插旗
  </div>
  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.16)]">
    💣 扫雷
  </h1>
</div>
```

- [ ] **Step 3: Remove the bottom help cards section**

Delete the entire `<div className="grid gap-3 md:grid-cols-3 text-sm">...</div>` block near the bottom of the page.

- [ ] **Step 4: Wrap board area in a flex viewport**

Replace the existing board wrapper:

Old:
```tsx
<div className="rounded-[32px] border border-cyan-400/10 bg-white/[0.03] backdrop-blur-sm px-3 py-4 md:px-5 md:py-6 shadow-[0_24px_80px_rgba(2,12,27,0.45)]">
  <Board ... />
</div>
```

New:
```tsx
<div className="flex-1 min-h-0 rounded-[32px] border border-cyan-400/10 bg-white/[0.03] backdrop-blur-sm px-3 py-4 md:px-5 md:py-6 shadow-[0_24px_80px_rgba(2,12,27,0.45)] overflow-hidden">
  <Board ... />
</div>
```

- [ ] **Step 5: Verify with lint**

Run:
```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/minesweeper/page.tsx
git commit -m "refactor(minesweeper): compact page wrapper and header for one-screen layout"
```

---

### Task 2: Compact the Controls component

**Files:**
- Modify: `app/minesweeper/components/Controls.tsx`

- [ ] **Step 1: Rewrite Controls layout**

Replace the entire component body with the compact horizontal layout.

```tsx
export function Controls({
  difficultyKey,
  remainingMines,
  elapsedTime,
  bestTime,
  status,
  onChangeDifficulty,
  onRestart,
}: ControlsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-2 shrink-0">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">状态</div>
            <div className="mt-0.5 text-sm font-bold text-white">{STATUS_LABELS[status]}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">剩余地雷</div>
            <div className="mt-0.5 text-lg font-bold text-rose-300 tabular-nums">{remainingMines}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">计时器</div>
            <div className="mt-0.5 text-lg font-bold text-white tabular-nums">{formatTime(elapsedTime)}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/55 backdrop-blur-sm px-3 py-2 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/60">最佳时间</div>
            <div className="mt-0.5 text-lg font-bold text-emerald-300 tabular-nums">
              {bestTime === null ? '--:--' : formatTime(bestTime)}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          重新开局
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/45 backdrop-blur-sm p-1">
        <div className="grid grid-cols-3 gap-1">
          {DIFFICULTY_ORDER.map((key) => {
            const option = DIFFICULTIES[key];
            const isActive = key === difficultyKey;

            return (
              <button
                key={key}
                onClick={() => onChangeDifficulty(key)}
                className={[
                  'rounded-xl px-2 py-2 text-left border transition-all duration-200',
                  isActive
                    ? 'border-cyan-300/70 bg-cyan-400/15 shadow-lg shadow-cyan-500/10'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <div className="text-xs font-semibold text-white">{option.label}</div>
                <div className="text-[10px] text-cyan-100/60 tabular-nums">
                  {option.rows}×{option.cols} · {option.mines} 雷
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with lint**

Run:
```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/minesweeper/components/Controls.tsx
git commit -m "refactor(minesweeper): compact controls into horizontal dashboard"
```

---

### Task 3: Convert StatsPanel to a thin horizontal strip

**Files:**
- Modify: `app/minesweeper/components/StatsPanel.tsx`

- [ ] **Step 1: Rewrite StatsPanel layout**

Replace the entire component body with the compact horizontal strip.

```tsx
export function StatsPanel({ stats }: StatsPanelProps) {
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-950/45 px-3 py-2 shrink-0">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-black text-cyan-300">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">总局数</div>
        </div>
        <div>
          <div className="text-lg font-black text-emerald-300">{stats.gamesWon}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">胜利</div>
        </div>
        <div>
          <div className="text-lg font-black text-amber-300">{winRate}%</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">胜率</div>
        </div>
        <div>
          <div className="text-lg font-black text-cyan-200 tabular-nums">{formatTime(stats.totalTime)}</div>
          <div className="text-[10px] text-cyan-50/60 mt-0.5">总用时</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with lint**

Run:
```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/minesweeper/components/StatsPanel.tsx
git commit -m "refactor(minesweeper): convert stats panel to thin horizontal strip"
```

---

### Task 4: Ensure the board scrolls internally

**Files:**
- Modify: `app/minesweeper/components/Board.tsx`

- [ ] **Step 1: Make the board container fill available space**

Replace the outer wrapper so it fills height and scrolls internally if needed.

Old:
```tsx
<div className="w-full overflow-x-auto pb-2">
  <div className="relative inline-block min-w-max mx-auto">
```

New:
```tsx
<div className="w-full h-full overflow-auto pb-2">
  <div className="relative inline-block min-w-max mx-auto">
```

- [ ] **Step 2: Verify with lint**

Run:
```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/minesweeper/components/Board.tsx
git commit -m "refactor(minesweeper): make board fill flex viewport and scroll internally"
```

---

### Task 5: Verify end-to-end layout

**Files:**
- None (verification only)

- [ ] **Step 1: Run the dev server**

Run:
```bash
npm run dev
```

- [ ] **Step 2: Open the game in a browser**

Navigate to `http://localhost:3000/minesweeper`.

- [ ] **Step 3: Check each difficulty**

Switch to beginner, intermediate, and expert. Confirm:
- The board is visible without scrolling the main page.
- The expert board scrolls horizontally if the window is narrow.
- The board is usable (cells can be revealed/flagged).

- [ ] **Step 4: Run tests**

Run:
```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Final lint check**

Run:
```bash
npm run lint
```

Expected: no errors.

---

## Spec Coverage

| Spec requirement | Task |
|---|---|
| Page constrained to viewport height | Task 1 |
| Compact header (inline tag + title, no description) | Task 1 |
| Remove help cards | Task 1 |
| Horizontal dashboard for status/mines/timer/best time | Task 2 |
| Compact difficulty tabs | Task 2 |
| Thin horizontal stats strip | Task 3 |
| Board fills remaining space and scrolls internally | Task 1, Task 4 |
| Beginner/intermediate/expert fit on screen | Task 5 |
| Lint/tests pass | All tasks |

## Placeholder Scan

- No TBD/TODO entries.
- No vague "add appropriate styling" steps.
- All code blocks contain concrete code.
- All file paths are exact.
