/**
 * 游戏注册表
 *
 * 所有游戏的元数据集中注册处。
 * 添加新游戏时，只需：
 *   1. 在 app/<game-id>/ 下创建 meta.ts
 *   2. 在此文件导入并加入 GAME_REGISTRY 数组
 *
 * 首页和其他需要遍历游戏列表的地方统一读取此注册表。
 *
 * @module lib/registry
 */

import { GameMeta } from './types/registry';
import { linkMatchMeta } from '@/app/link-match/meta';
import { snakeMeta } from '@/app/snake/meta';
import { tetrisMeta } from '@/app/tetris/meta';
import { tankBattleMeta } from '@/app/tank-battle/meta';
import { whackAMoleMeta } from '@/app/whack-a-mole/meta';
import { minesweeperMeta } from '@/app/minesweeper/meta';
import { monopolyMeta } from '@/app/monopoly/meta';
import { aircraftMeta } from '@/app/aircraft-battle/meta';
import { matchThreeMeta } from '@/app/match-three/meta';
import { puzzle2048Meta } from '@/app/puzzle-2048/meta';
import { klotskiMeta } from '@/app/klotski/meta';
import { hanoiMeta } from '@/app/hanoi/meta';
import { sokobanMeta } from '@/app/sokoban/meta';
import { lightsOutMeta } from '@/app/lights-out/meta';
import { sudokuMeta } from '@/app/sudoku/meta';
import { ticTacToeMeta } from '@/app/tic-tac-toe/meta';
import { slidingPuzzleMeta } from '@/app/sliding-puzzle/meta';
import { colorSortMeta } from '@/app/color-sort/meta';
import { memoryCardMeta } from '@/app/memory-card/meta';
import { nonogramMeta } from '@/app/nonogram/meta';
import { pipePuzzleMeta } from '@/app/pipe-puzzle/meta';
import { guessNumberMeta } from '@/app/guess-number/meta';
import { oneStrokeMeta } from '@/app/one-stroke/meta';
import { gomokuMeta } from '@/app/gomoku/meta';
import { rubiksCubeMeta } from '@/app/rubiks-cube/meta';
import { mazeMeta } from '@/app/maze/meta';
import { hanziWordleMeta } from '@/app/hanzi-wordle/meta';
import { hanziRiddleMeta } from '@/app/hanzi-riddle/meta';
import { flowFreeMeta } from '@/app/flow-free/meta';
import { tangramMeta } from '@/app/tangram/meta';

/** 所有已注册的游戏列表 */
export const GAME_REGISTRY: GameMeta[] = [
  linkMatchMeta,
  snakeMeta,
  tetrisMeta,
  tankBattleMeta,
  whackAMoleMeta,
  minesweeperMeta,
  monopolyMeta,
  aircraftMeta,
  matchThreeMeta,
  puzzle2048Meta,
  klotskiMeta,
  hanoiMeta,
  sokobanMeta,
  lightsOutMeta,
  sudokuMeta,
  ticTacToeMeta,
  slidingPuzzleMeta,
  colorSortMeta,
  memoryCardMeta,
  nonogramMeta,
  pipePuzzleMeta,
  guessNumberMeta,
  gomokuMeta,
  oneStrokeMeta,
  rubiksCubeMeta,
  mazeMeta,
  flowFreeMeta,
  hanziWordleMeta,
  hanziRiddleMeta,
  tangramMeta,
];
