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
];
