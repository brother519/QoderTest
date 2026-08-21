# Minesweeper One-Screen Layout Design

## Goal

Keep the Minesweeper game board and all essential game info visible within a single viewport, eliminating the need to scroll the page to reach the board.

## Current Problem

The Minesweeper page stacks a large header, controls, difficulty selector, stats panel, the board, and help cards vertically. On common laptop screens (especially for the 16×30 expert board), the board is pushed below the fold.

## Proposed Layout

### High-level structure

```
┌─────────────────────────────────────┐
│ ← 返回   [tag] 💣 扫雷              │  compact header
├─────────────────────────────────────┤
│ 状态 │ 雷 │ 计时 │ 最佳 │ 重新开局 │  horizontal dashboard
│ 初级 │ 中级 │ 高级                  │  difficulty tabs
│ 总局 │ 胜 │ 胜率 │ 总用时           │  thin stats strip
├─────────────────────────────────────┤
│                                     │
│              BOARD                  │  flex viewport (scrolls internally if needed)
│                                     │
└─────────────────────────────────────┘
```

### Detailed changes

1. **Page wrapper (`app/minesweeper/page.tsx`)**
   - Use `h-screen flex flex-col` so the page never exceeds the viewport height.
   - Reduce vertical padding from `py-8` to `py-4`.
   - Remove the decorative blur element to save vertical space.

2. **Header**
   - Inline the tag and title on a single row.
   - Remove the descriptive paragraph (controls already explain the rules).

3. **Controls (`app/minesweeper/components/Controls.tsx`)**
   - Place status, remaining mines, timer, and best time in one horizontal row of compact cards.
   - Move the "重新开局" button next to the dashboard row.
   - Render difficulty options as small, compact tabs directly below the dashboard.

4. **Stats panel (`app/minesweeper/components/StatsPanel.tsx`)**
   - Convert to a thin horizontal strip with smaller numbers.
   - Show games played, wins, win rate, and total time in one row.

5. **Board container (`app/minesweeper/components/Board.tsx`)**
   - Wrap the board in a `flex-1 min-h-0` container so it fills the remaining viewport space.
   - Keep `overflow-x-auto` for wide expert boards.
   - Add `overflow-y-auto` so tall boards scroll internally instead of pushing the page height.

6. **Help cards**
   - Remove from the main page to reclaim vertical space.
   - (Optional future enhancement: add a small help icon/tooltip if needed.)

## Components Affected

- `app/minesweeper/page.tsx`
- `app/minesweeper/components/Controls.tsx`
- `app/minesweeper/components/StatsPanel.tsx`
- `app/minesweeper/components/Board.tsx`

## Data Flow

No data flow or game logic changes. Only layout and styling change.

## Testing / Success Criteria

- On beginner (9×9), intermediate (16×16), and expert (16×30) difficulties, the board is visible without scrolling the main page on a 768 px tall viewport.
- The expert board remains horizontally scrollable if the viewport is too narrow.
- Existing game functionality (reveal, flag, chord, restart, difficulty switch) is unaffected.
- `npm run lint` and `npm test` still pass.
