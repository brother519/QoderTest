/**
 * 大富翁游戏配置
 * 28格环形棋盘 + 卡牌 + 颜色配置
 */

import { BoardCell, ChanceCard, PlayerColor } from '../types/game';

/** 总格子数 */
export const TOTAL_CELLS = 28;

/** 初始金额 */
export const INITIAL_MONEY = 1500;

/** 经过起点工资 */
export const GO_SALARY = 200;

/** 保释金 */
export const JAIL_BAIL = 100;

/** 最大坐牢回合数 */
export const MAX_JAIL_TURNS = 3;

/** 监狱格索引 */
export const JAIL_CELL = 7;

/** 去监狱格索引 */
export const GO_JAIL_CELL = 21;

/**
 * 28格棋盘定义
 * 底边(0-6): 右→左
 * 左边(7-13): 下→上
 * 顶边(14-20): 左→右
 * 右边(21-27): 上→下
 */
export const BOARD_CELLS: BoardCell[] = [
  // ── 底边 0-6 ──
  {
    index: 0,
    type: 'start',
    name: '起点',
  },
  {
    index: 1,
    type: 'property',
    name: '地中海大道',
    group: 'brown',
    price: 60,
    rents: [2, 10, 30, 90],
    upgradeCost: 50,
  },
  {
    index: 2,
    type: 'community',
    name: '命运',
  },
  {
    index: 3,
    type: 'property',
    name: '波罗的海大道',
    group: 'brown',
    price: 60,
    rents: [4, 20, 60, 180],
    upgradeCost: 50,
  },
  {
    index: 4,
    type: 'tax',
    name: '所得税',
    taxAmount: 200,
  },
  {
    index: 5,
    type: 'property',
    name: '东方大道',
    group: 'light-blue',
    price: 100,
    rents: [6, 30, 90, 270],
    upgradeCost: 50,
  },
  {
    index: 6,
    type: 'chance',
    name: '机会',
  },
  // ── 左边 7-13 ──
  {
    index: 7,
    type: 'jail',
    name: '监狱/探视',
  },
  {
    index: 8,
    type: 'property',
    name: '佛蒙特大道',
    group: 'light-blue',
    price: 100,
    rents: [6, 30, 90, 270],
    upgradeCost: 50,
  },
  {
    index: 9,
    type: 'property',
    name: '康涅狄格大道',
    group: 'light-blue',
    price: 120,
    rents: [8, 40, 100, 300],
    upgradeCost: 50,
  },
  {
    index: 10,
    type: 'property',
    name: '圣查尔斯广场',
    group: 'pink',
    price: 140,
    rents: [10, 50, 150, 450],
    upgradeCost: 100,
  },
  {
    index: 11,
    type: 'utility',
    name: '电力公司',
    group: 'utility',
    price: 150,
    rents: [25, 50, 75, 100],
    upgradeCost: 0,
  },
  {
    index: 12,
    type: 'property',
    name: '弗吉尼亚大道',
    group: 'pink',
    price: 160,
    rents: [12, 60, 180, 500],
    upgradeCost: 100,
  },
  {
    index: 13,
    type: 'chance',
    name: '机会',
  },
  // ── 顶边 14-20 ──
  {
    index: 14,
    type: 'free',
    name: '免费停车',
  },
  {
    index: 15,
    type: 'property',
    name: '圣詹姆斯广场',
    group: 'orange',
    price: 180,
    rents: [14, 70, 200, 550],
    upgradeCost: 100,
  },
  {
    index: 16,
    type: 'community',
    name: '命运',
  },
  {
    index: 17,
    type: 'property',
    name: '田纳西大道',
    group: 'orange',
    price: 180,
    rents: [14, 70, 200, 550],
    upgradeCost: 100,
  },
  {
    index: 18,
    type: 'property',
    name: '纽约大道',
    group: 'orange',
    price: 200,
    rents: [16, 80, 220, 600],
    upgradeCost: 100,
  },
  {
    index: 19,
    type: 'property',
    name: '肯塔基大道',
    group: 'red',
    price: 220,
    rents: [18, 90, 250, 700],
    upgradeCost: 150,
  },
  {
    index: 20,
    type: 'chance',
    name: '机会',
  },
  // ── 右边 21-27 ──
  {
    index: 21,
    type: 'go_jail',
    name: '去监狱',
  },
  {
    index: 22,
    type: 'property',
    name: '印第安纳大道',
    group: 'red',
    price: 220,
    rents: [18, 90, 250, 700],
    upgradeCost: 150,
  },
  {
    index: 23,
    type: 'property',
    name: '伊利诺伊大道',
    group: 'red',
    price: 240,
    rents: [20, 100, 300, 750],
    upgradeCost: 150,
  },
  {
    index: 24,
    type: 'utility',
    name: '自来水公司',
    group: 'utility',
    price: 150,
    rents: [25, 50, 75, 100],
    upgradeCost: 0,
  },
  {
    index: 25,
    type: 'property',
    name: '大西洋大道',
    group: 'yellow',
    price: 260,
    rents: [22, 110, 330, 800],
    upgradeCost: 150,
  },
  {
    index: 26,
    type: 'property',
    name: '文特诺大道',
    group: 'yellow',
    price: 260,
    rents: [22, 110, 330, 800],
    upgradeCost: 150,
  },
  {
    index: 27,
    type: 'tax',
    name: '奢侈税',
    taxAmount: 100,
  },
];

/** 机会卡（10张）*/
export const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 'c1',
    text: '前进到起点，领取 $200！',
    effect: { type: 'move', target: 0 },
  },
  {
    id: 'c2',
    text: '银行错误入账，获得 $200！',
    effect: { type: 'money', amount: 200 },
  },
  {
    id: 'c3',
    text: '你中了彩票，获得 $100！',
    effect: { type: 'money', amount: 100 },
  },
  {
    id: 'c4',
    text: '交通罚款，支付 $15！',
    effect: { type: 'money', amount: -15 },
  },
  {
    id: 'c5',
    text: '房屋维修费，每栋支付 $25！',
    effect: { type: 'money', amount: -50 },
  },
  {
    id: 'c6',
    text: '直接进监狱！',
    effect: { type: 'go_jail' },
  },
  {
    id: 'c7',
    text: '获得免出监狱卡！',
    effect: { type: 'free_jail' },
  },
  {
    id: 'c8',
    text: '后退 3 格！',
    effect: { type: 'move_relative', steps: -3 },
  },
  {
    id: 'c9',
    text: '生日快乐！向每位玩家收取 $50！',
    effect: { type: 'collect_from_all', amount: 50 },
  },
  {
    id: 'c10',
    text: '出行补贴，获得 $150！',
    effect: { type: 'money', amount: 150 },
  },
];

/** 命运卡（7张）*/
export const COMMUNITY_CARDS: ChanceCard[] = [
  {
    id: 'com1',
    text: '医疗费用，支付 $100！',
    effect: { type: 'money', amount: -100 },
  },
  {
    id: 'com2',
    text: '售卖旧货，获得 $50！',
    effect: { type: 'money', amount: 50 },
  },
  {
    id: 'com3',
    text: '节日福利，获得 $100！',
    effect: { type: 'money', amount: 100 },
  },
  {
    id: 'com4',
    text: '前进到起点，领取 $200！',
    effect: { type: 'move', target: 0 },
  },
  {
    id: 'com5',
    text: '缴纳学校税，支付 $150！',
    effect: { type: 'money', amount: -150 },
  },
  {
    id: 'com6',
    text: '银行分红，获得 $50！',
    effect: { type: 'money', amount: 50 },
  },
  {
    id: 'com7',
    text: '获得免出监狱卡！',
    effect: { type: 'free_jail' },
  },
];

/** 玩家颜色配置 */
export const PLAYER_COLORS: Record<
  string,
  { color: string; bg: string; border: string; text: string; token: string }
> = {
  cyan: {
    color: 'cyan',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    token: '🔵',
  },
  rose: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-400',
    token: '🔴',
  },
  amber: {
    color: 'amber',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-400',
    token: '🟡',
  },
  violet: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500',
    text: 'text-violet-400',
    token: '🟣',
  },
};

/** 地产颜色组对应的 Tailwind 颜色 */
export const GROUP_COLORS: Record<string, string> = {
  brown: 'bg-yellow-900',
  'light-blue': 'bg-sky-400',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-600',
  utility: 'bg-gray-500',
};
