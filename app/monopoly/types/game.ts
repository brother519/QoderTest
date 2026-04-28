/**
 * 大富翁游戏类型定义
 */

import { BaseGameStatus } from '@/lib/types/game';

/** 游戏状态（扩展基础状态） */
export type GameStatus = BaseGameStatus | 'won';

/**
 * 当前回合操作阶段
 * - waiting: 等待掷骰子
 * - rolled: 已掷骰，处理落格（过渡态）
 * - buying: 弹出购买确认
 * - paying: 缴租提示（过渡态，自动推进）
 * - chance: 展示机会/命运卡
 * - jailed: 入狱提示
 * - upgrading: 升级地产
 */
export type GamePhase =
  | 'waiting'
  | 'rolled'
  | 'buying'
  | 'paying'
  | 'chance'
  | 'jailed'
  | 'upgrading';

/** 棋盘格子类型 */
export type CellType =
  | 'start'      // 起点（0号格）
  | 'property'   // 地产
  | 'chance'     // 机会
  | 'community'  // 命运（公共基金）
  | 'tax'        // 税收
  | 'jail'       // 监狱/探视
  | 'go_jail'    // 去监狱
  | 'free'       // 免费停车
  | 'utility';   // 公共设施（水电）

/** 地产颜色组 */
export type PropertyGroup =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'utility';

/** 玩家颜色 */
export type PlayerColor = 'cyan' | 'rose' | 'amber' | 'violet';

/** 棋盘格子定义 */
export interface BoardCell {
  index: number;
  type: CellType;
  name: string;
  group?: PropertyGroup;
  price?: number;
  /** 租金表：[基础, 1栋, 2栋, 3栋] */
  rents?: [number, number, number, number];
  upgradeCost?: number;
  taxAmount?: number;
}

/** 地产运营状态 */
export interface PropertyState {
  cellIndex: number;
  ownerId: string | null;
  /** 房屋等级：0=空地, 1=1栋, 2=2栋, 3=3栋 */
  houseLevel: 0 | 1 | 2 | 3;
}

/** 玩家状态 */
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  position: number;
  money: number;
  bankrupt: boolean;
  inJail: boolean;
  jailTurns: number;
}

/** 骰子结果 */
export interface DiceResult {
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
}

/** 机会/命运卡效果 */
export type CardEffect =
  | { type: 'money'; amount: number }
  | { type: 'move'; target: number }
  | { type: 'move_relative'; steps: number }
  | { type: 'go_jail' }
  | { type: 'free_jail' }
  | { type: 'collect_from_all'; amount: number };

/** 机会/命运卡 */
export interface ChanceCard {
  id: string;
  text: string;
  effect: CardEffect;
}

/** 大富翁游戏完整状态 */
export interface MonopolyGameState {
  status: GameStatus;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  properties: Record<number, PropertyState>;
  lastDice: DiceResult | null;
  currentCard: ChanceCard | null;
  message: string;
  winnerId: string | null;
  doubleCount: number;
}
